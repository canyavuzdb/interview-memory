-- Curated hiring-market brands complement the KAP legal-entity import.
-- Names are intentionally canonical display names: aliases can be added as
-- evidence arrives, while the search UI never exposes unverified user input.

with source(slug, display_name, country_code) as (
  values
    ('trendyol', 'Trendyol', 'TR'), ('getir', 'Getir', 'TR'),
    ('hepsiburada', 'Hepsiburada', 'TR'), ('yemeksepeti', 'Yemeksepeti', 'TR'),
    ('sahibinden', 'sahibinden.com', 'TR'), ('iyzico', 'iyzico', 'TR'),
    ('papara', 'Papara', 'TR'), ('param', 'Param', 'TR'),
    ('marti-tech', 'Martı', 'TR'), ('peak', 'Peak', 'TR'),
    ('dream-games', 'Dream Games', 'TR'), ('rollic-games', 'Rollic', 'TR'),
    ('spyke-games', 'Spyke Games', 'TR'), ('mobiliz', 'Mobiliz', 'TR'),
    ('obilet', 'Obilet', 'TR'), ('enuygun', 'ENUYGUN', 'TR'),
    ('tatildekirala', 'TatildeKirala', 'TR'), ('otomol', 'OTOMOL', 'TR'),
    ('fiat-turkiye', 'FIAT Türkiye', 'TR'), ('mercedes-benz-turk', 'Mercedes-Benz Türk', 'TR'),
    ('ford-otosan', 'Ford Otosan', 'TR'), ('toyota-turkiye', 'Toyota Türkiye', 'TR'),
    ('hyundai-motor-turkiye', 'Hyundai Motor Türkiye', 'TR'), ('renault-turkiye', 'Renault Türkiye', 'TR'),
    ('arcelik', 'Arçelik', 'TR'), ('vestel', 'Vestel', 'TR'),
    ('beko', 'Beko', 'TR'), ('koc-holding', 'Koç Holding', 'TR'),
    ('sabanci-holding', 'Sabancı Holding', 'TR'), ('borusan', 'Borusan', 'TR'),
    ('dogus-grubu', 'Doğuş Grubu', 'TR'), ('anadolu-grubu', 'Anadolu Grubu', 'TR'),
    ('zorlu-holding', 'Zorlu Holding', 'TR'), ('eczacibasi', 'Eczacıbaşı', 'TR'),
    ('kalyon-holding', 'Kalyon Holding', 'TR'), ('limak', 'Limak', 'TR'),
    ('ronesans-holding', 'Rönesans Holding', 'TR'), ('turkcell', 'Turkcell', 'TR'),
    ('vodafone-turkiye', 'Vodafone Türkiye', 'TR'), ('turk-telekom', 'Türk Telekom', 'TR'),
    ('garanti-bbva', 'Garanti BBVA', 'TR'), ('akbank', 'Akbank', 'TR'),
    ('yapi-kredi', 'Yapı Kredi', 'TR'), ('isbank', 'İş Bankası', 'TR'),
    ('denizbank', 'DenizBank', 'TR'), ('qnb-turkiye', 'QNB Türkiye', 'TR'),
    ('teb', 'TEB', 'TR'), ('ziraat-bankasi', 'Ziraat Bankası', 'TR'),
    ('halkbank', 'Halkbank', 'TR'), ('vakifbank', 'VakıfBank', 'TR'),
    ('bim', 'BİM', 'TR'), ('migros', 'Migros', 'TR'),
    ('a101', 'A101', 'TR'), ('sok', 'ŞOK', 'TR'),
    ('lc-waikiki', 'LC Waikiki', 'TR'), ('defacto', 'DeFacto', 'TR'),
    ('mavi', 'Mavi', 'TR'), ('koton', 'Koton', 'TR'),
    ('pegasus', 'Pegasus', 'TR'), ('turkish-airlines', 'Turkish Airlines', 'TR'),
    ('tav-airports', 'TAV Airports', 'TR'), ('sunexpress', 'SunExpress', 'TR'),
    ('coca-cola-icecek', 'Coca-Cola İçecek', 'TR'), ('ulker', 'Ülker', 'TR'),
    ('eti', 'Eti', 'TR'), ('pinar', 'Pınar', 'TR'),
    ('amazon', 'Amazon', 'US'), ('alphabet-google', 'Google', 'US'),
    ('apple', 'Apple', 'US'), ('microsoft', 'Microsoft', 'US'),
    ('meta', 'Meta', 'US'), ('netflix', 'Netflix', 'US'),
    ('tesla', 'Tesla', 'US'), ('nvidia', 'NVIDIA', 'US'),
    ('ibm', 'IBM', 'US'), ('oracle', 'Oracle', 'US'),
    ('salesforce', 'Salesforce', 'US'), ('adobe', 'Adobe', 'US'),
    ('uber', 'Uber', 'US'), ('airbnb', 'Airbnb', 'US'),
    ('linkedin', 'LinkedIn', 'US'), ('stripe', 'Stripe', 'US'),
    ('datadog', 'Datadog', 'US'), ('snowflake', 'Snowflake', 'US'),
    ('palantir', 'Palantir', 'US'), ('crowdstrike', 'CrowdStrike', 'US'),
    ('shopify', 'Shopify', 'CA'), ('spotify', 'Spotify', 'SE'),
    ('booking-com', 'Booking.com', 'NL'), ('adyen', 'Adyen', 'NL'),
    ('shell', 'Shell', 'GB'), ('bp', 'bp', 'GB'),
    ('hsbc', 'HSBC', 'GB'), ('barclays', 'Barclays', 'GB'),
    ('revolut', 'Revolut', 'GB'), ('wise', 'Wise', 'GB'),
    ('deliveroo', 'Deliveroo', 'GB'), ('just-eat-takeaway', 'Just Eat Takeaway.com', 'NL'),
    ('siemens', 'Siemens', 'DE'), ('sap', 'SAP', 'DE'),
    ('zalando', 'Zalando', 'DE'), ('bmw', 'BMW Group', 'DE'),
    ('mercedes-benz', 'Mercedes-Benz Group', 'DE'), ('volkswagen', 'Volkswagen Group', 'DE'),
    ('bosch', 'Bosch', 'DE'), ('allianz', 'Allianz', 'DE'),
    ('deloitte', 'Deloitte', 'GB'), ('pwc', 'PwC', 'GB'),
    ('ey', 'EY', 'GB'), ('kpmg', 'KPMG', 'NL'),
    ('accenture', 'Accenture', 'IE'), ('mckinsey', 'McKinsey & Company', 'US'),
    ('bain-company', 'Bain & Company', 'US'), ('bcg', 'Boston Consulting Group', 'US'),
    ('loreal', 'L''Oréal', 'FR'), ('lvmh', 'LVMH', 'FR'),
    ('danone', 'Danone', 'FR'), ('airbus', 'Airbus', 'NL'),
    ('ikea', 'IKEA', 'SE'), ('h-m', 'H&M', 'SE'),
    ('maersk', 'Maersk', 'DK'), ('novo-nordisk', 'Novo Nordisk', 'DK'),
    ('unilever', 'Unilever', 'GB'), ('nestle', 'Nestlé', 'CH'),
    ('roche', 'Roche', 'CH'), ('novartis', 'Novartis', 'CH'),
    ('ubisoft', 'Ubisoft', 'FR'), ('asus', 'ASUS', 'TW'),
    ('samsung', 'Samsung', 'KR'), ('lg', 'LG', 'KR'),
    ('hyundai', 'Hyundai', 'KR'), ('toyota', 'Toyota', 'JP'),
    ('sony', 'Sony', 'JP'), ('honda', 'Honda', 'JP'),
    ('tiktok', 'TikTok', 'SG'), ('bytedance', 'ByteDance', 'CN'),
    ('alibaba', 'Alibaba Group', 'CN'), ('tencent', 'Tencent', 'CN'),
    ('canva', 'Canva', 'AU'), ('atlassian', 'Atlassian', 'AU')
), inserted as (
  insert into catalog.companies (
    slug, display_name, country_code, verification_status, publication_status,
    external_case_ref, external_case_status, external_case_synced_at
  )
  select
    source.slug, source.display_name, source.country_code, 'verified', 'published',
    'catalog:curated-employers-v1', 'curated', now()
  from source
  on conflict (slug) do update
    set display_name = excluded.display_name,
        country_code = excluded.country_code,
        verification_status = excluded.verification_status,
        publication_status = excluded.publication_status,
        external_case_status = excluded.external_case_status,
        external_case_synced_at = excluded.external_case_synced_at
  returning id, display_name, country_code
), inserted_aliases as (
  insert into catalog.company_aliases (
    company_id, normalized_alias, locale, country_code, source_code
  )
  select
    inserted.id,
    catalog.normalize_company_alias_v1(inserted.display_name),
    'tr',
    inserted.country_code,
    'import'
  from inserted
  where not exists (
    select 1
    from catalog.company_aliases as existing_alias
    where existing_alias.normalized_alias = catalog.normalize_company_alias_v1(inserted.display_name)
      and existing_alias.locale = 'tr'
      and existing_alias.country_code = inserted.country_code
      and existing_alias.review_status = 'approved'
  )
  returning id
)
update catalog.company_aliases as alias
set review_status = 'approved'
from inserted_aliases
where alias.id = inserted_aliases.id;
