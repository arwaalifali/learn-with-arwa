create table if not exists public.feedback (
  id bigserial primary key,
  submitted_at timestamptz not null default now(),
  name text not null default '',
  found_via text not null default '',
  rating integer not null check (rating >= 1 and rating <= 5),
  likes text not null,
  improve text not null,
  recommend text not null default 'yes',
  comments text not null default ''
);

alter table public.feedback enable row level security;

create policy "Anyone can read feedback"
  on public.feedback
  for select
  to anon, authenticated
  using (true);

create policy "Anyone can submit feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check (true);
