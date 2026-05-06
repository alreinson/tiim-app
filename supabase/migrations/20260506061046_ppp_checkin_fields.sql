-- Add PPP (Progress / Plans / Problems) fields to checkins
-- sharing stores which indices each manager chose to make visible to the team
-- e.g. {"progress": [0, 2], "plans": [0], "problems": []}

alter table checkins
  add column if not exists progress  text[]  not null default '{}',
  add column if not exists plans     text[]  not null default '{}',
  add column if not exists problems  text[]  not null default '{}',
  add column if not exists sharing   jsonb   not null default '{}';
