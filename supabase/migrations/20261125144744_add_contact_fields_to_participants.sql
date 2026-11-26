/*
# Add contact fields to participants

1. Plain-English explanation
The organizer can now register each participant's WhatsApp phone number and/or
e-mail address. With a phone, the individual result link can open a WhatsApp
conversation directly with that person; with an e-mail, it can open a ready
e-mail draft. Both fields are optional — a participant can still have neither.

2. Modified Tables
- `participants`
  - `phone` (text, nullable) — digits-only phone with country code (e.g. 5511...),
    normalized by the app before saving
  - `email` (text, nullable) — participant e-mail address

3. Security
- No policy changes: RLS stays as-is and the existing grants already cover all
  columns of the table for anon and authenticated.

4. Important notes
- Nullable columns added with IF NOT EXISTS, so the migration is idempotent and
  no existing data is touched.
*/

ALTER TABLE participants ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS email text;
