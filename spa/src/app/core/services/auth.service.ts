import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppUser {
  id: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly supabase: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

  user = signal<AppUser | null>(null);
  accessToken = signal<string | null>(null);
  checked = signal(false);

  async loadUser(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    await this.applySession(data.session?.access_token ?? null, data.session?.user ?? null);
    this.checked.set(true);
  }

  /** Returns an error message key/string on failure, or null on success. */
  async login(email: string, password: string): Promise<string | null> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;

    const ok = await this.applySession(data.session?.access_token ?? null, data.user);
    this.checked.set(true);
    return ok ? null : 'UNAUTHORIZED';
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.user.set(null);
    this.accessToken.set(null);
  }

  private async applySession(token: string | null, supabaseUser: Pick<User, 'id' | 'email'> | null): Promise<boolean> {
    if (!token || !supabaseUser) {
      this.user.set(null);
      this.accessToken.set(null);
      return false;
    }

    // Set the token first so the auth interceptor attaches it to the /auth/me check below.
    this.accessToken.set(token);
    const authorized = await this.verifyAuthorized();
    if (!authorized) {
      await this.supabase.auth.signOut();
      this.user.set(null);
      this.accessToken.set(null);
      return false;
    }

    this.user.set({ id: supabaseUser.id, email: supabaseUser.email ?? '' });
    return true;
  }

  private async verifyAuthorized(): Promise<boolean> {
    try {
      await firstValueFrom(this.http.get(`${environment.apiUrl}/auth/me`));
      return true;
    } catch {
      return false;
    }
  }
}
