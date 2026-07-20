-- Keep the hosted Data API settings as the source of truth for exposed schemas.
-- A role-level override takes precedence over the dashboard configuration and
-- causes PGRST106 even after a custom schema is selected there.
alter role authenticator reset pgrst.db_schemas;

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
