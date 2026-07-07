import { ConflictException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { UNIQUE_CONSTRAINT_ERRORS } from './unique-constraint-errors';

export abstract class BaseAccessService {
  protected dbContext: SupabaseClient<any, 'public', any>;

  constructor(protected readonly dbContextService: DbContextService) {
    this.dbContext = this.dbContextService.getConnection();
  }

  /**
   * Throws a ConflictException with a stable, translatable error code for
   * known unique-constraint violations (see unique-constraint-errors.ts),
   * or a generic Error for anything else. Use this instead of
   * `if (error) throw new Error(error.message)` on any insert/update that
   * could plausibly violate one of those constraints.
   */
  protected throwIfError(error: { code?: string; message: string } | null): void {
    if (!error) return;
    if (error.code === '23505') {
      const constraintName = Object.keys(UNIQUE_CONSTRAINT_ERRORS).find((key) =>
        error.message.includes(key),
      );
      if (constraintName) {
        throw new ConflictException(UNIQUE_CONSTRAINT_ERRORS[constraintName]);
      }
    }
    throw new Error(error.message);
  }
}
