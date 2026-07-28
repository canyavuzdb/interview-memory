begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create table intake.interview_preparation_contributions (
  id uuid primary key default gen_random_uuid(),
  data_subject_id uuid not null references core.data_subjects (id) on delete restrict,
  company_name text not null,
  applied_role text not null,
  seniority text not null,
  process_year smallint not null,
  stage_details jsonb not null,
  created_at timestamptz not null default now(),
  constraint interview_preparation_contributions_company_check check (company_name = btrim(company_name) and char_length(company_name) between 2 and 200 and company_name !~ '[[:cntrl:]]'),
  constraint interview_preparation_contributions_role_check check (applied_role = btrim(applied_role) and char_length(applied_role) between 2 and 120 and applied_role !~ '[[:cntrl:]]'),
  constraint interview_preparation_contributions_seniority_check check (seniority in ('intern', 'junior', 'mid', 'senior', 'lead')),
  constraint interview_preparation_contributions_year_check check (process_year between 2020 and 2100),
  constraint interview_preparation_contributions_stage_details_check check (
    jsonb_typeof(stage_details) = 'array' and jsonb_array_length(stage_details) between 1 and 5
  )
);

comment on table intake.interview_preparation_contributions is
  'Private anonymous-or-authenticated, stage-level preparation signals. Free text is limited to anonymized summaries and is released only in k-anonymous aggregates.';

create index interview_preparation_contributions_lookup_idx
  on intake.interview_preparation_contributions (lower(company_name), lower(applied_role), seniority, created_at desc);

alter table intake.interview_preparation_contributions enable row level security;
alter table intake.interview_preparation_contributions force row level security;

create function api.create_interview_preparation_contribution_v1(
  p_data_subject_id uuid,
  p_company_name text,
  p_applied_role text,
  p_seniority text,
  p_process_year smallint,
  p_stage_details jsonb
)
returns table (contribution_id uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare v_data_subject_id uuid;
begin
  select subject.id into v_data_subject_id
  from core.data_subjects as subject
  where subject.id = p_data_subject_id
    and subject.status in ('anonymous', 'authenticated')
    and subject.merged_into_id is null
    and subject.deleted_at is null;

  if v_data_subject_id is null then
    raise exception using errcode = '28000', message = 'preparation_subject_not_active';
  end if;

  return query
  insert into intake.interview_preparation_contributions (
    data_subject_id, company_name, applied_role, seniority, process_year, stage_details
  ) values (
    v_data_subject_id, btrim(p_company_name), btrim(p_applied_role), p_seniority, p_process_year, p_stage_details
  ) returning id, interview_preparation_contributions.created_at;
end;
$$;

revoke all on function api.create_interview_preparation_contribution_v1(uuid, text, text, text, smallint, jsonb) from public, anon, authenticated;
grant execute on function api.create_interview_preparation_contribution_v1(uuid, text, text, text, smallint, jsonb) to service_role;

create function api.get_interview_preparation_report_v1(
  p_company_name text,
  p_applied_role text,
  p_seniority text default null,
  p_min_cohort_size integer default 5
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with matching as (
  select * from intake.interview_preparation_contributions
  where lower(company_name) = lower(btrim(p_company_name))
    and lower(applied_role) = lower(btrim(p_applied_role))
    and (p_seniority is null or seniority = p_seniority)
    and created_at >= now() - interval '24 months'
), cohort as (
  select count(*)::integer as sample_size from matching
), stage_rows as (
  select jsonb_array_elements(stage_details) as detail from matching
), stage_counts as (
  select detail->>'stageCode' as code, count(*)::integer as count from stage_rows group by detail->>'stageCode'
), format_counts as (
  select value as code, count(*)::integer as count from stage_rows cross join lateral jsonb_array_elements_text(detail->'formatCodes') as value group by value
), topic_counts as (
  select value as code, count(*)::integer as count from stage_rows cross join lateral jsonb_array_elements_text(detail->'topicCodes') as value group by value
), skill_counts as (
  select value as code, count(*)::integer as count from stage_rows cross join lateral jsonb_array_elements_text(detail->'skillCodes') as value group by value
), question_insights as (
  select coalesce(jsonb_agg(value order by value->>'questionSummary'), '[]'::jsonb) as value from (
    select distinct jsonb_build_object(
      'questionType', question->>'questionType',
      'questionSummary', btrim(question->>'questionSummary'),
      'answerSummary', btrim(question->>'answerSummary'),
      'outcome', question->>'outcome'
    ) as value
    from stage_rows cross join lateral jsonb_array_elements(detail->'questionEntries') as question
    where char_length(btrim(question->>'questionSummary')) between 20 and 480
      and char_length(btrim(question->>'answerSummary')) between 20 and 480
    limit 4
  ) as rows
), preparation_tips as (
  select coalesce(jsonb_agg(content order by content), '[]'::jsonb) as value from (
    select distinct btrim(detail->>'preparationTip') as content from stage_rows
    where char_length(btrim(detail->>'preparationTip')) between 20 and 480
    limit 4
  ) as rows
)
select case when cohort.sample_size < greatest(coalesce(p_min_cohort_size, 5), 5) then
  jsonb_build_object('status', 'insufficient', 'sampleSize', cohort.sample_size, 'minimumSampleSize', greatest(coalesce(p_min_cohort_size, 5), 5), 'company', btrim(p_company_name), 'role', btrim(p_applied_role), 'seniority', p_seniority, 'stages', '[]'::jsonb, 'formats', '[]'::jsonb, 'topics', '[]'::jsonb, 'skills', '[]'::jsonb, 'questionInsights', '[]'::jsonb, 'preparationTips', '[]'::jsonb)
else
  jsonb_build_object('status', 'live', 'sampleSize', cohort.sample_size, 'minimumSampleSize', greatest(coalesce(p_min_cohort_size, 5), 5), 'company', btrim(p_company_name), 'role', btrim(p_applied_role), 'seniority', p_seniority, 'stages', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'count', count) order by count desc, code) from stage_counts), '[]'::jsonb), 'formats', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'count', count) order by count desc, code) from format_counts), '[]'::jsonb), 'topics', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'count', count) order by count desc, code) from topic_counts), '[]'::jsonb), 'skills', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'count', count) order by count desc, code) from skill_counts), '[]'::jsonb), 'questionInsights', question_insights.value, 'preparationTips', preparation_tips.value)
end from cohort cross join question_insights cross join preparation_tips;
$$;

revoke all on function api.get_interview_preparation_report_v1(text, text, text, integer) from public, anon, authenticated;
grant execute on function api.get_interview_preparation_report_v1(text, text, text, integer) to service_role;

commit;
