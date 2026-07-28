begin;

-- Daily anonymous policies replace the previous monthly application and
-- two-window experience policies. Quota buckets are ephemeral rate-limit
-- state, so clear the old policy fingerprints instead of treating an in-flight
-- anonymous request as a server error during the policy transition.
delete from security.submission_quota_buckets
where scope in ('survey.single-response', 'experience.repeatable');

commit;
