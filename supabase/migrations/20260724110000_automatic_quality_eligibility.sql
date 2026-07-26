begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- B11 has no human approval queue. Contributions that passed the existing
-- application and database contracts are immediately eligible for analysis.
update intake.survey_submissions
set quality_status = 'eligible'
where lifecycle_status = 'accepted'
  and quality_status = 'pending';

alter table intake.survey_submissions
  alter column quality_status set default 'eligible';

comment on column intake.survey_submissions.quality_status is
  'Automatic analysis eligibility. Valid accepted submissions default to eligible; excluded remains available for future automated abuse controls.';

-- Retire the unused human-moderator capability while preserving the
-- operational privacy, security, and role-administration duties.
alter table "authorization".user_role_assignments
  drop constraint user_role_assignments_role_code_check,
  add constraint user_role_assignments_role_code_check check (
    role_code in (
      'privacy_operator',
      'security_operator',
      'role_admin'
    )
  ),
  drop constraint user_role_assignments_grantor_role_check,
  add constraint user_role_assignments_grantor_role_check check (
    grantor_role_snapshot is null
    or grantor_role_snapshot in (
      'privacy_operator',
      'security_operator',
      'role_admin',
      'bootstrap_operator'
    )
  );

alter table catalog.company_aliases
  drop constraint company_aliases_source_code_check,
  add constraint company_aliases_source_code_check check (
    source_code in (
      'user_input',
      'domain',
      'import'
    )
  );

alter index catalog.company_aliases_moderation_idx
  rename to company_aliases_review_idx;

-- Existing immutable notes remain valid. New notes receive the stricter B11
-- shape without rewriting historical contributions.
alter table intake.company_experiences
  add constraint company_experiences_free_note_quality_check check (
    free_note is null
    or (
      free_note = btrim(free_note)
      and char_length(free_note) between 2 and 500
      and free_note !~ '[[:cntrl:]]'
    )
  ) not valid;

commit;
