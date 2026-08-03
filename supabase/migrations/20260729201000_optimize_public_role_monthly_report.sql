begin;

-- The public report previously recalculated the same cohort/month aggregate
-- for every role row. The role catalog baseline has 401 roles, so precompute
-- that compact matrix once and read it from the JSON projection.
do $$
declare
  function_definition text;
  cohort_cte text;
  monthly_projection text;
  insert_at integer;
  projection_start integer;
  projection_end integer;
begin
  select pg_get_functiondef(
    'api.get_public_benchmark_report_v1(integer,integer)'::regprocedure
  ) into function_definition;

  cohort_cte := $cte$
    role_monthly as (
      select
        case search.raw_role_family
          when 'engineering' then 'software'
          when 'data' then 'data_ai'
          when 'business' then 'business_operations'
          else search.raw_role_family
        end as role_family,
        case search.raw_role_specialization
          when 'software-engineer' then 'software_engineering'
          when 'frontend-developer' then 'frontend_development'
          when 'backend-developer' then 'backend_development'
          when 'full-stack-developer' then 'full_stack_development'
          when 'mobile-developer' then 'mobile_development'
          when 'data-analyst' then 'data_analysis'
          when 'data-scientist' then 'data_science'
          when 'product-manager' then 'product_management'
          when 'product-designer' then 'product_design'
          when 'devops-engineer' then 'devops_engineering'
          when 'qa-engineer' then 'quality_assurance'
          when 'business-analyst' then 'business_analysis'
          else replace(search.raw_role_specialization, '-', '_')
        end as role_specialization,
        search.role_level as seniority,
        month.month_start::date as month_start,
        coalesce(round(sum(
          search.applications_count::numeric / greatest(
            1,
            (
              extract(year from coalesce(
                search.ended_month,
                date_trunc('month', search.observed_through)::date
              ))::integer * 12
              + extract(month from coalesce(
                search.ended_month,
                date_trunc('month', search.observed_through)::date
              ))::integer
              - extract(year from search.started_month)::integer * 12
              - extract(month from search.started_month)::integer
              + 1
            )
          )
        ), 1), 0)::integer as applications_count
      from eligible_search as search
      cross join generate_series(
        period_start,
        period_end,
        interval '1 month'
      ) as month(month_start)
      where month.month_start between search.started_month
        and coalesce(
          search.ended_month,
          date_trunc('month', search.observed_through)::date
        )
      group by 1, 2, 3, 4
    ),
$cte$;

  monthly_projection := $projection$
            'monthlyApplications', (
              select jsonb_agg(
                jsonb_build_object(
                  'month', to_char(month.month_start, 'YYYY-MM'),
                  'count', coalesce(monthly.applications_count, 0)
                )
                order by month.month_start
              )
              from generate_series(
                period_start,
                period_end,
                interval '1 month'
              ) as month(month_start)
              left join role_monthly as monthly
                on monthly.month_start = month.month_start::date
                and monthly.role_family = cohort.role_family
                and monthly.role_specialization = cohort.role_specialization
                and monthly.seniority = cohort.seniority
            )
          )

$projection$;

  insert_at := position('candidate_banded as (' in function_definition);
  projection_start := position('''monthlyApplications'', (' in function_definition);
  projection_end := position(
    E'order by cohort.unique_candidates desc, cohort.role_family,'
    in function_definition
  );

  if insert_at = 0 or projection_start = 0 or projection_end = 0 then
    raise exception using
      errcode = '22023',
      message = 'public_benchmark_monthly_optimization_rewrite_failed';
  end if;

  function_definition := substring(function_definition from 1 for insert_at - 1)
    || cohort_cte
    || substring(function_definition from insert_at);

  -- The CTE insertion moves the projection forward, so calculate its position again.
  projection_start := position('''monthlyApplications'', (' in function_definition);
  projection_end := position(
    E'order by cohort.unique_candidates desc, cohort.role_family,'
    in function_definition
  );

  function_definition := substring(function_definition from 1 for projection_start - 1)
    || monthly_projection
    || substring(function_definition from projection_end);

  execute function_definition;
end
$$;

commit;
