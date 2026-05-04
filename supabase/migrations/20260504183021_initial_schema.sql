-- Tiim.app — Initial Schema
-- All tables use UUID PKs. RLS enabled on all tables.
-- Server-side access uses service_role (bypasses RLS).
-- Client-side RLS policies to be added when Clerk JWT integration is configured.

create extension if not exists "uuid-ossp";

-- =============================================
-- COMPANIES
-- =============================================
create table companies (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  created_at timestamptz not null default now()
);
alter table companies enable row level security;

-- =============================================
-- USERS (profiles — linked to Clerk)
-- =============================================
create table users (
  id                   uuid primary key default uuid_generate_v4(),
  clerk_id             text unique not null,
  company_id           uuid references companies(id) on delete cascade,
  manager_id           uuid references users(id) on delete set null,
  email                text not null,
  name                 text not null,
  role                 text not null check (role in ('team_member', 'manager', 'admin')),
  language             text not null default 'et' check (language in ('et', 'en')),
  support_style        smallint not null default 3 check (support_style between 1 and 5),
  feedback_directness  text not null default 'balanced' check (feedback_directness in ('direct', 'balanced', 'gentle')),
  timezone             text not null default 'Europe/Tallinn',
  vacation_mode        boolean not null default false,
  vacation_start       date,
  vacation_end         date,
  belbin_uploaded      boolean not null default false,
  onboarding_complete  boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
alter table users enable row level security;

create index users_company_id_idx on users(company_id);
create index users_manager_id_idx on users(manager_id);

-- =============================================
-- GOALS
-- =============================================
create table goals (
  id         uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  title      text not null,
  level      text not null check (level in ('yearly', 'quarterly')),
  type       text not null check (type in ('work', 'development')),
  status     text not null default 'not_started'
               check (status in ('not_started', 'in_progress', 'on_track', 'at_risk', 'done')),
  progress   smallint not null default 0 check (progress between 0 and 100),
  parent_id  uuid references goals(id) on delete set null,
  owner_id   uuid references users(id) on delete set null,
  quarter    text,
  year       smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table goals enable row level security;

create index goals_company_id_idx on goals(company_id);
create index goals_parent_id_idx  on goals(parent_id);

create table goal_contributors (
  goal_id uuid not null references goals(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (goal_id, user_id)
);
alter table goal_contributors enable row level security;

-- =============================================
-- WORK ITEMS (projects and tasks)
-- =============================================
create table work_items (
  id         uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  title      text not null,
  type       text not null check (type in ('project', 'task')),
  status     text not null default 'not_started'
               check (status in ('not_started', 'in_progress', 'on_track', 'at_risk', 'done')),
  owner_id   uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table work_items enable row level security;

create index work_items_company_id_idx on work_items(company_id);
create index work_items_owner_id_idx   on work_items(owner_id);

create table work_item_goals (
  work_item_id uuid not null references work_items(id) on delete cascade,
  goal_id      uuid not null references goals(id) on delete cascade,
  primary key (work_item_id, goal_id)
);
alter table work_item_goals enable row level security;

-- =============================================
-- CHECK-INS
-- =============================================
create table checkins (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references users(id) on delete cascade,
  type                text not null check (type in ('weekly', 'quarterly')),
  transcript          text,
  mood                smallint check (mood between 1 and 5),
  energy              smallint check (energy between 1 and 5),
  workload            smallint check (workload between 1 and 5),
  approved            boolean not null default false,
  approved_at         timestamptz,
  pending_ai_actions  jsonb,
  week                text,
  quarter             text,
  created_at          timestamptz not null default now()
);
alter table checkins enable row level security;

create index checkins_user_id_idx on checkins(user_id);
create index checkins_week_idx    on checkins(week);

-- =============================================
-- BLOCKERS
-- =============================================
create table blockers (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references users(id) on delete cascade,
  company_id          uuid not null references companies(id) on delete cascade,
  checkin_id          uuid references checkins(id) on delete set null,
  summary             text not null,
  support_type        text not null
                        check (support_type in ('feel_heard', 'want_solution', 'think_through')),
  reflection_summary  jsonb,
  manager_response    text,
  resolved            boolean not null default false,
  resolved_at         timestamptz,
  created_at          timestamptz not null default now()
);
alter table blockers enable row level security;

create index blockers_user_id_idx    on blockers(user_id);
create index blockers_company_id_idx on blockers(company_id);
create index blockers_resolved_idx   on blockers(resolved) where not resolved;

-- =============================================
-- SHOUTOUTS
-- =============================================
create table shoutouts (
  id           uuid primary key default uuid_generate_v4(),
  from_user_id uuid not null references users(id) on delete cascade,
  to_user_id   uuid not null references users(id) on delete cascade,
  company_id   uuid not null references companies(id) on delete cascade,
  message      text not null,
  anonymous    boolean not null default false,
  created_at   timestamptz not null default now()
);
alter table shoutouts enable row level security;

create index shoutouts_company_id_idx on shoutouts(company_id);
create index shoutouts_to_user_id_idx on shoutouts(to_user_id);

create table shoutout_reactions (
  id          uuid primary key default uuid_generate_v4(),
  shoutout_id uuid not null references shoutouts(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  emoji       text not null,
  created_at  timestamptz not null default now(),
  unique (shoutout_id, user_id, emoji)
);
alter table shoutout_reactions enable row level security;

-- =============================================
-- NEWS FEED
-- =============================================
create table news_items (
  id         uuid primary key default uuid_generate_v4(),
  author_id  uuid not null references users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  content    text not null,
  pinned     boolean not null default false,
  created_at timestamptz not null default now()
);
alter table news_items enable row level security;

create index news_items_company_id_idx on news_items(company_id);

create table news_reactions (
  id           uuid primary key default uuid_generate_v4(),
  news_item_id uuid not null references news_items(id) on delete cascade,
  user_id      uuid not null references users(id) on delete cascade,
  emoji        text not null,
  created_at   timestamptz not null default now(),
  unique (news_item_id, user_id, emoji)
);
alter table news_reactions enable row level security;

-- =============================================
-- BELBIN
-- =============================================
create table belbin_profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references users(id) on delete cascade,
  primary_roles   jsonb not null default '[]',
  secondary_roles jsonb not null default '[]',
  weak_roles      jsonb not null default '[]',
  raw_pdf_path    text,
  uploaded_at     timestamptz not null default now()
);
alter table belbin_profiles enable row level security;

create table belbin_analyses (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id) on delete cascade,
  quarter          text not null,
  task_mappings    jsonb not null default '[]',
  strong_role_pct  smallint,
  weak_role_pct    smallint,
  flags            jsonb not null default '[]',
  manager_summary  text,
  member_summary   text,
  created_at       timestamptz not null default now()
);
alter table belbin_analyses enable row level security;

create index belbin_analyses_user_id_idx on belbin_analyses(user_id);

-- =============================================
-- STREAKS & ACHIEVEMENTS
-- =============================================
create table streaks (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references users(id) on delete cascade,
  current_streak    smallint not null default 0,
  longest_streak    smallint not null default 0,
  last_checkin_week text,
  updated_at        timestamptz not null default now()
);
alter table streaks enable row level security;

create table achievements (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references users(id) on delete cascade,
  code           text not null,
  announced      boolean not null default false,
  opt_out_public boolean not null default false,
  earned_at      timestamptz not null default now(),
  unique (user_id, code)
);
alter table achievements enable row level security;

create index achievements_user_id_idx on achievements(user_id);

-- =============================================
-- AI DIGESTS
-- =============================================
create table ai_digests (
  id         uuid primary key default uuid_generate_v4(),
  manager_id uuid not null references users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  week       text not null,
  content    jsonb not null,
  created_at timestamptz not null default now(),
  unique (manager_id, week)
);
alter table ai_digests enable row level security;

-- =============================================
-- ONBOARDING TIPS
-- =============================================
create table onboarding_tips (
  user_id      uuid not null references users(id) on delete cascade,
  tip_key      text not null,
  dismissed_at timestamptz not null default now(),
  primary key (user_id, tip_key)
);
alter table onboarding_tips enable row level security;

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at      before update on users      for each row execute function handle_updated_at();
create trigger goals_updated_at      before update on goals      for each row execute function handle_updated_at();
create trigger work_items_updated_at before update on work_items for each row execute function handle_updated_at();
