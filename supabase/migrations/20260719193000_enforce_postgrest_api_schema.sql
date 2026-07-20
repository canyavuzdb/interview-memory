-- The hosted Data API UI can report the dedicated API schema as selected while
-- the running PostgREST service still retains its platform default schema list.
-- Pin the runtime boundary explicitly so only the versioned API facade is routable.
alter role authenticator set pgrst.db_schemas = 'api';

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
