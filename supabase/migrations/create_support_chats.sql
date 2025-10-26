-- Create support_chats table
create table if not exists public.support_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  message text not null,
  sender_type text check (sender_type in ('user', 'ai', 'agent')) not null,
  timestamp timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.support_chats enable row level security;

-- RLS Policy: Users can only see their own messages
create policy "User can view own chats" on public.support_chats
  for select using (auth.uid() = user_id);

-- RLS Policy: Users can insert their own messages
create policy "User can insert own chat" on public.support_chats
  for insert with check (auth.uid() = user_id);

-- RLS Policy: Agents can view assigned org chats
create policy "Agent can view org chats" on public.support_chats
  for select using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'support' and org_id = support_chats.org_id
  ));

-- RLS Policy: Agents can insert messages for assigned orgs
create policy "Agent can insert org chat" on public.support_chats
  for insert with check (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'support' and org_id = support_chats.org_id
  ));
