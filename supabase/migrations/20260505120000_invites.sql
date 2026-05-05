-- Invite system
-- token: random hex, unique per invite
-- invitee_role: what role the invitee should have
-- used_by_user_id: set when a signed-in user consumes the invite
-- connected: null=pending, true=confirmed, false=declined
-- either party can mark connected/not connected

create table invites (
  id               uuid primary key default uuid_generate_v4(),
  token            text unique not null,
  inviter_id       uuid not null references users(id) on delete cascade,
  company_id       uuid not null references companies(id) on delete cascade,
  invitee_role     text not null check (invitee_role in ('team_member', 'manager')),
  used_by_user_id  uuid references users(id) on delete set null,
  used_at          timestamptz,
  connected        boolean default null,
  created_at       timestamptz not null default now()
);

alter table invites enable row level security;

create index invites_inviter_id_idx      on invites(inviter_id);
create index invites_token_idx           on invites(token);
create index invites_used_by_user_id_idx on invites(used_by_user_id);
