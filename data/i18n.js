export const supportedLocales = ['tr', 'en']

export function isSupportedLocale(locale) {
  return supportedLocales.includes(locale)
}

export function getMessages(locale) {
  return messages[locale] ?? messages.tr
}

const responseStatuses = {
  tr: [
    { label: 'Zamanında', value: '%34', width: '34%', tone: 'timely' },
    { label: 'Gecikmiş', value: '%13', width: '13%', tone: 'late' },
    { label: 'Otomatik ret', value: '%12', width: '12%', tone: 'rejected' },
    { label: 'Yanıtsız', value: '%41', width: '41%', tone: 'silent' },
  ],
  en: [
    { label: 'On time', value: '34%', width: '34%', tone: 'timely' },
    { label: 'Delayed', value: '13%', width: '13%', tone: 'late' },
    { label: 'Automated rejection', value: '12%', width: '12%', tone: 'rejected' },
    { label: 'No response', value: '41%', width: '41%', tone: 'silent' },
  ],
}

const messages = {
  tr: {
    localeName: 'Türkçe',
    common: {
      homeAria: 'Interview Memory ana sayfa',
      languageLabel: 'Dil seçimi',
      backHome: 'Ana sayfaya dön',
      themeToggle: 'Açık ve koyu tema arasında geçiş yap',
      themeTitle: 'Temayı değiştir',
    },
    metadata: {
      home: {
        title: 'Interview Memory',
        description:
          'Adayların anonim başvuru ve mülakat deneyimlerini topluluk verisine dönüştüren platform.',
      },
      surveys: {
        title: 'Anonim Anketler',
        description:
          'Şirket deneyimini veya başvuru ve mülakat oranlarını kayıt olmadan anonim olarak paylaş.',
      },
      companyExperience: {
        title: 'Şirket Deneyimini Paylaş',
        description:
          'Bir şirketle yaşadığın başvuru veya mülakat deneyimini kayıt olmadan anonim olarak paylaş.',
      },
      applicationBenchmark: {
        title: 'İş Arama Sürecini Karşılaştır',
        description:
          'İş arama sürecini anonim olarak paylaş ve temsili topluluk verisiyle karşılaştır.',
      },
      login: {
        title: 'Giriş Yap',
        description:
          'Google hesabınla Interview Memory giriş akışını incele.',
      },
      notFound: {
        title: 'Sayfa Bulunamadı',
        description:
          'Aradığın sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.',
      },
    },
    header: {
      navLabel: 'Ana navigasyon',
      surveys: 'Anketler',
      howItWorks: 'Nasıl çalışır?',
      data: 'Veriler',
      signIn: 'Giriş yap',
    },
    login: {
      eyebrow: 'Hesap erişimi',
      title: 'Deneyimlerin kaybolmasın.',
      description:
        'Giriş yaptığında katkılarını takip edebilir ve yalnızca hesap sahiplerine açılan topluluk içgörülerine erişebilirsin.',
      benefitsEyebrow: 'Hesapla neler değişir?',
      benefits: [
        'Anonim katkı geçmişini tek yerde takip et',
        'Kaydettiğin şirket ve rol sinyallerine geri dön',
        'Üyelere özel detaylı içgörülere eriş',
      ],
      accessTitle: 'Hesabına hızlıca eriş',
      accessDescription:
        'Google hesabınla giriş yapabilir veya hesap oluşturmadan anonim olarak kullanmaya devam edebilirsin.',
      googleCta: 'Google ile devam et',
      alternative: 'ya da',
      previewNotice:
        'Bu bir arayüz önizlemesidir. Google OAuth henüz bağlanmadı ve hiçbir bilgi gönderilmedi.',
      privacyNote:
        'Google ile devam ettiğinde temel hesap bilgilerin giriş için kullanılır; anket yanıtların herkese açık kimliğinle paylaşılmaz.',
      anonymousCta: 'Anonim kullanmaya devam et',
    },
    notFound: {
      eyebrow: 'Kayıp sinyal',
      title: 'Bu sayfadan geri dönüş alamadık.',
      description:
        'Aradığın bağlantı sessizliğe karışmış olabilir. Ana sayfaya dönebilir veya anonim anketleri keşfetmeye devam edebilirsin.',
      homeCta: 'Ana sayfaya dön',
      surveysCta: 'Anketleri keşfet',
      codeLabel: 'Sayfa bulunamadı',
    },
    home: {
      hero: {
        eyebrow: '01 / İş arama karşılaştırması',
        title: 'İş arama sürecinde',
        titleHighlight: 'neredesin?',
        subtitle: 'Süreni tahmin etme. Benzer adaylarla karşılaştır.',
        detailsLabel: 'Karşılaştırmada kullanılan bilgiler',
        details: ['Rol · deneyim · süre', 'Topluluk karşılaştırması'],
        signalsLabel: 'Başvuru yanıt durumları',
        signals: responseStatuses.tr.map(({ label }) => label),
        descriptionParts: {
          pre: 'Başvuru sonuçlarını ',
          highlight: 'anonim',
          post: ' olarak paylaş; iş arama sürenin topluluk ortalamasında nerede durduğunu gör.',
        },
        explore: 'İş arama süreni karşılaştır',
        benchmark: 'Topluluk verilerini incele',
      },
      signal: {
        eyebrow: 'Topluluk sinyali',
        title: 'Benzer adaylar kaç başvuruda dönüş alıyor?',
        description:
          'Deneyim, rol ve network verileriyle başvuru süreçlerinin görünmeyen tarafını ölçülebilir hale getiriyoruz.',
        companyTitle: 'Şirket deneyimi',
        companyDescription:
          'Başvuru, red, ghosting, HR ve mülakat süreci sinyalleri.',
        benchmarkTitle: 'Başvuru benchmark',
        benchmarkDescription:
          'Kaç başvuruya dönüş, HR görüşmesi ve teknik mülakat düşüyor?',
        panelLabel: 'Topluluk veri özeti',
        panelType: 'Veri dosyası',
        sampleData: 'Örnek veri',
        sampleSize: '1.248 katkı',
        methodology:
          'Bu prototipteki değerler temsili veridir; gerçek topluluk ölçümü değildir.',
        flowChartLabel: 'Başvuru aşamaları',
        distributionChartLabel: 'Süreç dağılımı',
        viewCta: 'Detayları ve anketi gör',
        views: [
          {
            id: 'application-marathon',
            type: 'funnel',
            path: '/surveys/application-benchmark',
            tabLabel: 'Başvuru maratonu',
            eyebrow: 'Sinyal / Başvuru maratonu',
            title: 'İş bulana kadar ortalama kaç başvuru gerekiyor?',
            description:
              'Topluluk verisi, iş arayanların başvurudan teklife uzanan yolculuğunu ve harcadığı süreyi görünür kılar.',
            primaryValue: '72',
            primaryLabel: 'Başvuru',
            secondaryValue: '14 hafta',
            secondaryLabel: 'Medyan süre',
            chartLabel: 'Başvuru hunisi',
            stages: [
              { label: 'Başvuru', value: '72', share: '%100' },
              { label: 'Dönüş', value: '28', share: '%39' },
              { label: 'Mülakat', value: '8', share: '%11' },
              { label: 'Teklif', value: '1.4', share: '%2' },
            ],
          },
          {
            id: 'company-report',
            type: 'funnel',
            path: '/surveys/company-experience',
            tabLabel: 'Şirket karnesi',
            eyebrow: 'Sinyal / Şirket karnesi',
            title: 'Adayların en çok raporladığı 3 sorun',
            description:
              'Şirketlerin işe alım süreçleri aday deneyimleriyle değerlendiriliyor. En sık tekrarlanan sorunlar görünür hale geliyor.',
            primaryValue: '847',
            primaryLabel: 'Deneyim',
            secondaryValue: '%41',
            secondaryLabel: 'Yanıtsız başvuru',
            chartLabel: 'En sık raporlanan sorunlar',
            stages: [
              { label: 'Ghosting', value: '347', share: '%41' },
              { label: 'Gecikme', value: '288', share: '%34' },
              { label: 'Sebepsiz red', value: '237', share: '%28' },
              { label: 'Diğer', value: '127', share: '%15' },
            ],
          },
          {
            id: 'silent-processes',
            type: 'signal',
            path: '/surveys/hr-process',
            tabLabel: 'Sessiz süreçler',
            eyebrow: 'Sinyal / HR şeffaflığı',
            title: '"Dönüş yapacağız" denip dönülmeme oranı %58',
            description:
              'HR ekiplerinin süreç boyunca şeffaflığını, dönüş sürelerini ve elenme sebebi paylaşma oranlarını ölçüyoruz.',
            primaryValue: '%58',
            primaryLabel: 'Söz verildi, dönülmedi',
            secondaryValue: '%12',
            secondaryLabel: 'Elenme sebebi paylaşıldı',
            chartLabel: 'Yanıt durumu',
            distribution: responseStatuses.tr,
          },
          {
            id: 'salary-reality',
            type: 'comparison',
            path: '/surveys/salary-benchmark',
            tabLabel: 'Maaş gerçekliği',
            eyebrow: 'Karşılaştırma / İlan ve teklif',
            title: 'İlandaki maaş ile teklif edilen maaş aynı değil',
            description:
              'Adayların beklentisi, ilanda belirtilen aralık ve gerçekleşen teklif arasındaki farkı topluluk verisiyle karşılaştırıyoruz.',
            comparison: {
              promiseLabel: 'Beklenti',
              promiseValue: '42K ₺',
              promiseDescription: 'Adayların başvuru öncesi hedeflediği medyan net maaş.',
              realityLabel: 'Teklif',
              realityValue: '34K ₺',
              realityDescription: 'Adaylara sunulan medyan net maaş teklifi.',
              deltaLabel: 'Beklenti ile teklif arasındaki fark',
              deltaValue: '-%19',
            },
          },
        ],
        bottomEyebrow: 'Sessiz başvurular artık görünür',
        bottomText:
          'Bir adayın yaşadığı belirsizlik, toplulukla birleşince işe alım süreçlerinin gerçek sinyaline dönüşür.',
      },
      howItWorks: [
        {
          title: 'Anket seç',
          description:
            'Şirket deneyimini paylaşabilir ya da başvuru/mülakat oranını topluluk verisine ekleyebilirsin.',
        },
        {
          title: 'Anonim doldur',
          description:
            'Kayıt olmadan sürecin nerede kaldığını, dönüş alıp almadığını ve feedback durumunu paylaş.',
        },
        {
          title: 'Veri oluşsun',
          description:
            'Toplanan anonim veriler şirketlerin işe alım davranışlarını ve adayların başvuru gerçekliğini görünür kılar.',
        },
      ],
      finalCta: {
        eyebrow: 'Katkın önemli',
        title:
          'Başvuru süreçleri sessiz kaldıkça belirsizlik büyür. Paylaşıldıkça veri olur.',
        company: 'Şirket deneyimi paylaş',
        benchmark: 'Başvuru oranını paylaş',
      },
    },
    trustItems: [
      {
        title: 'Kayıt gerekmiyor',
        description: 'Anketlere katılmak için hesap oluşturmak zorunda değilsin.',
      },
      {
        title: 'Anonim katılım',
        description:
          'İsim, e-posta veya kişisel bilgi paylaşmadan katkı verebilirsin.',
      },
      {
        title: 'Güvenli veri yaklaşımı',
        description:
          'Kişi isimleri, gizli dokümanlar ve hakaret içeren içerikler yayınlanmaz.',
      },
      {
        title: 'Moderasyonlu paylaşım',
        description:
          'Toplanan deneyimler public görünmeden önce kontrol edilecek şekilde tasarlanır.',
      },
    ],
    surveyCarousel: {
      eyebrow: 'Anonim anketler',
      title: 'Kayıt olmadan katıl. Deneyimini veriye dönüştür.',
      description:
        'Seçtiğin ankete göre ayrı bir sayfaya yönlendirilirsin. İsim, e-posta veya üyelik zorunluluğu yok.',
    },
    surveyCards: [
      {
        id: 'company-experience',
        path: '/surveys/company-experience',
        eyebrow: 'Anket 01',
        title: 'Şirketin ile deneyimini paylaş',
        description:
          'Başvurdun, otomatik red aldın, hiç dönüş alamadın ya da mülakata girdin. Bu şirketle geldiğin son noktayı anonim paylaş.',
        duration: '3-5 dk',
        icon: 'building',
        cta: 'Bu anketi doldur',
        bullets: [
          'Şirket adı ve rol',
          'Süreç hangi noktada kaldı?',
          'Otomatik red veya ghosting oldu mu?',
          'HR, teknik veya final görüşme yaşandı mı?',
          'Feedback verildi mi?',
        ],
        tags: ['Otomatik red', 'Ghosting', 'Feedback', 'HR süreci'],
      },
      {
        id: 'application-benchmark',
        path: '/surveys/application-benchmark',
        eyebrow: 'Anket 02',
        title: 'İş arama sürecini karşılaştır',
        description:
          'Rolünü, deneyimini ve iş arama sürecindeki temel sayıları paylaş; süreni temsili topluluk görünümüyle karşılaştır.',
        duration: '1-2 dk',
        icon: 'chart',
        cta: 'Sürecimi karşılaştır',
        bullets: [
          'Hangi rolü ve çalışma modelini hedefliyorsun?',
          'İş araman ne kadar sürdü veya sürüyor?',
          'Kaç başvuru, görüşme ve teklif aldın?',
          'Maaş beklentin hangi aralıkta?',
          'Referans veya portfolio etkisi var mıydı?',
        ],
        tags: ['İş arama süresi', 'Mülakat şansı', 'Maaş bandı', 'Benchmark'],
      },
      {
        id: 'hr-process',
        path: '/surveys/hr-process',
        eyebrow: 'Anket 03',
        title: 'HR sürecini değerlendir',
        description:
          'Başvuruna dönüş yapıldı mı? Süreç şeffaf mıydı? Elenme sebebin paylaşıldı mı? HR ekibinin profesyonelliğini anonim değerlendir.',
        duration: '3-4 dk',
        icon: 'userSearch',
        cta: 'Süreci değerlendir',
        bullets: [
          'Dönüş süresi: söz ve gerçek',
          'Ghosting yaşandı mı, hangi aşamada?',
          'Elenme sebebi paylaşıldı mı?',
          'İlgisiz veya uygunsuz sorular soruldu mu?',
          'HR profesyonelliği ve şeffaflık puanı',
        ],
        tags: ['Ghosting', 'HR şeffaflığı', 'Feedback', 'Süreç kalitesi'],
      },
      {
        id: 'salary-benchmark',
        path: '/surveys/salary-benchmark',
        eyebrow: 'Anket 04',
        title: 'Maaş ve teklif deneyimini paylaş',
        description:
          'İlanda belirtilen maaş ile teklif edilen maaş aynı mıydı? Beklentin karşılandı mı? Maaş şeffaflığını anonim değerlendir.',
        duration: '2-3 dk',
        icon: 'wallet',
        cta: 'Maaş deneyimini paylaş',
        bullets: [
          'İlanda maaş belirtilmiş miydi?',
          'Beklentin ve teklif edilen maaş',
          'Pazarlık yapabildin mi?',
          'Yan haklar sunuldu mu?',
          'Teklif adil hissettirdi mi?',
        ],
        tags: ['Maaş şeffaflığı', 'Teklif', 'Pazarlık', 'Yan haklar'],
      },
    ],
    community: {
      eyebrow: '04 / Topluluk sinyalleri',
      title: 'Tek deneyim, kolektif sinyale dönüşüyor.',
      description:
        'Paylaşılan deneyimler; başvuru oranlarını, şirket davranışlarını, feedback kalitesini ve söylenenle yaşanan arasındaki farkı görünür kılar.',
      note:
        'Örnek veriler / gerçek topluluk ölçümü değildir',
    },
    surveyIndex: {
      eyebrow: 'Anketler',
      title: 'Kayıt olmadan anonim katkı ver.',
      description:
        'Şirket deneyimini veya başvuru/mülakat oranını paylaşarak adayların işe alım süreçlerini daha görünür hale getirmesine katkı sağlayabilirsin.',
    },
    companyForm: {
      eyebrow: 'Anket 01',
      title: 'Şirketin ile deneyimini paylaş',
      description:
        'Bu form, bir şirketle yaşadığın başvuru veya mülakat sürecinin hangi noktada kaldığını anonim şekilde paylaşman için tasarlandı. Kayıt olmak zorunda değilsin.',
      warning:
        'Lütfen kişi adı, e-posta, telefon, gizli doküman, birebir özel case içeriği veya hakaret içeren ifade paylaşma.',
      company: 'Şirket adı',
      companyPlaceholder: 'Örn. ABC Teknoloji',
      role: 'Rol',
      rolePlaceholder: 'Örn. Frontend Developer',
      stage: 'Bu şirketle sürecin hangi noktada kaldı?',
      stageOptions: [
        'Sadece başvuru yaptım, dönüş olmadı',
        'Başvuru sonrası otomatik red aldım',
        'Başvuru sonrası manuel red aldım',
        'HR görüşmesine girdim',
        'Teknik görüşmeye girdim',
        'Case veya assignment yaptım',
        'Final görüşmesine girdim',
        'Teklif aldım',
        'Süreçten ben çekildim',
        'Süreç devam ediyor',
      ],
      response: 'Geri dönüş oldu mu?',
      responseOptions: ['Evet', 'Hayır', 'Emin değilim'],
      feedback: 'Feedback verildi mi?',
      feedbackOptions: ['Hayır', 'Evet, detaylı', 'Evet, yüzeysel'],
      salary: 'Maaş konuşuldu mu?',
      salaryOptions: ['Hayır', 'Evet, erken aşamada', 'Evet, geç aşamada'],
      experience: 'Kısaca ne yaşadığını anlat',
      experiencePlaceholder:
        'Başvuru yaptım, 1 hafta sonra otomatik red geldi. Neden elendiğime dair hiçbir açıklama yoktu...',
      submit: 'Anonim deneyimi gönder',
    },
    benchmarkForm: {
      trustPanel: {
        dataLabel: 'Veri dosyası · Örnek veri',
        title: 'Sürecin gerçekten bu kadar mı sürüyor?',
        description:
          'Yaklaşık 2 dakikada iş arama sürecini tanımla ve temsili topluluk görünümüyle karşılaştır.',
        items: [
          'Kayıt gerekmiyor',
          'İsim veya e-posta istenmiyor',
          'Maaş bilgisi yalnızca aralık olarak toplanır',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form ilerlemesi',
        items: ['Karşılaştırma bağlamı', 'Başvuru hunin', 'İsteğe bağlı ayrıntılar'],
      },
      privacyRow: 'Anonim · İsim toplanmaz · Belge istenmez',
      selectPlaceholder: 'Seçiniz',
      booleanOptions: [
        { value: true, label: 'Evet' },
        { value: false, label: 'Hayır' },
      ],
      steps: {
        step1: {
          title: 'Seni neyle karşılaştırıyoruz?',
          description: 'Yalnızca benzer adaylarla eşleşmek için kısa bir bağlam paylaş. Zorunlu alanlar karşılaştırmanın temelini oluşturur.',
          selectPlaceholder: 'Seçiniz',
          optional: 'Opsiyonel',
          optionalContextTitle: 'Karşılaştırmayı daralt',
          optionalContextNote: 'Bu ayrıntılar sonucu daha spesifik yapar; boş bıraksan da sonuç önizlemeni görebilirsin.',
          booleanOptions: [
            { value: true, label: 'Evet' },
            { value: false, label: 'Hayır' },
          ],
          fields: {
            role: {
              label: 'Pozisyon / rol',
              options: {
                software_engineer: 'Software Engineer',
                frontend_developer: 'Frontend Developer',
                backend_developer: 'Backend Developer',
                full_stack_developer: 'Full-stack Developer',
                mobile_developer: 'Mobile Developer',
                data_analyst: 'Data Analyst',
                data_scientist: 'Data Scientist',
                product_manager: 'Product Manager',
                product_designer: 'Product Designer',
                devops_engineer: 'DevOps Engineer',
                qa_engineer: 'QA Engineer',
                business_analyst: 'Business Analyst',
                other: 'Diğer',
              },
            },
            sector: {
              label: 'Hedef sektör',
              options: {
                technology: 'Teknoloji', finance: 'Finans', ecommerce: 'E-ticaret',
                consulting: 'Danışmanlık', healthcare: 'Sağlık', manufacturing: 'Üretim',
                education: 'Eğitim', media: 'Medya', telecom: 'Telekom', other: 'Diğer',
              },
            },
            roleLevel: {
              label: 'Pozisyon seviyesi',
              options: {
                intern: 'Stajyer', junior: 'Junior', mid: 'Mid-level',
                senior: 'Senior', lead_manager: 'Lead / Yönetici',
              },
            },
            experienceBand: {
              label: 'Deneyim yılın',
              options: { '0-1': '0-1 yıl', '1-3': '1-3 yıl', '3-5': '3-5 yıl', '5-8': '5-8 yıl', '8+': '8+ yıl' },
            },
            targetRegion: {
              label: 'Hedef pazar / bölge',
              options: {
                turkiye: 'Türkiye', europe: 'Avrupa Birliği', uk_ireland: 'Birleşik Krallık / İrlanda',
                mena: 'Orta Doğu / Kuzey Afrika', north_america: 'Kuzey Amerika', other: 'Diğer',
              },
            },
            employmentType: {
              label: 'Çalışma türü',
              options: {
                full_time: 'Tam zamanlı', part_time: 'Yarı zamanlı',
                freelance: 'Freelance / Sözleşmeli', internship: 'Staj',
              },
            },
            workMode: {
              label: 'Hedef çalışma modeli',
              options: { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Ofis' },
            },
            isCurrentlyEmployed: { label: 'Şu anda çalışıyor musun?' },
            searchStartedAt: { label: 'İş aramaya ne zaman başladın?' },
            searchStatus: {
              label: 'Sürecin şu anda ne durumda?',
              options: {
                ongoing: 'Devam ediyor',
                offer_accepted: 'Teklif kabul ettim',
                offer_rejected: 'Teklifi reddettim',
                abandoned: 'Aramayı sonlandırdım',
              },
            },
            searchEndedAt: { label: 'Süreç ne zaman sonuçlandı?' },
          },
        },
        step2: {
          title: 'Başvuru hunin',
          description: 'Yaklaşık sayılar yeterli. Amaç, başvurunun hangi aşamada daraldığını birlikte görmek.',
          countFields: [
            { name: 'applicationsCount', label: 'Kaç başvuru yaptın?' },
            { name: 'responsesCount', label: 'Kaç dönüş aldın?' },
            { name: 'hrInterviewsCount', label: 'Kaç şirketle HR görüşmesi yaptın?' },
            { name: 'technicalInterviewsCount', label: 'Kaç şirketle teknik görüşme yaptın?' },
            { name: 'offersCount', label: 'Kaç teklif aldın?' },
          ],
          helperEyebrow: 'Sayılar kesin olmak zorunda değil',
          helperText: 'Yaklaşık değerler de yeterli. Referansla veya doğrudan ulaşarak ilerleyen sıra dışı süreçler için uyarı görsen bile devam edebilirsin.',
        },
        step3: {
          title: 'İsteğe bağlı ayrıntılar',
          description: 'Bu alanların hiçbiri sonucu görmek için zorunlu değil. Dilersen sadece sana fayda sağlayacak ayrıntıları ekle.',
          optionalNote: 'Bu adım tamamen opsiyonel. Dilersen atlayıp sonuç önizlemesine geçebilirsin.',
          optional: 'Opsiyonel',
          salaryTitle: 'Maaş karşılaştırması',
          salaryNote: 'Aylık maaş bilgisini kesin rakam yerine yaklaşık bir bant olarak paylaşabilirsin.',
          preferNotToSay: 'Boş bırak / belirtmek istemiyorum',
          salaryCurrency: { label: 'Para birimi' },
          salaryFields: [
            { name: 'currentSalaryBand', label: 'Mevcut veya son maaş bandın' },
            { name: 'expectedSalaryBand', label: 'Beklediğin maaş bandı' },
            { name: 'highestOfferBand', label: 'Aldığın en yüksek teklif bandı' },
          ],
          signalTitle: 'Sürecini etkileyen sinyaller',
          signalNote: 'Referans veya portfolyo, sonuçları daha doğru yorumlamaya yardımcı olabilir.',
          booleanOptions: [
            { value: true, label: 'Evet' },
            { value: false, label: 'Hayır' },
          ],
          fields: {
            hadReferral: { label: 'Başvurularından en az biri referanslı mıydı?' },
            sharedPortfolio: { label: 'Portfolio veya iş örneği paylaştın mı?' },
            freeNote: {
              label: 'Eklemek istediğin kısa bir not var mı?',
              placeholder: 'Kişi adı, e-posta veya tanımlayıcı bilgi paylaşma.',
            },
          },
        },
      },
      navigation: {
        back: 'Geri',
        next: 'Devam et',
        skip: 'Atla ve sonucu gör',
        complete: 'Tamamla ve sonucu gör',
        loading: 'Hazırlanıyor…',
      },
      validation: {
        required: 'Bu alan gerekli.',
        endDateRequired: 'Süreç sonuçlandıysa bitiş ayı gerekli.',
        nonNegativeNumber: '0 veya daha büyük tam sayı gir.',
        currencyRequired: 'Maaş bandı paylaşıyorsan para birimini seç.',
        noteTooLong: 'Not en fazla 300 karakter olabilir.',
        countOrder: 'Sayıların doğal sırası farklı görünüyor. Sıra dışı bir sürecin varsa devam edebilirsin.',
        summary: 'Devam etmeden önce işaretli alanları kontrol et.',
      },
      submitError: 'Önizleme hazırlanamadı. Lütfen tekrar dene.',
      success: {
        mockLabel: 'Örnek veri · Gerçek karşılaştırma değil',
        title: 'İş arama süreci önizlemen hazır.',
        description:
          'Bilgilerin kaydedilmedi. Gerçek topluluk verisi oluştuğunda benzer profillerle karşılaştırman burada gösterilecek.',
        yourDurationLabel: 'Senin arama süren',
        communityDurationLabel: 'Temsili topluluk medyanı',
        yourTechnicalEffortLabel: '1 teknik görüşme için',
        communityTechnicalEffortLabel: 'Temsili teknik görüşme medyanı',
        yourApplicationsLabel: 'Başvuru',
        conversionTitle: 'Senin başvuru akışın',
        responseLabel: 'Dönüş',
        hrLabel: 'HR',
        technicalLabel: 'Teknik',
        offerLabel: 'Teklif',
        dayUnit: 'gün',
        applicationUnit: 'başvuru',
        cohortLabel: 'Karşılaştırma grubu',
        personalSignalLabel: 'Senin sürecindeki sinyal',
        applicationsPerTechnicalSuffix: 'başvuruda 1 teknik görüşme',
        noTechnicalInterviewSignal: 'Teknik görüşmeye ulaşmadan önce süreç durmuş görünüyor.',
        responseRatePrefix: 'Başvurularının',
        responseRateSuffix: 'i dönüş aldı.',
        previewNote: 'Bu sonuç temsili verilerle hazırlanmış bir önizlemedir; yanıtların bu prototipte kaydedilmez.',
      },
      explainer: {
        eyebrow: '04 / Anketin amacı',
        title: 'İş arama eforunu ölçülebilir hale getiriyoruz.',
        intro:
          'Bu anket yalnızca kaç başvuru yaptığını sormaz. İş bulmak için harcadığın zamanı, başvuru hunisindeki daralmayı ve teklif alma eforunu benzer adayların süreçleriyle karşılaştırılabilir hale getirir.',
        whyTitle: 'Neden iş arama sürecini karşılaştırmalısın?',
        reasons: [
          {
            title: 'Süreci kişisel bir başarısızlık gibi görmemek için',
            description: 'Benzer rol ve deneyimdeki adayların kaç başvuru yaptığını görmek, yaşadığın sessizliği gerçek piyasa bağlamına yerleştirir.',
          },
          {
            title: 'Gerçekçi bir zaman çizelgesi kurmak için',
            description: 'İlk başvurudan teklife kadar geçen medyan süre, iş değişikliği planını daha sağlam bir veriyle yapmana yardımcı olur.',
          },
          {
            title: 'Başvurunun nerede daraldığını görmek için',
            description: 'Dönüş, HR, teknik görüşme ve teklif oranları hangi aşamada zorlandığını görünür kılar.',
          },
        ],
        measurementTitle: 'Bu ankette neyi ölçüyoruz?',
        measurementDescription:
          'Sonuçlar rol, sektör, deneyim, hedef bölge ve çalışma biçimi gibi bağlamlarla gruplanır; kişisel bilgi veya belge ölçümün parçası değildir.',
        metrics: [
          'Teklif başına başvuru',
          'İş arama süresi',
          'Başvurudan dönüşe geçiş',
          'HR ve teknik görüşme oranı',
          'Teklif dönüşümü',
          'Beklenti ve teklif bandı',
        ],
        howTitle: 'Nasıl çalışır?',
        steps: [
          { title: 'Sürecini tanımla', description: 'Rolünü ve temel başvuru sayılarını yaklaşık 2 dakikada paylaş.' },
          { title: 'Benzer profille eşleş', description: 'Sonucun aynı bağlamdaki temsili aday verileriyle karşılaştırılır.' },
          { title: 'Daralmayı gör', description: 'Süreni, eforunu ve başvuru hunini tek bir sonuçta incele.' },
        ],
        transparencyTitle: 'Şu an temsili önizleme',
        transparencyText:
          'Bu prototipte yanıtların kaydedilmez ve topluluk karşılaştırması örnek değerlerle hazırlanır. Gerçek veri altyapısı devreye alındığında yalnızca yeterli örneklem oluşan gruplar yayınlanacaktır.',
      },
    },
    hrProcessForm: {
      trustPanel: {
        dataLabel: 'Anonim Anket',
        title: 'Söz verdikleri sürede döndüler mi?',
        description:
          'Süreci değerlendirmen yaklaşık 3 dakika sürecek. Şirket adı gizli tutularak HR şeffaflık skoru topluluk verisine eklenecektir.',
        items: [
          'Kayıt gerekmiyor',
          'İsim veya e-posta istenmiyor',
          'Şirket adı doğrudan yayınlanmaz, anonim kalır',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form ilerlemesi',
        items: ['Şirket ve rol', 'Süreç ve ghosting', 'Değerlendirme'],
      },
      privacyRow: 'Anonim · İsim toplanmaz · Belge istenmez',
      selectPlaceholder: 'Seçiniz',
      booleanOptions: [
        { value: true, label: 'Evet' },
        { value: false, label: 'Hayır' },
      ],
      steps: {
        step1: {
          title: 'Şirket ve rol',
          description: 'Hangi şirket ve rol için mülakat sürecine girdiğini belirt.',
          fields: {
            companyName: { label: 'Şirket adı', placeholder: 'Örn. Tech Corp' },
            appliedRole: { label: 'Pozisyon / rol', placeholder: 'Örn. Frontend Developer' },
            processYear: {
              label: 'Süreç hangi yıl gerçekleşti?',
              options: { '2024': '2024', '2025': '2025', '2026': '2026' },
            },
          },
        },
        step2: {
          title: 'Süreç ve ghosting',
          description: 'Söylenen süreyle gerçekleşen süreyi karşılaştır.',
          fields: {
            promisedTimeline: {
              label: 'Süreç başında geri dönüş süresi taahhüt edildi mi?',
              options: { yes: 'Evet, süre verdiler', no: 'Hayır, belirtilmedi', not_specified: 'Hatırlamıyorum' },
            },
            promisedDays: { label: 'Kaç gün içinde döneceklerini söylediler?' },
            actualDays: { label: 'Gerçekte kaç gün sonra döndüler?' },
            wasGhosted: { label: 'Ghosting (habersiz iletişimi kesme) yaşandı mı?' },
            ghostedAfterStage: {
              label: 'Hangi aşamadan sonra ghosting yaşandı?',
              options: { application: 'Başvuru', hr_screen: 'HR Görüşmesi', technical: 'Teknik Mülakat', final: 'Final Görüşmesi' },
            },
            interviewerPrepared: { label: 'Görüşmeciler mülakata hazırlıklı mıydı? (1-5)' },
            wasAskedIrrelevant: { label: 'İlgisiz veya uygunsuz sorular soruldu mu?' },
            irrelevantTypes: {
              label: 'Hangi türde sorular soruldu?',
              options: { age: 'Yaş', marital_status: 'Medeni durum', salary_history: 'Geçmiş maaş', personal_questions: 'Özel hayat', other: 'Diğer' },
            },
          },
        },
        step3: {
          title: 'Değerlendirme',
          description: 'HR ekibini ve sürecin şeffaflığını puanla.',
          fields: {
            rejectionShared: {
              label: 'Elenme sebebi paylaşıldı mı?',
              options: { yes_detailed: 'Evet, detaylı feedback verdiler', yes_generic: 'Evet ama standart formdu', no: 'Hayır, sebep belirtilmedi' },
            },
            feedbackUseful: { label: 'Verilen feedback gelişimin için faydalı mıydı? (1-5)' },
            processTransparency: { label: 'Sürecin şeffaflığı (1-5)' },
            hrProfessionalism: { label: 'HR ekibinin profesyonelliği (1-5)' },
            wouldRecommendProcess: {
              label: 'Bu şirketin mülakat sürecini başkalarına tavsiye eder misin?',
              options: { yes: 'Evet', no: 'Hayır', unsure: 'Emin değilim' },
            },
            freeNote: {
              label: 'Eklemek istediğin başka bir detay var mı?',
              placeholder: 'Kişi adı veya tanımlayıcı bilgi paylaşmadan süreci kısaca anlatabilirsin.',
            },
          },
        },
      },
      navigation: {
        back: 'Geri',
        next: 'Devam et',
        complete: 'Tamamla ve sonucu gör',
        loading: 'Hazırlanıyor…',
      },
      validation: {
        required: 'Bu alan gerekli.',
        nonNegativeNumber: '0 veya daha büyük tam sayı gir.',
        noteTooLong: 'Not en fazla 500 karakter olabilir.',
        timelineGapWarning: 'Gerçekleşen süre söz verilenden çok daha uzun görünüyor. Doğru girdiğinize emin misiniz?',
        summary: 'Devam etmeden önce işaretli alanları kontrol et.',
      },
      submitError: 'Önizleme hazırlanamadı. Lütfen tekrar dene.',
      success: {
        title: 'Süreç değerlendirmen hazır.',
        description: 'Bilgilerin kaydedilmedi. Gerçek sistemde bu değerlendirme şirketin HR şeffaflık skoruna etki edecektir.',
        ghostedLabel: 'Ghosting durumu',
        transparencyLabel: 'Şeffaflık skoru',
        professionalismLabel: 'Profesyonellik skoru',
      },
      explainer: {
        eyebrow: '04 / Anketin amacı',
        title: 'Şirket süreçlerini tekil şikâyetlerden çıkarıp ortak sinyale dönüştürüyoruz.',
        intro:
          'Bu anket, bir şirketle yaşanan başvuru veya mülakat sürecinin nasıl ilerlediğini anonim bir süreç kaydı olarak toplar. Amaç tek bir kişiyi ya da tek bir olayı büyütmek değil; tekrar eden HR davranışlarını görünür kılmaktır.',
        whyTitle: 'Neden şirket deneyimini paylaşmalısın?',
        reasons: [
          {
            title: 'Söz verilenle gerçekten yaşananı ayırmak için',
            description: '“Döneceğiz” denilen sürenin tutulup tutulmadığı, aday deneyiminin en net ölçülebilen sinyallerinden biridir.',
          },
          {
            title: 'Ghosting ve sessizliği görünür kılmak için',
            description: 'Bir adayın yanıtsız kalması kişisel bir belirsizliktir; aynı davranış tekrarlandığında şirketin süreç kalitesine dair veri olur.',
          },
          {
            title: 'Feedback ve profesyonellik standardını ölçmek için',
            description: 'Elenme sebebi, görüşmeci hazırlığı ve uygunsuz soru sinyalleri işe alım sürecinin aday tarafındaki gerçek kalitesini gösterir.',
          },
        ],
        measurementTitle: 'Bu ankette neyi ölçüyoruz?',
        measurementDescription:
          'Yanıtlar şirket, rol ve süreç yılı bağlamında değerlendirilir; kişi isimleri, özel belgeler ve tanımlayıcı detaylar ölçümün parçası değildir.',
        metrics: [
          'Söz verilen dönüş süresi',
          'Gerçekleşen dönüş süresi',
          'Ghosting aşaması',
          'Feedback kalitesi',
          'HR profesyonelliği',
          'Süreç tavsiye skoru',
        ],
        howTitle: 'Nasıl çalışır?',
        steps: [
          { title: 'Süreci konumlandır', description: 'Şirket, rol ve yıl bilgisini paylaşarak deneyimi doğru bağlama yerleştir.' },
          { title: 'Söz ve gerçeği karşılaştır', description: 'Vaat edilen dönüş süresiyle gerçekten yaşanan akışı yan yana ölç.' },
          { title: 'Sinyali güçlendir', description: 'Feedback, ghosting ve profesyonellik verisi topluluk skoruna dönüşür.' },
        ],
        transparencyTitle: 'Moderasyon ve örneklem eşiği',
        transparencyText:
          'Bu prototipte yanıtların kaydedilmez. Gerçek veri katmanında şirket sinyalleri moderasyon ve yeterli örneklem eşiği olmadan herkese açık gösterilmez.',
      },
    },
  },
  en: {
    localeName: 'English',
    common: {
      homeAria: 'Interview Memory homepage',
      languageLabel: 'Language selection',
      backHome: 'Back to homepage',
      themeToggle: 'Switch between light and dark themes',
      themeTitle: 'Change theme',
    },
    metadata: {
      home: {
        title: 'Interview Memory',
        description:
          'A platform that turns anonymous application and interview experiences into community data.',
      },
      surveys: {
        title: 'Anonymous Surveys',
        description:
          'Share your company experience or application and interview rates anonymously without registering.',
      },
      companyExperience: {
        title: 'Share Your Company Experience',
        description:
          'Share an application or interview experience with a company anonymously, without registering.',
      },
      applicationBenchmark: {
        title: 'Compare Your Job Search',
        description:
          'Share your job-search process anonymously and compare it with illustrative community data.',
      },
      login: {
        title: 'Sign In',
        description:
          'Preview the Interview Memory sign-in flow using your Google account.',
      },
      notFound: {
        title: 'Page Not Found',
        description:
          'The page you are looking for may have moved, been deleted, or never existed.',
      },
    },
    header: {
      navLabel: 'Main navigation',
      surveys: 'Surveys',
      howItWorks: 'How it works',
      data: 'Data',
      signIn: 'Sign in',
    },
    login: {
      eyebrow: 'Account access',
      title: 'Keep your experiences within reach.',
      description:
        'Sign in to follow your contributions and access community insights available only to account holders.',
      benefitsEyebrow: 'What changes with an account?',
      benefits: [
        'Track your anonymous contribution history in one place',
        'Return to company and role signals you saved',
        'Access detailed insights available to members',
      ],
      accessTitle: 'Access your account quickly',
      accessDescription:
        'Sign in with your Google account or continue using Interview Memory anonymously without creating an account.',
      googleCta: 'Continue with Google',
      alternative: 'or',
      previewNotice:
        'This is an interface preview. Google OAuth is not connected yet and no information was sent.',
      privacyNote:
        'When you continue with Google, basic account information is used for sign-in; your survey responses are not shared under your public identity.',
      anonymousCta: 'Continue using anonymously',
    },
    notFound: {
      eyebrow: 'Lost signal',
      title: 'We could not get a response from this page.',
      description:
        'The link you followed may have disappeared into the silence. Return home or keep exploring the anonymous surveys.',
      homeCta: 'Back to homepage',
      surveysCta: 'Explore surveys',
      codeLabel: 'Page not found',
    },
    home: {
      hero: {
        eyebrow: '01 / Job-search comparison',
        title: 'Where do you stand in',
        titleHighlight: 'your job search?',
        subtitle: 'Stop guessing your timeline. Compare it with similar candidates.',
        detailsLabel: 'Information used in the comparison',
        details: ['Role · experience · timeline', 'Community comparison'],
        signalsLabel: 'Application response statuses',
        signals: responseStatuses.en.map(({ label }) => label),
        descriptionParts: {
          pre: 'Share your application outcomes ',
          highlight: 'anonymously',
          post: ' and see where your job-search timeline stands against the community benchmark.',
        },
        explore: 'Compare your job-search timeline',
        benchmark: 'Explore community data',
      },
      signal: {
        eyebrow: 'Community signal',
        title: 'How many applications does it take for similar candidates to hear back?',
        description:
          'We make the hidden side of applications measurable through experience, role, and network data.',
        companyTitle: 'Company experience',
        companyDescription:
          'Signals from applications, rejections, ghosting, HR, and interview processes.',
        benchmarkTitle: 'Application benchmark',
        benchmarkDescription:
          'How many applications lead to a response, HR call, or technical interview?',
        panelLabel: 'Community data summary',
        panelType: 'Data file',
        sampleData: 'Sample data',
        sampleSize: '1,248 contributions',
        methodology:
          'Values in this prototype are illustrative and are not real community measurements.',
        flowChartLabel: 'Application stages',
        distributionChartLabel: 'Process distribution',
        viewCta: 'View details and survey',
        views: [
          {
            id: 'application-marathon',
            type: 'funnel',
            path: '/surveys/application-benchmark',
            tabLabel: 'Application marathon',
            eyebrow: 'Signal / Application marathon',
            title: 'How many applications does it take to land a job?',
            description:
              'Community data reveals the journey from application to offer and the time job seekers invest in the process.',
            primaryValue: '72',
            primaryLabel: 'Applications',
            secondaryValue: '14 weeks',
            secondaryLabel: 'Median duration',
            chartLabel: 'Application funnel',
            stages: [
              { label: 'Applications', value: '72', share: '100%' },
              { label: 'Responses', value: '28', share: '39%' },
              { label: 'Interviews', value: '8', share: '11%' },
              { label: 'Offers', value: '1.4', share: '2%' },
            ],
          },
          {
            id: 'company-report',
            type: 'funnel',
            path: '/surveys/company-experience',
            tabLabel: 'Company report card',
            eyebrow: 'Signal / Company report card',
            title: 'Top 3 issues reported by candidates',
            description:
              'Company hiring processes are evaluated through candidate experiences. The most frequently reported issues become visible.',
            primaryValue: '847',
            primaryLabel: 'Experiences',
            secondaryValue: '41%',
            secondaryLabel: 'No response',
            chartLabel: 'Most reported issues',
            stages: [
              { label: 'Ghosting', value: '347', share: '41%' },
              { label: 'Delayed response', value: '288', share: '34%' },
              { label: 'No reason given', value: '237', share: '28%' },
              { label: 'Other', value: '127', share: '15%' },
            ],
          },
          {
            id: 'silent-processes',
            type: 'signal',
            path: '/surveys/hr-process',
            tabLabel: 'Silent processes',
            eyebrow: 'Signal / HR transparency',
            title: '58% of promised follow-ups never came',
            description:
              'We measure HR team transparency throughout the process, response timelines, and how often rejection reasons are shared.',
            primaryValue: '58%',
            primaryLabel: 'Promised, never heard back',
            secondaryValue: '12%',
            secondaryLabel: 'Rejection reason shared',
            chartLabel: 'Response status',
            distribution: responseStatuses.en,
          },
          {
            id: 'salary-reality',
            type: 'comparison',
            path: '/surveys/salary-benchmark',
            tabLabel: 'Salary reality',
            eyebrow: 'Comparison / Posting and offer',
            title: 'The posted salary and the actual offer do not match',
            description:
              'We compare candidate expectations, posted salary ranges, and actual offers using community data.',
            comparison: {
              promiseLabel: 'Expectation',
              promiseValue: '42K ₺',
              promiseDescription: 'The median net salary candidates targeted before applying.',
              realityLabel: 'Offer',
              realityValue: '34K ₺',
              realityDescription: 'The median net salary offer presented to candidates.',
              deltaLabel: 'Gap between expectation and offer',
              deltaValue: '-19%',
            },
          },
        ],
        bottomEyebrow: 'Silent applications become visible',
        bottomText:
          'One candidate’s uncertainty becomes a real hiring-process signal when combined with the community.',
      },
      howItWorks: [
        {
          title: 'Choose a survey',
          description:
            'Share a company experience or add your application-to-interview rate to the community data.',
        },
        {
          title: 'Answer anonymously',
          description:
            'Without registering, share where the process stopped, whether you heard back, and whether you received feedback.',
        },
        {
          title: 'Create a signal',
          description:
            'Anonymous contributions reveal company hiring behavior and the reality of candidates’ job searches.',
        },
      ],
      finalCta: {
        eyebrow: 'Your contribution matters',
        title:
          'Uncertainty grows while application processes stay silent. Shared experiences become data.',
        company: 'Share a company experience',
        benchmark: 'Share application rates',
      },
    },
    trustItems: [
      {
        title: 'No account required',
        description: 'You do not need to create an account to complete a survey.',
      },
      {
        title: 'Anonymous participation',
        description:
          'Contribute without sharing your name, email address, or personal information.',
      },
      {
        title: 'Privacy-minded data',
        description:
          'Names, confidential documents, and abusive content are not published.',
      },
      {
        title: 'Moderated sharing',
        description:
          'Submitted experiences are designed to be reviewed before becoming public.',
      },
    ],
    surveyCarousel: {
      eyebrow: 'Anonymous surveys',
      title: 'Join without registering. Turn your experience into data.',
      description:
        'Your survey opens on a dedicated page. No name, email address, or membership is required.',
    },
    surveyCards: [
      {
        id: 'company-experience',
        path: '/surveys/company-experience',
        eyebrow: 'Survey 01',
        title: 'Share your experience with a company',
        description:
          'Whether you received an automated rejection, heard nothing, or reached an interview, anonymously share where the process ended.',
        duration: '3-5 min',
        icon: 'building',
        cta: 'Complete this survey',
        bullets: [
          'Company and role',
          'Where did the process stop?',
          'Was there an automated rejection or ghosting?',
          'Did you reach HR, technical, or final interviews?',
          'Did you receive feedback?',
        ],
        tags: ['Automated rejection', 'Ghosting', 'Feedback', 'HR process'],
      },
      {
        id: 'application-benchmark',
        path: '/surveys/application-benchmark',
        eyebrow: 'Survey 02',
        title: 'Compare your job-search process',
        description:
          'Share your role, experience, and core job-search numbers, then compare your timeline with an illustrative community view.',
        duration: '1-2 min',
        icon: 'chart',
        cta: 'Compare my process',
        bullets: [
          'Which role and work model are you targeting?',
          'How long has your job search lasted?',
          'How many applications, interviews, and offers?',
          'What salary range are you targeting?',
          'Did referrals or a portfolio make a difference?',
        ],
        tags: ['Job-search timeline', 'Interview odds', 'Salary range', 'Benchmark'],
      },
      {
        id: 'hr-process',
        path: '/surveys/hr-process',
        eyebrow: 'Survey 03',
        title: 'Evaluate the HR process',
        description:
          'Did they follow up? Was the process transparent? Was the rejection reason shared? Anonymously evaluate the HR team.',
        duration: '3-4 min',
        icon: 'userSearch',
        cta: 'Evaluate the process',
        bullets: [
          'Response time: promise vs reality',
          'Were you ghosted, and at which stage?',
          'Was a rejection reason shared?',
          'Were irrelevant or inappropriate questions asked?',
          'HR professionalism and transparency score',
        ],
        tags: ['Ghosting', 'HR transparency', 'Feedback', 'Process quality'],
      },
      {
        id: 'salary-benchmark',
        path: '/surveys/salary-benchmark',
        eyebrow: 'Survey 04',
        title: 'Share your salary and offer experience',
        description:
          'Was the posted salary the same as the offer? Were your expectations met? Anonymously evaluate salary transparency.',
        duration: '2-3 min',
        icon: 'wallet',
        cta: 'Share salary experience',
        bullets: [
          'Was salary listed in the job posting?',
          'Your expectation vs the actual offer',
          'Were you able to negotiate?',
          'Were benefits offered?',
          'Did the offer feel fair?',
        ],
        tags: ['Salary transparency', 'Offer', 'Negotiation', 'Benefits'],
      },
    ],
    community: {
      eyebrow: '04 / Community signals',
      title: 'One experience becomes a collective signal.',
      description:
        'Shared experiences reveal application rates, company behavior, feedback quality, and the gap between what was promised and what happened.',
      note:
        'Sample data / not real community measurements',
    },
    surveyIndex: {
      eyebrow: 'Surveys',
      title: 'Contribute anonymously without registering.',
      description:
        'Share a company experience or your application-to-interview rate to help candidates make hiring processes more visible.',
    },
    companyForm: {
      eyebrow: 'Survey 01',
      title: 'Share your experience with a company',
      description:
        'This form lets you anonymously share where an application or interview process with a company ended. You do not need to register.',
      warning:
        'Do not share names, email addresses, phone numbers, confidential documents, exact private case content, or abusive language.',
      company: 'Company name',
      companyPlaceholder: 'e.g. ABC Technology',
      role: 'Role',
      rolePlaceholder: 'e.g. Frontend Developer',
      stage: 'Where did your process with this company end?',
      stageOptions: [
        'Applied but received no response',
        'Received an automated rejection',
        'Received a manual rejection',
        'Completed an HR interview',
        'Completed a technical interview',
        'Completed a case or assignment',
        'Reached the final interview',
        'Received an offer',
        'Withdrew from the process',
        'The process is ongoing',
      ],
      response: 'Did you receive a response?',
      responseOptions: ['Yes', 'No', 'Not sure'],
      feedback: 'Did you receive feedback?',
      feedbackOptions: ['No', 'Yes, detailed', 'Yes, superficial'],
      salary: 'Was salary discussed?',
      salaryOptions: ['No', 'Yes, early in the process', 'Yes, late in the process'],
      experience: 'Briefly describe what happened',
      experiencePlaceholder:
        'I applied and received an automated rejection one week later. There was no explanation of why I was rejected...',
      submit: 'Submit anonymous experience',
    },
    benchmarkForm: {
      trustPanel: {
        dataLabel: 'Data file · Sample data',
        title: 'Does the process really take this long?',
        description:
          'Describe your job search in about 2 minutes and compare it with an illustrative community view.',
        items: [
          'No account required',
          'No name or email requested',
          'Salary is collected only as a range',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form progress',
        items: ['Comparison context', 'Your application funnel', 'Optional details'],
      },
      privacyRow: 'Anonymous · No names · No documents',
      selectPlaceholder: 'Select',
      booleanOptions: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
      steps: {
        step1: {
          title: 'What should we compare you with?',
          description: 'Share only the brief context needed to match you with similar candidates. The required fields form the basis of the comparison.',
          selectPlaceholder: 'Select',
          optional: 'Optional',
          optionalContextTitle: 'Narrow the comparison',
          optionalContextNote: 'These details make the result more specific. You can still view your preview without them.',
          booleanOptions: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
          fields: {
            role: {
              label: 'Position / role',
              options: {
                software_engineer: 'Software Engineer',
                frontend_developer: 'Frontend Developer',
                backend_developer: 'Backend Developer',
                full_stack_developer: 'Full-stack Developer',
                mobile_developer: 'Mobile Developer',
                data_analyst: 'Data Analyst',
                data_scientist: 'Data Scientist',
                product_manager: 'Product Manager',
                product_designer: 'Product Designer',
                devops_engineer: 'DevOps Engineer',
                qa_engineer: 'QA Engineer',
                business_analyst: 'Business Analyst',
                other: 'Other',
              },
            },
            sector: {
              label: 'Target industry',
              options: {
                technology: 'Technology', finance: 'Finance', ecommerce: 'E-commerce',
                consulting: 'Consulting', healthcare: 'Healthcare', manufacturing: 'Manufacturing',
                education: 'Education', media: 'Media', telecom: 'Telecom', other: 'Other',
              },
            },
            roleLevel: {
              label: 'Position level',
              options: {
                intern: 'Intern', junior: 'Junior', mid: 'Mid-level',
                senior: 'Senior', lead_manager: 'Lead / Manager',
              },
            },
            experienceBand: {
              label: 'Years of experience',
              options: { '0-1': '0-1 years', '1-3': '1-3 years', '3-5': '3-5 years', '5-8': '5-8 years', '8+': '8+ years' },
            },
            targetRegion: {
              label: 'Target market / region',
              options: {
                turkiye: 'Türkiye', europe: 'European Union', uk_ireland: 'United Kingdom / Ireland',
                mena: 'Middle East / North Africa', north_america: 'North America', other: 'Other',
              },
            },
            employmentType: {
              label: 'Employment type',
              options: {
                full_time: 'Full-time', part_time: 'Part-time',
                freelance: 'Freelance / Contract', internship: 'Internship',
              },
            },
            workMode: {
              label: 'Target work model',
              options: { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' },
            },
            isCurrentlyEmployed: { label: 'Are you currently employed?' },
            searchStartedAt: { label: 'When did you begin your job search?' },
            searchStatus: {
              label: 'What is the current status?',
              options: {
                ongoing: 'Still ongoing',
                offer_accepted: 'Accepted an offer',
                offer_rejected: 'Rejected an offer',
                abandoned: 'Stopped searching',
              },
            },
            searchEndedAt: { label: 'When did the process end?' },
          },
        },
        step2: {
          title: 'Your application funnel',
          description: 'Approximate counts are enough. The goal is to see where your journey narrows down.',
          countFields: [
            { name: 'applicationsCount', label: 'How many applications did you submit?' },
            { name: 'responsesCount', label: 'How many responses did you receive?' },
            { name: 'hrInterviewsCount', label: 'How many companies invited you to an HR interview?' },
            { name: 'technicalInterviewsCount', label: 'How many companies invited you to a technical interview?' },
            { name: 'offersCount', label: 'How many offers did you receive?' },
          ],
          helperEyebrow: 'The numbers do not need to be exact',
          helperText: 'Approximate values are useful too. You can continue after a warning when referrals or direct outreach made your process unusual.',
        },
        step3: {
          title: 'Optional details',
          description: 'None of these fields are required to view your result. Add only the details that make the comparison more useful to you.',
          optionalNote: 'This step is entirely optional. You can skip it and view the result preview.',
          optional: 'Optional',
          salaryTitle: 'Salary comparison',
          salaryNote: 'Share an approximate monthly range instead of an exact salary.',
          preferNotToSay: 'Leave blank / prefer not to say',
          salaryCurrency: { label: 'Currency' },
          salaryFields: [
            { name: 'currentSalaryBand', label: 'Current or most recent salary range' },
            { name: 'expectedSalaryBand', label: 'Expected salary range' },
            { name: 'highestOfferBand', label: 'Highest offer received' },
          ],
          signalTitle: 'Signals that shaped your process',
          signalNote: 'A referral or portfolio can help interpret your results more accurately.',
          booleanOptions: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
          fields: {
            hadReferral: { label: 'Was at least one application referred?' },
            sharedPortfolio: { label: 'Did you share a portfolio or work sample?' },
            freeNote: {
              label: 'Anything else you would like to add?',
              placeholder: 'Do not include names, email addresses, or identifying information.',
            },
          },
        },
      },
      navigation: {
        back: 'Back',
        next: 'Continue',
        skip: 'Skip and view result',
        complete: 'Complete and view result',
        loading: 'Preparing…',
      },
      validation: {
        required: 'This field is required.',
        endDateRequired: 'An end month is required when the process has ended.',
        nonNegativeNumber: 'Enter a whole number equal to or greater than 0.',
        currencyRequired: 'Select a currency when sharing a salary range.',
        noteTooLong: 'The note must be 300 characters or fewer.',
        countOrder: 'These counts follow an unusual order. You can continue if this reflects your process.',
        summary: 'Check the highlighted fields before continuing.',
      },
      submitError: 'The preview could not be prepared. Please try again.',
      success: {
        mockLabel: 'Sample data · Not a real comparison',
        title: 'Your job-search preview is ready.',
        description:
          'Your information was not saved. Once real community data is available, your comparison with similar profiles will appear here.',
        yourDurationLabel: 'Your search duration',
        communityDurationLabel: 'Illustrative community median',
        yourTechnicalEffortLabel: 'For one technical interview',
        communityTechnicalEffortLabel: 'Illustrative technical median',
        yourApplicationsLabel: 'Applications',
        conversionTitle: 'Your application flow',
        responseLabel: 'Responses',
        hrLabel: 'HR',
        technicalLabel: 'Technical',
        offerLabel: 'Offers',
        dayUnit: 'days',
        applicationUnit: 'applications',
        cohortLabel: 'Comparison cohort',
        personalSignalLabel: 'Your clearest signal',
        applicationsPerTechnicalSuffix: 'applications for one technical interview',
        noTechnicalInterviewSignal: 'The process appears to have stopped before a technical interview.',
        responseRatePrefix: 'Of your applications,',
        responseRateSuffix: 'received a response.',
        previewNote: 'This is an illustrative preview built with sample values; your response is not saved in this prototype.',
      },
      explainer: {
        eyebrow: '04 / Survey purpose',
        title: 'We turn job-search effort into something measurable.',
        intro:
          'This survey does more than count applications. It makes the time you spend searching, the narrowing inside your application funnel, and the effort required to reach an offer comparable with similar candidates.',
        whyTitle: 'Why compare your job-search journey?',
        reasons: [
          {
            title: 'To stop treating the process as a personal failure',
            description: 'Seeing how many applications similar candidates submit puts prolonged silence into real market context.',
          },
          {
            title: 'To build a realistic timeline',
            description: 'The median time from first application to offer helps you plan a job change using stronger evidence.',
          },
          {
            title: 'To see where your applications narrow',
            description: 'Response, HR, technical interview, and offer rates reveal the stage where the process becomes difficult.',
          },
        ],
        measurementTitle: 'What does this survey measure?',
        measurementDescription:
          'Results are grouped by role, industry, experience, target region, and work model. Personal information and documents are not part of the measurement.',
        metrics: [
          'Applications per offer',
          'Job-search duration',
          'Application-to-response rate',
          'HR and technical interview rate',
          'Offer conversion',
          'Expectation and offer range',
        ],
        howTitle: 'How does it work?',
        steps: [
          { title: 'Describe your journey', description: 'Share your role and core application numbers in about 2 minutes.' },
          { title: 'Match with similar profiles', description: 'Your result is compared with illustrative candidates in the same context.' },
          { title: 'See the funnel', description: 'Review your timeline, effort, and application funnel in one result.' },
        ],
        transparencyTitle: 'Illustrative preview for now',
        transparencyText:
          'This prototype does not save responses and uses sample values for community comparisons. Once the real data layer is available, only groups with a sufficient sample size will be published.',
      },
    },
    hrProcessForm: {
      trustPanel: {
        dataLabel: 'Anonymous Survey',
        title: 'Did they respond within the promised timeline?',
        description:
          'Evaluating the process will take about 3 minutes. HR transparency and response timelines will be added to community data.',
        items: [
          'No registration required',
          'No name or email asked',
          'Company name is kept anonymous and added to the aggregate score',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form progress',
        items: ['Company and role', 'Process and ghosting', 'Evaluation'],
      },
      privacyRow: 'Anonymous · No names collected · No documents required',
      selectPlaceholder: 'Select',
      booleanOptions: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
      steps: {
        step1: {
          title: 'Company and role',
          description: 'Specify the company and the role you interviewed for.',
          fields: {
            companyName: { label: 'Company name', placeholder: 'e.g. Tech Corp' },
            appliedRole: { label: 'Position / role', placeholder: 'e.g. Frontend Developer' },
            processYear: {
              label: 'In what year did the process take place?',
              options: { '2024': '2024', '2025': '2025', '2026': '2026' },
            },
          },
        },
        step2: {
          title: 'Process and ghosting',
          description: 'Compare the promised timeline with the actual timeline.',
          fields: {
            promisedTimeline: {
              label: 'Was a response timeline promised at the beginning of the process?',
              options: { yes: 'Yes, a timeline was provided', no: 'No, it was not specified', not_specified: 'I don’t remember' },
            },
            promisedDays: { label: 'In how many days did they say they would respond?' },
            actualDays: { label: 'How many days did it actually take them to respond?' },
            wasGhosted: { label: 'Were you ghosted (communication cut off without notice)?' },
            ghostedAfterStage: {
              label: 'After which stage were you ghosted?',
              options: { application: 'Application', hr_screen: 'HR Interview', technical: 'Technical Interview', final: 'Final Interview' },
            },
            interviewerPrepared: { label: 'Were the interviewers prepared for the interview? (1-5)' },
            wasAskedIrrelevant: { label: 'Were you asked irrelevant or inappropriate questions?' },
            irrelevantTypes: {
              label: 'What kind of questions were asked?',
              options: { age: 'Age', marital_status: 'Marital status', salary_history: 'Salary history', personal_questions: 'Private life', other: 'Other' },
            },
          },
        },
        step3: {
          title: 'Evaluation',
          description: 'Rate the HR team and the transparency of the process.',
          fields: {
            rejectionShared: {
              label: 'Was a rejection reason shared?',
              options: { yes_detailed: 'Yes, they gave detailed feedback', yes_generic: 'Yes, but it was a standard template', no: 'No, no reason was given' },
            },
            feedbackUseful: { label: 'Was the feedback useful for your growth? (1-5)' },
            processTransparency: { label: 'Transparency of the process (1-5)' },
            hrProfessionalism: { label: 'Professionalism of the HR team (1-5)' },
            wouldRecommendProcess: {
              label: 'Would you recommend this company’s interview process to others?',
              options: { yes: 'Yes', no: 'No', unsure: 'Not sure' },
            },
            freeNote: {
              label: 'Any other details you want to add?',
              placeholder: 'Briefly describe the process without sharing names or identifying information.',
            },
          },
        },
      },
      navigation: {
        back: 'Back',
        next: 'Continue',
        complete: 'Complete and view result',
        loading: 'Preparing…',
      },
      validation: {
        required: 'This field is required.',
        nonNegativeNumber: 'Enter a whole number equal to or greater than 0.',
        noteTooLong: 'The note must be 500 characters or fewer.',
        timelineGapWarning: 'The actual timeline seems much longer than promised. Are you sure you entered it correctly?',
        summary: 'Check the highlighted fields before continuing.',
      },
      submitError: 'The preview could not be prepared. Please try again.',
      success: {
        title: 'Your process evaluation is ready.',
        description: 'Your information was not saved. In the real system, this evaluation will affect the company’s HR transparency score.',
        ghostedLabel: 'Ghosting status',
        transparencyLabel: 'Transparency score',
        professionalismLabel: 'Professionalism score',
      },
      explainer: {
        eyebrow: '04 / Survey purpose',
        title: 'We turn company processes from isolated complaints into shared signals.',
        intro:
          'This survey captures how an application or interview process with a company actually unfolded. The goal is not to amplify a single incident, but to make repeated HR behaviors visible through anonymous process records.',
        whyTitle: 'Why share a company experience?',
        reasons: [
          {
            title: 'To separate what was promised from what happened',
            description: 'Whether a promised response timeline was kept is one of the clearest signals of candidate experience.',
          },
          {
            title: 'To make ghosting and silence visible',
            description: 'One unanswered candidate is uncertainty; repeated silence becomes a signal about the quality of a hiring process.',
          },
          {
            title: 'To measure feedback and professionalism',
            description: 'Rejection reasons, interviewer preparation, and inappropriate-question signals show the real candidate-side quality of the process.',
          },
        ],
        measurementTitle: 'What does this survey measure?',
        measurementDescription:
          'Responses are interpreted through company, role, and process-year context. Personal names, private documents, and identifying details are not part of the measurement.',
        metrics: [
          'Promised response timeline',
          'Actual response timeline',
          'Ghosting stage',
          'Feedback quality',
          'HR professionalism',
          'Process recommendation score',
        ],
        howTitle: 'How does it work?',
        steps: [
          { title: 'Place the process in context', description: 'Share the company, role, and year so the experience can be read in the right frame.' },
          { title: 'Compare promise and reality', description: 'Measure the promised response timeline against what actually happened.' },
          { title: 'Strengthen the signal', description: 'Feedback, ghosting, and professionalism data become part of the community signal.' },
        ],
        transparencyTitle: 'Moderation and sample threshold',
        transparencyText:
          'This prototype does not save responses. In the real data layer, company signals will not be published publicly without moderation and a sufficient sample size.',
      },
    },
  },
}
