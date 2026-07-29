begin;

create table catalog.role_translations (
  role_id uuid not null
    references catalog.roles (id) on delete cascade,
  locale text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  primary key (role_id, locale),
  constraint role_translations_locale_check check (
    locale ~ '^[a-z]{2}(?:-[A-Z]{2})?$'
  ),
  constraint role_translations_display_name_check check (
    display_name = btrim(display_name)
    and char_length(display_name) between 1 and 120
  )
);

comment on table catalog.role_translations is
  'Localized role labels. Canonical Turkish labels remain in catalog.roles.';

alter table catalog.role_translations enable row level security;
alter table catalog.role_translations force row level security;

revoke all on catalog.role_translations
  from public, anon, authenticated, service_role;

create function api.list_active_localized_roles_v1(
  p_role_family_id uuid,
  p_taxonomy_version text,
  p_locale text default 'tr',
  p_after_sort_order integer default null,
  p_after_id uuid default null,
  p_limit integer default 50
)
returns table (
  id uuid,
  role_family_id uuid,
  slug text,
  display_name text,
  taxonomy_version text,
  sort_order integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    role.id,
    role.role_family_id,
    role.slug,
    coalesce(translation.display_name, role.display_name) as display_name,
    role.taxonomy_version,
    role.sort_order
  from catalog.roles as role
  join catalog.role_families as family
    on family.id = role.role_family_id
    and family.taxonomy_version = role.taxonomy_version
  left join catalog.role_translations as translation
    on translation.role_id = role.id
    and translation.locale = lower(coalesce(p_locale, 'tr'))
  where role.is_active
    and family.is_active
    and char_length(p_taxonomy_version) between 1 and 50
    and lower(coalesce(p_locale, 'tr')) ~ '^[a-z]{2}(?:-[A-Z]{2})?$'
    and role.role_family_id = p_role_family_id
    and role.taxonomy_version = p_taxonomy_version
    and (
      (
        p_after_sort_order is null
        and p_after_id is null
      )
      or (
        p_after_sort_order is not null
        and p_after_id is not null
        and (role.sort_order, role.id) >
          (p_after_sort_order, p_after_id)
      )
    )
  order by role.sort_order, role.id
  limit least(
    greatest(coalesce(p_limit, 50), 1),
    101
  );
$$;

revoke all on function api.list_active_localized_roles_v1(
  uuid,
  text,
  text,
  integer,
  uuid,
  integer
) from public, anon, authenticated, service_role;

grant execute on function api.list_active_localized_roles_v1(
  uuid,
  text,
  text,
  integer,
  uuid,
  integer
) to anon, authenticated, service_role;

comment on function api.list_active_localized_roles_v1(
  uuid,
  text,
  text,
  integer,
  uuid,
  integer
) is
  'APV03 active role projection localized by locale with canonical-label fallback.';

with translations (display_name, sort_order) as (
  select
    value,
    ordinality::integer
  from jsonb_array_elements_text(
    $labels$["3D Artist","Agronomist","Network Engineer","Network Administrator","Academic Researcher","Academic Consultant","Academic Coordinator","Smart Contract Developer","Actuarial","Field Sales Manager","R&D Engineer","R&D Specialist (Food/Agriculture)","Vehicle Designer","Research Analyst","Research Assistant","Research Scientist","Art Director","Military Analyst","Athletic Performance Coach","Lawyer","Backend Developer","Maintenance Technician","Bank Teller","Barista","Vice President (VP)","Municipal Planning Specialist","Biddable Media Director","Information Security Manager","Computer Vision Engineer","Beer Brewing Master","Plant Production Specialist","Blockchain Developer","Payroll Specialist","Regional Sales Manager","Regional Sales Executive","Regional Sales Director","Regional Sales Manager","IT Consultant","IT Support Specialist","IT Manager","Cloud Engineer","Call Center Representative","Translator / Localization Specialist","Environmental Engineer","Environmental Technician","Farm Manager","Litigation Specialist","DeFi Developer","Change Management Manager","Auditor","Maritime Logistics Coordinator","Warehouse Manager","DevOps Engineer","Other","Digital Director","Digital Marketing Manager","Digital Marketing Specialist","Language Instructor","Director","Natural Language Processing Engineer","Doctor","E-learning Content Creator","E-commerce Analyst","E-commerce Manager","E-commerce Sales Manager","Pharmacist","Editor","Education Researcher","Education Consultant","Education Coordinator","Education Policy Analyst","Education Program Manager","Education Project Manager","Education Technology Specialist","Education Specialist","Electrical Engineer","Electronics Engineer","Real Estate Consultant","Industry Engineer","Energy Analyst","Energy Engineer","Energy Trader","Instrumentation and Control Engineer","ERP Consultant","ERP Director","ERP Manager","ERP Specialist","Ethics and Compliance Officer","Film Director","Finance Manager","Financial Analyst","Financial Controller","Fintech Product Manager","Frontend Developer","Full Stack Developer","Real Estate Analyst","Real Estate Developer","Real Estate Manager","Journalist","Traditional Trade Manager","Ship Captain","Naval Engineer","General Manager","Food Safety Officer","Food Quality Specialist","Food Engineer","Food Technologist","Teller","Volunteer Coordinator","Visual Designer","Graphic Designer","Growth Manager","Group Head (Art Director)","Group Head (Copywriter)","Group Media Director","Group Client Relations Director","Security Consultant","Security Engineer","Public Relations Specialist","Damage Assessment Specialist","Damage Specialist","Air Traffic Controller","Aerospace Engineer","Animal Nutrition Specialist","Livestock Specialist","Nurse","HORECA Manager","Legal Researcher","Legal Assistant","Legal Consultant","Legal Support Specialist","Legal Advisor","Legal Operations Manager","Interior Architect","Content Marketing Manager","Content Creator","Administrative Assistant","Administrative Affairs","Export Specialist (Agriculture)","HR Consultant","HR Business Partner","HR Manager","HR Specialist","Pharmaceutical Sales Representative","Relationship Manager","Business Analyst","Business Consultant","Business Intelligence Analyst","Business Intelligence Manager","Recruitment Specialist","Junior Art Director","Junior Content Writer","Junior Geophysical Engineer","Junior Copywriter","Junior Motion Designer","Junior Project Manager","Admissions and Registration Supervisor","Mold Specialist","Quality Assurance Specialist","Quality Control Analyst (Food)","Quality Control Manager","Quality Engineer","Public Relations Manager","Public Administrator","Channel Manager","Career Consultant","Resource Development Manager","Senior Agency Producer","Senior Art Director","Senior Biddable Media Specialist","Senior Director","Senior ERP Consultant","Senior Geophysical Engineer","Senior Brand Manager Assistant","Senior Brand Manager","Senior Copywriter","Senior Motion Designer","Senior Manager","Senior Programmatic Specialist","Senior Project Manager","Senior Social Media Manager","Senior Strategist","Senior Specialist","Senior Database Administrator","Key Account Director","Key Account Manager Assistant","Key Account Manager","Leasing Consultant","Clinical Research Manager","Clinical Researcher","Control Engineer","Credit Analyst","Credit Control Specialist","Credit Collection Specialist","Credit Officer","Crypto Analyst","Corporate Trainer","Laboratory Technician","Level Designer","Port Manager","Logistics Analyst","Logistics Coordinator","Store Manager","Store Sales Consultant","Machine Learning Engineer","Assistant Brand Manager","Brand Manager","Brand Designer","Marketplace Manager","Medical Science Liaison Specialist","Media Director","Media Manager - Digital Marketing","Media Planning Specialist","Media Buying Specialist","Officer","Merchandiser","Merchandising Manager","Copywriter","Architect","Mobile Developer","Furniture Designer","Fashion Buying Specialist","Fashion Designer","Moderator","Modern Commerce Manager","Modern Commerce Executive","Motion Designer","Accountant","Kitchen Manager","Manager","Assistant Manager","Curriculum Developer","Customer Success Manager","Customer Service Representative","Customer Relations Director","Deputy General Manager of Customer Relations","Customer Relations Supervisor","Customer Manager","Music Producer","Shipping Organizer","Office Manager","School Principal","School Administrator","Online Instructor","Online Merchandiser","Operations Assistant","Operations Manager","Operations Specialist","Deputy General Manager Responsible for Operations","Automation Engineer","Automotive Engineer","Game Developer","Game Designer","Game Producer","Dean of Student Affairs","Student Affairs Specialist","Learning and Development Manager","Lecturer","Lecturer Assistant","Instructional Designer","Teacher","Teacher Assistant","Private Banking Consultant","Market Research Analyst","Marketing Artist","Marketing Specialist","Performance Marketing Manager","Pilot","Policy Analyst","Policy Consultant","Production Assistant","Program Manager","Program Responsible Person","Programmatic Director","Programmatic Manager","Programmatic Specialist","Project Engineer","Project Manager","Process Engineer","QA Test Specialist","Reporting Manager","Reporting Specialist","Regulatory Compliance Analyst","Guidance Consultant","Restaurant Manager","RF Engineer","Risk Analyst","Risk Assessment Specialist","Risk Manager","Field Sales Representative","Field Technician","Switchboard Operator","Purchasing Manager (Food and Agriculture)","Purchasing Specialist","Sales Analyst","Sales Director","Sales Development Representative","Sales Coordinator","Sales Manager","Sales Engineer","Sales Supervisor","Sales Representative","Sales Manager","Defense Consultant","Defense Industry Engineer","Defense Coordinator","SCADA Engineer","SEO Specialist","Greenhouse Manager","Sound Engineer","Showroom Manager","Penetration Testing Specialist","Cybersecurity Analyst","Insurance Agent","Systems Engineer","Systems Administrator","Sommelier","Social Media Group Head","Social Media Manager","Social Media Supervisor","Contracts Manager","Contracts Specialist","Sports Manager","Intern","NGO Project Coordinator","Strategy Director","Strategy Planning Specialist","Deputy General Manager Responsible for Strategy","Irrigation Engineer","Sustainable Agriculture Specialist","Sustainability Manager","Network Operator","Chief","Company Lawyer","In-House Legal Counsel","Branch Manager","Team Leader","Agricultural Consultant","Agricultural Economist","Agricultural Machinery Technician","Transportation Manager","Supply Chain Analyst","Supply Chain Coordinator (Food)","Supply Chain Manager","Technical Support Engineer","Technical Operator","Technical Sales Engineer","Technical Product Manager","Chief Technology Officer (CTO)","Textile Engineer","Telecommunications Analyst","Telecommunications Engineer","Medical Technician","Commercial Marketing Manager","Commercial Marketing Specialist","Commercial Marketing Executive","Soil Scientist","Trading Director","Trading Manager","Trading Specialist","Aircraft Maintenance Engineer","Flight Operations Manager","National Sales Manager","UX Researcher","UX/UI Designer","Compliance Manager","Compliance Specialist","Compliance Officer","Specialist","Compensation and Benefits Specialist","University Registration Manager","Production Agronomist","Production Engineer","Production Planning Specialist","Production Supervisor","Product Development Engineer","Product Development Specialist","Product Designer","Product Manager","Senior Creative Director","Senior Executive Assistant","Van Sales Representative","Data Analyst","Data Scientist","Data Protection Officer (DPO)","Data Engineer","Database Manager","Database Administrator","Veterinary Technician","Video Editor","AI Engineer","Creative Director","Deputy General Manager of Creative Affairs","Investment Banker","Investment Advisor","Publishing Manager","Software Development Manager","Software Engineer","Talent Acquisition Manager","Management Consultant","Agricultural Engineer"]$labels$::jsonb
  ) with ordinality
)
insert into catalog.role_translations (
  role_id,
  locale,
  display_name
)
select
  role.id,
  'en',
  translations.display_name
from catalog.roles as role
join translations
  on translations.sort_order = role.sort_order
where role.role_family_id = 'b8000000-0000-4000-8100-000000000007'
  and role.taxonomy_version = '2026.1'
on conflict (role_id, locale) do update set
  display_name = excluded.display_name;

commit;
