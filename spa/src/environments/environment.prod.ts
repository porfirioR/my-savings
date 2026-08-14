export const environment = {
  production: true,
  apiUrl: '/api',
  // Replaced at CI build time (see azure-static-web-apps.yml) from GitHub Secrets -
  // never the service_role/secret key, that one must stay server-side only.
  supabaseUrl: '__SUPABASE_URL__',
  supabaseAnonKey: '__SUPABASE_ANON_KEY__',
};
