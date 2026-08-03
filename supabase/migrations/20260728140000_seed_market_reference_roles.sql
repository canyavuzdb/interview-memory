begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- This reference taxonomy backs the searchable position picker.  It is kept
-- separate from the original role families so the existing benchmark cohorts
-- remain stable while the picker can cover a broader labour market.
insert into catalog.role_families (
  id,
  slug,
  display_name,
  taxonomy_version,
  sort_order,
  is_active
)
values (
  'b8000000-0000-4000-8100-000000000007',
  'market-reference',
  'Market reference roles',
  '2026.1',
  70,
  true
)
on conflict (slug, taxonomy_version) do update set
  display_name = excluded.display_name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

with source (display_name, sort_order) as (
  select
    value,
    ordinality::integer
  from jsonb_array_elements_text(
    $roles$["3D Sanatçısı","Agronomist","Ağ Mühendisi","Ağ Yöneticisi","Akademik Araştırmacı","Akademik Danışman","Akademik Koordinatör","Akıllı Kontrat Geliştirici","Aktüer","Alan Satış Müdürü","Ar-Ge Mühendisi","Ar-Ge Uzmanı (Gıda / Tarım)","Araç Tasarımcısı","Araştırma Analisti","Araştırma Görevlisi","Araştırmacı Bilim İnsanı","Art Direktör","Askeri Analist","Atletik Performans Antrenörü","Avukat","Backend Geliştirici","Bakım Teknisyeni","Banka Gişe Yetkilisi","Barista","Başkan Yardımcısı (VP)","Belediye Planlama Uzmanı","Biddable Media Direktörü","Bilgi Güvenliği Müdürü","Bilgisayarlı Görü Mühendisi","Bira Üretim Ustası","Bitkisel Üretim Uzmanı","Blockchain Geliştirici","Bordro Uzmanı","Bölge Satış Müdürü","Bölge Satış Yöneticisi","Bölgesel Satış Direktörü","Bölgesel Satış Müdürü","BT Danışmanı","BT Destek Uzmanı","BT Müdürü","Bulut Mühendisi","Çağrı Merkezi Temsilcisi","Çevirmen / Lokalizasyon Uzmanı","Çevre Mühendisi","Çevre Teknisyeni","Çiftlik Müdürü","Dava Takip Uzmanı","DeFi Geliştirici","Değişim Yönetimi Müdürü","Denetçi","Deniz Lojistiği Koordinatörü","Depo Müdürü","DevOps Mühendisi","Diğer","Dijital Direktör","Dijital Pazarlama Müdürü","Dijital Pazarlama Uzmanı","Dil Eğitmeni","Direktör","Doğal Dil İşleme Mühendisi","Doktor","E-öğrenme İçerik Üreticisi","E-ticaret Analisti","E-ticaret Müdürü","E-Ticaret Satış Müdürü","Eczacı","Editör","Eğitim Araştırmacısı","Eğitim Danışmanı","Eğitim Koordinatörü","Eğitim Politikaları Analisti","Eğitim Programı Müdürü","Eğitim Proje Müdürü","Eğitim Teknolojileri Uzmanı","Eğitim Uzmanı","Elektrik Mühendisi","Elektronik Mühendisi","Emlak Danışmanı","Endüstri Mühendisi","Enerji Analisti","Enerji Mühendisi","Enerji Traderı","Enstrümantasyon ve Kontrol Mühendisi","ERP Danışmanı","ERP Direktörü","ERP Müdürü","ERP Uzmanı","Etik ve Uyum Yetkilisi","Film Yönetmeni","Finans Müdürü","Finansal Analist","Finansal Kontrolör","Fintech Ürün Yöneticisi","Frontend Geliştirici","Full Stack Geliştirici","Gayrimenkul Analisti","Gayrimenkul Geliştiricisi","Gayrimenkul Müdürü","Gazeteci","Geleneksel Ticaret Müdürü","Gemi Kaptanı","Gemi Mühendisi","Genel Müdür","Gıda Güvenliği Yetkilisi","Gıda Kalite Uzmanı","Gıda Mühendisi","Gıda Teknoloğu","Gişe Yetkilisi","Gönüllü Koordinatörü","Görsel Tasarımcı","Grafik Tasarımcı","Growth Müdürü","Grup Başkanı (Art Direktör)","Grup Başkanı (Metin Yazarı)","Grup Medya Direktörü","Grup Müşteri İlişkileri Direktörü","Güvenlik Danışmanı","Güvenlik Mühendisi","Halkla İlişkiler Uzmanı","Hasar Değerlendirme Uzmanı","Hasar Uzmanı","Hava Trafik Kontrolörü","Havacılık ve Uzay Mühendisi","Hayvan Besleme Uzmanı","Hayvancılık Uzmanı","Hemşire","HORECA Müdürü","Hukuk Araştırmacısı","Hukuk Asistanı","Hukuk Danışmanı","Hukuk Destek Uzmanı","Hukuk Müşaviri","Hukuk Operasyonları Müdürü","İç Mimar","İçerik Pazarlama Müdürü","İçerik Üreticisi","İdari Asistan","İdari İşler","İhracat Uzmanı (Tarım)","İK Danışmanı","İK İş Ortağı","İK Müdürü","İK Uzmanı","İlaç Satış Temsilcisi","İlişki Yöneticisi","İş Analisti","İş Danışmanı","İş Zekası Analisti","İş Zekası Müdürü","İşe Alım Uzmanı","Junior Art Direktör","Junior İçerik Yazarı","Junior Jeofizik Mühendisi","Junior Metin Yazarı","Junior Motion Designer","Junior Proje Yöneticisi","Kabul ve Kayıt Sorumlusu","Kalıp Uzmanı","Kalite Güvence Uzmanı","Kalite Kontrol Analisti (Gıda)","Kalite Kontrol Müdürü","Kalite Mühendisi","Kamu İlişkileri Müdürü","Kamu Yöneticisi","Kanal Müdürü","Kariyer Danışmanı","Kaynak Geliştirme Müdürü","Kıdemli Ajans Prodüktörü","Kıdemli Art Direktör","Kıdemli Biddable Media Uzmanı","Kıdemli Direktör","Kıdemli ERP Danışmanı","Kıdemli Jeofizik Mühendisi","Kıdemli Marka Müdür Yardımcısı","Kıdemli Marka Müdürü","Kıdemli Metin Yazarı","Kıdemli Motion Designer","Kıdemli Müdür","Kıdemli Programatik Uzmanı","Kıdemli Proje Yöneticisi","Kıdemli Sosyal Medya Müdürü","Kıdemli Stratejist","Kıdemli Uzman","Kıdemli Veritabanı Yöneticisi","Kilit Müşteri Direktörü","Kilit Müşteri Yönetici Yardımcısı","Kilit Müşteri Yöneticisi","Kiralama Danışmanı","Klinik Araştırma Müdürü","Klinik Araştırmacı","Kontrol Mühendisi","Kredi Analisti","Kredi Kontrol Uzmanı","Kredi Tahsilat Uzmanı","Kredi Yetkilisi","Kripto Analisti","Kurumsal Eğitmen","Laboratuvar Teknisyeni","Level Designer","Liman Müdürü","Lojistik Analisti","Lojistik Koordinatörü","Mağaza Müdürü","Mağaza Satış Danışmanı","Makine Öğrenmesi Mühendisi","Marka Müdür Yardımcısı","Marka Müdürü","Marka Tasarımcısı","Marketplace Müdürü","Medikal Bilim İrtibat Uzmanı","Medya Direktörü","Medya Müdürü - Dijital Pazarlama","Medya Planlama Uzmanı","Medya Satın Alma Uzmanı","Memur","Merchandiser","Merchandising Müdürü","Metin Yazarı","Mimar","Mobil Geliştirici","Mobilya Tasarımcısı","Moda Satın Alma Uzmanı","Moda Tasarımcısı","Moderatör","Modern Ticaret Müdürü","Modern Ticaret Yöneticisi","Motion Designer","Muhasebeci","Mutfak Müdürü","Müdür","Müdür Yardımcısı","Müfredat Geliştirici","Müşteri Başarı Müdürü","Müşteri Hizmetleri Temsilcisi","Müşteri İlişkileri Direktörü","Müşteri İlişkileri Genel Müdür Yardımcısı","Müşteri İlişkileri Süpervizörü","Müşteri Yöneticisi","Müzik Yapımcısı","Nakliye Organizatörü","Ofis Müdürü","Okul Müdürü","Okul Yöneticisi","Online Eğitmen","Online Merchandiser","Operasyon Asistanı","Operasyon Müdürü","Operasyon Uzmanı","Operasyonlardan Sorumlu Genel Müdür Yardımcısı","Otomasyon Mühendisi","Otomotiv Mühendisi","Oyun Geliştirici","Oyun Tasarımcısı","Oyun Yapımcısı","Öğrenci İşleri Dekanı","Öğrenci İşleri Uzmanı","Öğrenme ve Gelişim Müdürü","Öğretim Görevlisi","Öğretim Görevlisi Yardımcısı","Öğretim Tasarımcısı","Öğretmen","Öğretmen Yardımcısı","Özel Bankacılık Danışmanı","Pazar Araştırma Analisti","Pazarlama Sanatçısı","Pazarlama Uzmanı","Performans Pazarlama Müdürü","Pilot","Politika Analisti","Politika Danışmanı","Prodüksiyon Asistanı","Program Müdürü","Program Sorumlusu","Programatik Direktörü","Programatik Müdürü","Programatik Uzmanı","Proje Mühendisi","Proje Yöneticisi","Proses Mühendisi","QA Test Uzmanı","Raporlama Müdürü","Raporlama Uzmanı","Regülasyon Uyum Analisti","Rehberlik Danışmanı","Restoran Müdürü","RF Mühendisi","Risk Analisti","Risk Değerlendirme Uzmanı","Risk Müdürü","Saha Satış Temsilcisi","Saha Teknisyeni","Santral Operatörü","Satın Alma Müdürü (Gıda ve Tarım)","Satın Alma Uzmanı","Satış Analisti","Satış Direktörü","Satış Geliştirme Temsilcisi","Satış Koordinatörü","Satış Müdürü","Satış Mühendisi","Satış Süpervizörü","Satış Temsilcisi","Satış Yöneticisi","Savunma Danışmanı","Savunma Sanayi Mühendisi","Savunuculuk Koordinatörü","SCADA Mühendisi","SEO Uzmanı","Sera Müdürü","Ses Mühendisi","Showroom Müdürü","Sızma Testi Uzmanı","Siber Güvenlik Analisti","Sigorta Acentesi","Sistem Mühendisi","Sistem Yöneticisi","Sommelier","Sosyal Medya Grup Başkanı","Sosyal Medya Müdürü","Sosyal Medya Süpervizörü","Sözleşme Müdürü","Sözleşme Uzmanı","Spor Yöneticisi","Stajyer","STK Proje Koordinatörü","Strateji Direktörü","Strateji Planlama Uzmanı","Stratejiden Sorumlu Genel Müdür Yardımcısı","Sulama Mühendisi","Sürdürülebilir Tarım Uzmanı","Sürdürülebilirlik Müdürü","Şebeke Operatörü","Şef","Şirket Avukatı","Şirket İçi Hukuk Müşaviri","Şube Müdürü","Takım Lideri","Tarım Danışmanı","Tarım Ekonomisti","Tarım Makineleri Teknisyeni","Taşımacılık Müdürü","Tedarik Zinciri Analisti","Tedarik Zinciri Koordinatörü (Gıda)","Tedarik Zinciri Müdürü","Teknik Destek Mühendisi","Teknik Operatör","Teknik Satış Mühendisi","Teknik Ürün Yöneticisi","Teknolojiden Sorumlu Üst Yönetici (CTO)","Tekstil Mühendisi","Telekom Analisti","Telekom Mühendisi","Tıbbi Teknisyen","Ticari Pazarlama Müdürü","Ticari Pazarlama Uzmanı","Ticari Pazarlama Yöneticisi","Toprak Bilimci","Trading Direktörü","Trading Müdürü","Trading Uzmanı","Uçak Bakım Mühendisi","Uçuş Operasyonları Müdürü","Ulusal Satış Müdürü","UX Araştırmacısı","UX/UI Tasarımcısı","Uyum Müdürü","Uyum Uzmanı","Uyum Yetkilisi","Uzman","Ücret ve Yan Haklar Uzmanı","Üniversite Kayıt İşleri Müdürü","Üretim Agronomisti","Üretim Mühendisi","Üretim Planlama Uzmanı","Üretim Süpervizörü","Ürün Geliştirme Mühendisi","Ürün Geliştirme Uzmanı","Ürün Tasarımcısı","Ürün Yöneticisi","Üst Düzey Yaratıcı Direktör","Üst Düzey Yönetici Asistanı","Van Satış Temsilcisi","Veri Analisti","Veri Bilimci","Veri Koruma Sorumlusu (DPO)","Veri Mühendisi","Veritabanı Müdürü","Veritabanı Yöneticisi","Veteriner Teknisyeni","Video Editörü","Yapay Zeka Mühendisi","Yaratıcı Direktör","Yaratıcı İşler Genel Müdür Yardımcısı","Yatırım Bankacısı","Yatırım Danışmanı","Yayıncılık Müdürü","Yazılım Geliştirme Müdürü","Yazılım Mühendisi","Yetenek Kazanımı Müdürü","Yönetim Danışmanı","Ziraat Mühendisi"]$roles$::jsonb
  ) with ordinality
),
normalized as (
  select
    display_name,
    sort_order,
    regexp_replace(
      regexp_replace(
        lower(translate(display_name, 'çğıöşüÇĞİÖŞÜ', 'cgiosuCGIOSU')),
        '[^a-z0-9]+',
        '-',
        'g'
      ),
      '(^-+|-+$)',
      '',
      'g'
    ) as slug
  from source
)
insert into catalog.roles (
  role_family_id,
  slug,
  display_name,
  taxonomy_version,
  sort_order,
  is_active
)
select
  'b8000000-0000-4000-8100-000000000007',
  normalized.slug,
  normalized.display_name,
  '2026.1',
  normalized.sort_order,
  true
from normalized
on conflict (slug, taxonomy_version) do update set
  role_family_id = excluded.role_family_id,
  display_name = excluded.display_name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

commit;
