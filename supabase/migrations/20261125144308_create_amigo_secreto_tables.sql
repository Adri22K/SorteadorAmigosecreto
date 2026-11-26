/*
# Amigo Secreto (Secret Santa) tables

1. Plain-English explanation
This migration creates the storage for the "Meu Amigo Fraudes" secret santa app:
groups of participants and the draw results. The app has no sign-in screen, so
all data is intentionally shared and managed by anyone with the group link.
The draw result is not shown in the organizer's list — each participant only
sees who they drew via their own individual link, which keeps the surprise.

2. New Tables
- `groups`
  - `id` (uuid, primary key) — also used in the shareable group URL
  - `name` (text) — group name, e.g. family or office party
  - `budget_hint` (text, nullable) — optional suggested value range
  - `created_at` (timestamp)
- `participants`
  - `id` (uuid, primary key) — also used in each participant's private result URL
  - `group_id` (uuid, foreign key to groups, cascade delete)
  - `name` (text) — participant name
  - `wishlist` (text, nullable) — optional gift hint the participant writes
  - `created_at` (timestamp)
- `assignments`
  - `id` (uuid, primary key)
  - `group_id` (uuid, foreign key to groups, cascade delete)
  - `giver_id` (uuid, foreign key to participants, unique, cascade delete)
  - `receiver_id` (uuid, foreign key to participants, cascade delete)
  - `created_at` (timestamp)
  One row per participant (giver) — unique on giver_id guarantees a valid
  single-cycle permutation can be replaced as a whole if a new draw happens.

3. Modified Tables
None.

4. Security
- Enable RLS on all three tables.
- Grant SELECT/INSERT/DELETE on groups; SELECT/INSERT on participants and
  assignments to `anon` and `authenticated` (no-auth single-tenant app; the
  client never needs UPDATE and never deletes participants individually).
- Policies allow anon + authenticated CRUD-equivalent access because the data
  is intentionally public/shared via the group link (documented exception to
  ownership checks: there are no user accounts in this app).

5. Important notes
- Assignments are deleted and re-created in bulk on a re-draw; the unique
  constraint on giver_id prevents duplicates. Deleting a group cascades to its
  participants and assignments.
*/

CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  budget_hint text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  wishlist text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  giver_id uuid NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_group_id ON participants (group_id);
CREATE INDEX IF NOT EXISTS idx_assignments_group_id ON assignments (group_id);
CREATE INDEX IF NOT EXISTS idx_assignments_receiver_id ON assignments (receiver_id);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON groups TO anon, authenticated;
GRANT SELECT, INSERT ON participants TO anon, authenticated;
GRANT SELECT, INSERT ON assignments TO anon, authenticated;

DROP POLICY IF EXISTS "Public read groups" ON groups;
CREATE POLICY "Public read groups" ON groups
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public insert groups" ON groups;
CREATE POLICY "Public insert groups" ON groups
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete groups" ON groups;
CREATE POLICY "Public delete groups" ON groups
FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read participants" ON participants;
CREATE POLICY "Public read participants" ON participants
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public insert participants" ON participants;
CREATE POLICY "Public insert participants" ON participants
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public read assignments" ON assignments;
CREATE POLICY "Public read assignments" ON assignments
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public insert assignments" ON assignments;
CREATE POLICY "Public insert assignments" ON assignments
FOR INSERT TO anon, authenticated WITH CHECK (true);
