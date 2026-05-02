import { createClient } from '@supabase/supabase-js';

export async function deleteTestGroup(groupId: string): Promise<void> {
  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );
  await client.from('groups').delete().eq('id', groupId);
}
