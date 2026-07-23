begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create table intake.job_applications (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique
    references intake.survey_submissions (id) on delete restrict,
  company_experience_id uuid not null unique
    references intake.company_experiences (id) on delete restrict,
  company_id uuid references catalog.companies (id) on delete restrict,
  applied_role text not null,
  application_channel text not null,
  had_referral boolean not null,
  applied_month date not null,
  observed_through date not null,
  created_at timestamptz not null default now(),
  constraint job_applications_role_check check (
    applied_role = btrim(applied_role)
    and char_length(applied_role) between 2 and 120
    and applied_role !~ '[[:cntrl:]]'
  ),
  constraint job_applications_channel_check check (
    application_channel in (
      'linkedin', 'job_board', 'company_site', 'referral',
      'recruiter_outreach', 'other'
    )
  ),
  constraint job_applications_month_check check (
    applied_month = date_trunc('month', applied_month)::date
    and applied_month <= date_trunc('month', current_date)::date
  ),
  constraint job_applications_observation_check check (
    observed_through >= applied_month and observed_through <= current_date
  )
);

create index job_applications_company_month_idx
  on intake.job_applications (company_id, applied_month, id)
  where company_id is not null;
create index job_applications_channel_month_idx
  on intake.job_applications (application_channel, applied_month, id);

create table intake.application_stage_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null
    references intake.job_applications (id) on delete restrict,
  stage_code text not null,
  occurred_month date,
  date_precision text not null,
  sequence_no smallint not null,
  source_kind text not null,
  created_at timestamptz not null default now(),
  constraint application_stage_events_sequence_unique unique (
    application_id, sequence_no
  ),
  constraint application_stage_events_stage_unique unique (
    application_id, stage_code
  ),
  constraint application_stage_events_stage_check check (
    stage_code in ('application', 'hr_screen', 'technical', 'final', 'offer')
  ),
  constraint application_stage_events_date_check check (
    (date_precision = 'month'
      and occurred_month = date_trunc('month', occurred_month)::date)
    or (date_precision = 'unknown' and occurred_month is null)
  ),
  constraint application_stage_events_sequence_check check (
    sequence_no between 1 and 5
  ),
  constraint application_stage_events_source_check check (
    source_kind in ('initial', 'follow_up')
  )
);

create table intake.application_outcome_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null
    references intake.job_applications (id) on delete restrict,
  outcome_code text not null,
  occurred_month date,
  observed_through date not null,
  sequence_no integer not null,
  source_kind text not null,
  created_at timestamptz not null default now(),
  constraint application_outcome_events_sequence_unique unique (
    application_id, sequence_no
  ),
  constraint application_outcome_events_outcome_check check (
    outcome_code in (
      'awaiting_response', 'interviewing', 'automated_rejection',
      'manual_rejection', 'offer_received', 'offer_declined',
      'offer_accepted', 'employment_started', 'employment_not_started',
      'application_withdrawn'
    )
  ),
  constraint application_outcome_events_month_check check (
    (
      outcome_code in ('awaiting_response', 'interviewing')
      and occurred_month is null
    ) or (
      outcome_code not in ('awaiting_response', 'interviewing')
      and occurred_month = date_trunc('month', occurred_month)::date
    )
  ),
  constraint application_outcome_events_observation_check check (
    observed_through <= current_date
    and (occurred_month is null or observed_through >= occurred_month)
  ),
  constraint application_outcome_events_sequence_check check (sequence_no > 0),
  constraint application_outcome_events_source_check check (
    source_kind in ('initial', 'follow_up')
  )
);

create index application_outcome_events_latest_idx
  on intake.application_outcome_events (
    application_id, sequence_no desc, id
  );

create table intake.application_offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique
    references intake.job_applications (id) on delete restrict,
  offered_month date not null,
  created_at timestamptz not null default now(),
  constraint application_offers_month_check check (
    offered_month = date_trunc('month', offered_month)::date
    and offered_month <= date_trunc('month', current_date)::date
  )
);

create table intake.employment_outcomes (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null unique
    references intake.application_offers (id) on delete restrict,
  status text not null,
  planned_start_month date,
  started_month date,
  updated_at timestamptz not null default now(),
  constraint employment_outcomes_status_check check (
    status in ('accepted', 'started', 'not_started')
  ),
  constraint employment_outcomes_planned_month_check check (
    planned_start_month is null
    or planned_start_month = date_trunc('month', planned_start_month)::date
  ),
  constraint employment_outcomes_started_month_check check (
    (status = 'started'
      and started_month = date_trunc('month', started_month)::date)
    or (status <> 'started' and started_month is null)
  )
);

comment on table intake.job_applications is
  'B10 private one-company, one-role application facts linked to a B09 contribution.';
comment on table intake.application_stage_events is
  'B10 append-only stage observations used for company and role funnel analytics.';
comment on table intake.application_outcome_events is
  'B10 append-only outcome timeline; the latest sequence is the current outcome.';
comment on table intake.application_offers is
  'B10 private offer occurrence. Compensation is intentionally deferred.';
comment on table intake.employment_outcomes is
  'B10 controlled employment follow-up snapshot backed by append-only outcome events.';

alter table intake.job_applications enable row level security;
alter table intake.job_applications force row level security;
alter table intake.application_stage_events enable row level security;
alter table intake.application_stage_events force row level security;
alter table intake.application_outcome_events enable row level security;
alter table intake.application_outcome_events force row level security;
alter table intake.application_offers enable row level security;
alter table intake.application_offers force row level security;
alter table intake.employment_outcomes enable row level security;
alter table intake.employment_outcomes force row level security;

create function intake.reject_application_fact_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception using errcode = '55000', message = 'application_fact_is_immutable';
end;
$$;

revoke all on function intake.reject_application_fact_mutation()
  from public, anon, authenticated, service_role;

create trigger reject_job_application_mutation
before update or delete on intake.job_applications
for each row execute function intake.reject_application_fact_mutation();
create trigger reject_application_stage_event_mutation
before update or delete on intake.application_stage_events
for each row execute function intake.reject_application_fact_mutation();
create trigger reject_application_outcome_event_mutation
before update or delete on intake.application_outcome_events
for each row execute function intake.reject_application_fact_mutation();
create trigger reject_application_offer_mutation
before update or delete on intake.application_offers
for each row execute function intake.reject_application_fact_mutation();

create function intake.application_outcome_transition_allowed_v1(
  p_previous text,
  p_next text
)
returns boolean
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select case p_previous
    when 'awaiting_response' then p_next in (
      'interviewing', 'automated_rejection', 'manual_rejection',
      'offer_received', 'application_withdrawn'
    )
    when 'interviewing' then p_next in (
      'manual_rejection', 'offer_received', 'application_withdrawn'
    )
    when 'offer_received' then p_next in ('offer_declined', 'offer_accepted')
    when 'offer_accepted' then p_next in (
      'employment_started', 'employment_not_started'
    )
    else false
  end;
$$;

revoke all on function intake.application_outcome_transition_allowed_v1(text, text)
  from public, anon, authenticated, service_role;

create function api.create_company_experience_with_application_v1(
  p_data_subject_id uuid,
  p_schema_version integer,
  p_locale text,
  p_notice_version_id uuid,
  p_payload_hash bytea,
  p_command_fingerprint bytea,
  p_supersedes_submission_id uuid,
  p_capability_hmac bytea,
  p_capability_key_version smallint,
  p_capability_expires_at timestamptz,
  p_consent_subject_proof_hmac bytea,
  p_consent_subject_proof_key_version smallint,
  p_consent_idempotency_key uuid,
  p_idempotency_subject_hmac bytea,
  p_idempotency_key_hmac bytea,
  p_idempotency_request_fingerprint bytea,
  p_quota_subject_hmac bytea,
  p_quota_24h_window_start timestamptz,
  p_quota_24h_limit integer,
  p_quota_24h_expires_at timestamptz,
  p_quota_30d_window_start timestamptz,
  p_quota_30d_limit integer,
  p_quota_30d_expires_at timestamptz,
  p_quota_policy_version text,
  p_quota_policy_hash bytea,
  p_company_name text,
  p_applied_role text,
  p_process_year smallint,
  p_promised_timeline text,
  p_promised_days smallint,
  p_actual_days smallint,
  p_was_ghosted boolean,
  p_ghosted_after_stage text,
  p_interviewer_prepared smallint,
  p_was_asked_irrelevant boolean,
  p_irrelevant_types text[],
  p_rejection_shared text,
  p_feedback_useful smallint,
  p_process_transparency smallint,
  p_hr_professionalism smallint,
  p_would_recommend_process text,
  p_free_note text,
  p_application_month date,
  p_application_channel text,
  p_had_referral boolean,
  p_last_stage text,
  p_current_outcome text,
  p_outcome_month date,
  p_planned_start_month date
)
returns table (
  submission_id uuid,
  receipt_id uuid,
  company_experience_id uuid,
  job_application_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  contribution record;
  inserted_application_id uuid;
  inserted_offer_id uuid;
  stage_codes constant text[] := array[
    'application', 'hr_screen', 'technical', 'final', 'offer'
  ];
  last_stage_index integer;
begin
  if extract(year from p_application_month)::integer <> p_process_year
    or p_application_month <> date_trunc('month', p_application_month)::date
    or p_application_month > date_trunc('month', current_date)::date
    or (p_outcome_month is not null and p_outcome_month < p_application_month)
    or (p_planned_start_month is not null and p_planned_start_month < p_application_month)
    or (
      (p_current_outcome in ('awaiting_response', 'interviewing'))
      <> (p_outcome_month is null)
    )
    or (
      p_planned_start_month is not null
      and p_current_outcome not in ('offer_accepted', 'employment_started')
    )
  then
    raise exception using errcode = '22023', message = 'application_context_invalid';
  end if;

  last_stage_index := array_position(stage_codes, p_last_stage);
  if last_stage_index is null
    or (p_current_outcome = 'interviewing' and last_stage_index = 1)
    or (
      p_current_outcome in (
        'offer_received', 'offer_declined', 'offer_accepted',
        'employment_started', 'employment_not_started'
      ) and p_last_stage <> 'offer'
    )
  then
    raise exception using errcode = '22023', message = 'application_stage_outcome_invalid';
  end if;

  select * into contribution
  from api.create_company_experience_v1(
    p_data_subject_id, p_schema_version, p_locale, p_notice_version_id,
    p_payload_hash, p_command_fingerprint, p_supersedes_submission_id,
    p_capability_hmac, p_capability_key_version, p_capability_expires_at,
    p_consent_subject_proof_hmac, p_consent_subject_proof_key_version,
    p_consent_idempotency_key, p_idempotency_subject_hmac,
    p_idempotency_key_hmac, p_idempotency_request_fingerprint,
    p_quota_subject_hmac, p_quota_24h_window_start, p_quota_24h_limit,
    p_quota_24h_expires_at, p_quota_30d_window_start, p_quota_30d_limit,
    p_quota_30d_expires_at, p_quota_policy_version, p_quota_policy_hash,
    p_company_name, p_applied_role, p_process_year, p_promised_timeline,
    p_promised_days, p_actual_days, p_was_ghosted, p_ghosted_after_stage,
    p_interviewer_prepared, p_was_asked_irrelevant, p_irrelevant_types,
    p_rejection_shared, p_feedback_useful, p_process_transparency,
    p_hr_professionalism, p_would_recommend_process, p_free_note
  );

  insert into intake.job_applications (
    submission_id, company_experience_id, company_id, applied_role,
    application_channel, had_referral, applied_month, observed_through
  )
  select contribution.submission_id, contribution.company_experience_id,
    experience.company_id, experience.applied_role, p_application_channel,
    p_had_referral, p_application_month, current_date
  from intake.company_experiences as experience
  where experience.id = contribution.company_experience_id
  returning id into inserted_application_id;

  for stage_position in 1..last_stage_index loop
    insert into intake.application_stage_events (
      application_id, stage_code, occurred_month, date_precision,
      sequence_no, source_kind
    ) values (
      inserted_application_id, stage_codes[stage_position],
      case when stage_position = 1 then p_application_month else null end,
      case when stage_position = 1 then 'month' else 'unknown' end,
      stage_position::smallint, 'initial'
    );
  end loop;

  insert into intake.application_outcome_events (
    application_id, outcome_code, occurred_month, observed_through,
    sequence_no, source_kind
  ) values (
    inserted_application_id, p_current_outcome, p_outcome_month,
    current_date, 1, 'initial'
  );

  if p_current_outcome in (
    'offer_received', 'offer_declined', 'offer_accepted',
    'employment_started', 'employment_not_started'
  ) then
    insert into intake.application_offers (application_id, offered_month)
    values (inserted_application_id, p_outcome_month)
    returning id into inserted_offer_id;
  end if;

  if p_current_outcome in (
    'offer_accepted', 'employment_started', 'employment_not_started'
  ) then
    insert into intake.employment_outcomes (
      offer_id, status, planned_start_month, started_month
    ) values (
      inserted_offer_id,
      case p_current_outcome
        when 'employment_started' then 'started'
        when 'employment_not_started' then 'not_started'
        else 'accepted'
      end,
      p_planned_start_month,
      case when p_current_outcome = 'employment_started'
        then p_outcome_month else null end
    );
  end if;

  return query select contribution.submission_id, contribution.receipt_id,
    contribution.company_experience_id, inserted_application_id;
end;
$$;

revoke all on function api.create_company_experience_with_application_v1(
  uuid, integer, text, uuid, bytea, bytea, uuid, bytea, smallint,
  timestamptz, bytea, smallint, uuid, bytea, bytea, bytea, bytea,
  timestamptz, integer, timestamptz, timestamptz, integer, timestamptz,
  text, bytea, text, text, smallint, text, smallint, smallint, boolean,
  text, smallint, boolean, text[], text, smallint, smallint, smallint,
  text, text, date, text, boolean, text, text, date, date
) from public, anon, authenticated, service_role;
grant execute on function api.create_company_experience_with_application_v1(
  uuid, integer, text, uuid, bytea, bytea, uuid, bytea, smallint,
  timestamptz, bytea, smallint, uuid, bytea, bytea, bytea, bytea,
  timestamptz, integer, timestamptz, timestamptz, integer, timestamptz,
  text, bytea, text, text, smallint, text, smallint, smallint, boolean,
  text, smallint, boolean, text[], text, smallint, smallint, smallint,
  text, text, date, text, boolean, text, text, date, date
) to service_role;

create function api.get_company_application_create_result_v1(
  p_submission_id uuid,
  p_data_subject_id uuid
)
returns table (
  submission_id uuid,
  receipt_id uuid,
  company_experience_id uuid,
  job_application_id uuid,
  capability_key_version smallint
)
language sql
stable
security definer
set search_path = ''
as $$
  select submission.id, submission.receipt_id, experience.id,
    application.id, submission.capability_key_version
  from intake.survey_submissions as submission
  join intake.company_experiences as experience
    on experience.submission_id = submission.id
  join intake.job_applications as application
    on application.submission_id = submission.id
  where submission.id = p_submission_id
    and submission.data_subject_id = p_data_subject_id
    and submission.survey_type = 'company_experience'
  limit 1;
$$;

revoke all on function api.get_company_application_create_result_v1(uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function api.get_company_application_create_result_v1(uuid, uuid)
  to service_role;

create function api.append_application_outcome_v1(
  p_application_id uuid,
  p_requester_data_subject_id uuid,
  p_active_capability_hmac bytea,
  p_active_capability_key_version smallint,
  p_previous_capability_hmac bytea,
  p_previous_capability_key_version smallint,
  p_idempotency_subject_type text,
  p_idempotency_subject_hmac bytea,
  p_idempotency_key_hmac bytea,
  p_idempotency_request_fingerprint bytea,
  p_outcome_code text,
  p_occurred_month date,
  p_planned_start_month date
)
returns table (
  application_id uuid,
  outcome_event_id uuid,
  outcome_code text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  application_record intake.job_applications%rowtype;
  submission_record intake.survey_submissions%rowtype;
  previous_outcome text;
  next_sequence integer;
  inserted_event_id uuid;
  offer_record intake.application_offers%rowtype;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('application-outcome:' || p_application_id::text, 0)
  );

  select application.*
  into application_record
  from intake.job_applications as application
  join intake.survey_submissions as submission
    on submission.id = application.submission_id
  where application.id = p_application_id
    and submission.lifecycle_status = 'accepted';

  if not found then
    raise exception using errcode = 'P0002', message = 'application_not_found';
  end if;

  select submission.* into submission_record
  from intake.survey_submissions as submission
  where submission.id = application_record.submission_id;

  if not (
    (p_requester_data_subject_id is not null
      and p_requester_data_subject_id = submission_record.data_subject_id)
    or (
      submission_record.capability_expires_at > pg_catalog.clock_timestamp()
      and (
        (p_active_capability_hmac is not null
          and p_active_capability_key_version = submission_record.capability_key_version
          and security.constant_time_equal_v1(
            p_active_capability_hmac, submission_record.capability_hmac
          ))
        or (p_previous_capability_hmac is not null
          and p_previous_capability_key_version = submission_record.capability_key_version
          and security.constant_time_equal_v1(
            p_previous_capability_hmac, submission_record.capability_hmac
          ))
      )
    )
  ) then
    raise exception using errcode = '42501', message = 'application_owner_required';
  end if;

  if not exists (
    select 1 from security.api_idempotency_records as record
    where record.subject_type = p_idempotency_subject_type
      and record.subject_hmac = p_idempotency_subject_hmac
      and record.operation_code = 'application.outcome.append'
      and record.idempotency_key_hmac = p_idempotency_key_hmac
      and record.request_fingerprint = p_idempotency_request_fingerprint
      and record.status = 'processing'
      and record.expires_at > pg_catalog.clock_timestamp()
    for update
  ) then
    raise exception using errcode = '55000', message = 'idempotency_claim_required';
  end if;

  select event.outcome_code, event.sequence_no + 1
  into previous_outcome, next_sequence
  from intake.application_outcome_events as event
  where event.application_id = p_application_id
  order by event.sequence_no desc
  limit 1
  for update;

  if not intake.application_outcome_transition_allowed_v1(
    previous_outcome, p_outcome_code
  ) then
    raise exception using errcode = '22023', message = 'application_outcome_transition_invalid';
  end if;

  if (p_outcome_code in ('awaiting_response', 'interviewing'))
      <> (p_occurred_month is null)
    or (p_occurred_month is not null
      and p_occurred_month < application_record.applied_month)
    or (p_planned_start_month is not null
      and p_planned_start_month < application_record.applied_month)
    or (p_planned_start_month is not null
      and p_outcome_code not in ('offer_accepted', 'employment_started'))
  then
    raise exception using errcode = '22023', message = 'application_outcome_payload_invalid';
  end if;

  insert into intake.application_outcome_events (
    application_id, outcome_code, occurred_month, observed_through,
    sequence_no, source_kind
  ) values (
    p_application_id, p_outcome_code, p_occurred_month, current_date,
    next_sequence, 'follow_up'
  ) returning id into inserted_event_id;

  if p_outcome_code = 'offer_received' then
    insert into intake.application_offers (application_id, offered_month)
    values (p_application_id, p_occurred_month)
    returning * into offer_record;
  elsif p_outcome_code in (
    'offer_declined', 'offer_accepted', 'employment_started',
    'employment_not_started'
  ) then
    select offer.* into offer_record
    from intake.application_offers as offer
    where offer.application_id = p_application_id;
    if not found then
      raise exception using errcode = '55000', message = 'application_offer_required';
    end if;
  end if;

  if p_outcome_code = 'offer_accepted' then
    insert into intake.employment_outcomes (
      offer_id, status, planned_start_month, started_month
    ) values (offer_record.id, 'accepted', p_planned_start_month, null);
  elsif p_outcome_code in ('employment_started', 'employment_not_started') then
    update intake.employment_outcomes
    set status = case when p_outcome_code = 'employment_started'
        then 'started' else 'not_started' end,
      planned_start_month = coalesce(
        p_planned_start_month, employment_outcomes.planned_start_month
      ),
      started_month = case when p_outcome_code = 'employment_started'
        then p_occurred_month else null end,
      updated_at = pg_catalog.clock_timestamp()
    where offer_id = offer_record.id;
    if not found then
      raise exception using errcode = '55000', message = 'employment_outcome_required';
    end if;
  end if;

  perform api.complete_idempotency_v1(
    p_idempotency_subject_type, p_idempotency_subject_hmac,
    'application.outcome.append', p_idempotency_key_hmac,
    p_idempotency_request_fingerprint, 'application_outcome',
    inserted_event_id, 200::smallint
  );

  return query select p_application_id, inserted_event_id, p_outcome_code;
end;
$$;

revoke all on function api.append_application_outcome_v1(
  uuid, uuid, bytea, smallint, bytea, smallint, text, bytea, bytea,
  bytea, text, date, date
) from public, anon, authenticated, service_role;
grant execute on function api.append_application_outcome_v1(
  uuid, uuid, bytea, smallint, bytea, smallint, text, bytea, bytea,
  bytea, text, date, date
) to service_role;

create function api.get_application_outcome_result_v1(
  p_outcome_event_id uuid,
  p_requester_data_subject_id uuid,
  p_active_capability_hmac bytea,
  p_active_capability_key_version smallint,
  p_previous_capability_hmac bytea,
  p_previous_capability_key_version smallint
)
returns table (
  application_id uuid,
  outcome_event_id uuid,
  outcome_code text
)
language sql
stable
security definer
set search_path = ''
as $$
  select application.id, event.id, event.outcome_code
  from intake.application_outcome_events as event
  join intake.job_applications as application
    on application.id = event.application_id
  join intake.survey_submissions as submission
    on submission.id = application.submission_id
  where event.id = p_outcome_event_id
    and submission.lifecycle_status = 'accepted'
    and (
      (p_requester_data_subject_id is not null
        and p_requester_data_subject_id = submission.data_subject_id)
      or (
        submission.capability_expires_at > pg_catalog.clock_timestamp()
        and (
          (p_active_capability_hmac is not null
            and p_active_capability_key_version = submission.capability_key_version
            and security.constant_time_equal_v1(
              p_active_capability_hmac, submission.capability_hmac
            ))
          or (p_previous_capability_hmac is not null
            and p_previous_capability_key_version = submission.capability_key_version
            and security.constant_time_equal_v1(
              p_previous_capability_hmac, submission.capability_hmac
            ))
        )
      )
    )
  limit 1;
$$;

revoke all on function api.get_application_outcome_result_v1(
  uuid, uuid, bytea, smallint, bytea, smallint
) from public, anon, authenticated, service_role;
grant execute on function api.get_application_outcome_result_v1(
  uuid, uuid, bytea, smallint, bytea, smallint
) to service_role;

revoke all on all tables in schema intake
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema intake
  from public, anon, authenticated, service_role;

commit;
