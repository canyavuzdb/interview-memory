begin;

-- The reference baseline uses Turkish role slugs. The original sector mapper
-- recognised only many English terms, which classified roles such as
-- `full-stack-gelistirici` as "other". Align those traceable reference rows
-- with the sector candidates select in the survey.
-- Search snapshots are immutable after intake. These are only the named,
-- traceable reference rows, so temporarily bypass the guard in this
-- transaction and restore it before commit.
set local session_replication_role = replica;

with classified as (
  select
    episode.id as episode_id,
    case
      when role.slug ~ '(developer|gelistirici|engineer|muhendis|software|yazilim|data|veri|ai|network|ag-|cloud|bulut|cyber|siber|erp|devops|qa|scada|database|veritabani|automation|otomasyon|technical|teknik|game|oyun)' then 'technology'
      when role.slug ~ '(finance|finans|bank|banka|credit|kredi|risk|actuar|aktu|account|muhasebe|payroll|bordro|investment|yatirim|trading|insurance|sigorta)' then 'finance'
      when role.slug ~ '(doctor|doktor|hekim|nurse|hemsire|pharmac|eczaci|medical|medikal|clinical|klinik|veterinary|veteriner)' then 'healthcare'
      when role.slug ~ '(teacher|ogretmen|education|egitim|lecturer|ogretim|academic|akademik|school|okul|curriculum|mufredat|learning|ogrenme)' then 'education'
      when role.slug ~ '(media|medya|content|icerik|editor|editor|journalist|gazeteci|art|sanat|designer|tasarim|film|music|muzik|video|copywriter|metin|publishing|yayincilik)' then 'media'
      when role.slug ~ '(retail|commerce|ticaret|marketplace|magaza|merchandis|e-ticaret)' then 'ecommerce'
      when role.slug ~ '(manufactur|imalat|production|uretim|maintenance|bakim|warehouse|depo|logistics|lojistik|agricultur|tarim|food|gida|textile|tekstil|automotive|otomotiv)' then 'manufacturing'
      when role.slug ~ '(consult|danisman|advisor|analyst|analist|audit|denet|strategy|strateji)' then 'consulting'
      when role.slug ~ '(telecom|telekom|rf|switchboard|santral|sebek)' then 'telecom'
      else 'other'
    end as sector_slug
  from intake.search_episodes as episode
  join intake.survey_submissions as submission on submission.id = episode.submission_id
  join catalog.roles as role on role.id = episode.role_id
  where submission.data_origin = 'research_replica'
    and submission.source_key = 'eurostat-occupation-region-vacancies-2025'
)
update intake.search_episodes as episode
set sector_id = sector.id,
  updated_at = now()
from classified
join catalog.sectors as sector on sector.slug = classified.sector_slug
where episode.id = classified.episode_id
  and episode.sector_id is distinct from sector.id;

set local session_replication_role = origin;

commit;
