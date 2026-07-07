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
        exploreHover: 'Yerini Belirle',
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
            id: 'response-speed',
            type: 'comparison',
            path: '/surveys/company-experience',
            tabLabel: 'Söz / Gerçek',
            eyebrow: 'Karşılaştırma / Söz ve gerçek',
            title: 'Söylenen süre ile yaşanan süre aynı değil',
            description:
              'Şirketin belirttiği geri dönüş süresiyle adayların fiilen yaşadığı süreyi aynı ölçekte karşılaştırıyoruz.',
            comparison: {
              promiseLabel: 'Söz',
              promiseValue: '3 gün',
              promiseDescription: 'Şirketin başvuru sırasında belirttiği ilk geri dönüş süresi.',
              realityLabel: 'Gerçek',
              realityValue: '9 gün',
              realityDescription: 'Adayların bildirdiği gerçekleşen ilk dönüş süresinin ortancası.',
              deltaLabel: 'Söz ile gerçek arasındaki fark',
              deltaValue: '+6 gün',
            },
          },
          {
            id: 'application-benchmark',
            type: 'funnel',
            path: '/surveys/application-benchmark',
            tabLabel: 'Başvuru benchmark',
            eyebrow: 'Sinyal / Başvuru benchmark',
            title: 'Başvurudan teknik görüşmeye uzanan daralma',
            description:
              'Topluluk verisi, başvurudan teknik görüşmeye uzanan daralmayı görünür hale getirir.',
            primaryValue: '18',
            primaryLabel: 'Başvuru',
            secondaryValue: '1',
            secondaryLabel: 'Teknik görüşme',
            chartLabel: 'Başvuru aşamaları',
            stages: [
              { label: 'Başvuru', value: '18', share: '%100' },
              { label: 'Dönüş', value: '7', share: '%39' },
              { label: 'HR görüşmesi', value: '3', share: '%17' },
              { label: 'Teknik görüşme', value: '1', share: '%6' },
            ],
          },
          {
            id: 'company-experience',
            type: 'signal',
            path: '/surveys/company-experience',
            tabLabel: 'Şirket deneyimi',
            eyebrow: 'Sinyal / Şirket deneyimi',
            title: 'Sessiz kalan süreçler görünür oluyor',
            description:
              'Yanıtsız kalan başvurular ve düşük feedback oranı tek tek kaybolmak yerine ortak bir sinyale dönüşür.',
            primaryValue: '%41',
            primaryLabel: 'Yanıtsız',
            secondaryValue: '%12',
            secondaryLabel: 'Otomatik ret',
            chartLabel: 'Yanıt durumu',
            distribution: responseStatuses.tr,
          },
          {
            id: 'feedback-quality',
            type: 'signal',
            path: '/surveys/company-experience',
            tabLabel: 'Feedback kalitesi',
            eyebrow: 'Sinyal / Feedback kalitesi',
            title: 'Anlamlı feedback hâlâ istisna',
            description:
              'Adayların yalnızca küçük bir bölümü, neden elendiğini açıklayan kullanılabilir bir geri bildirim aldığını belirtiyor.',
            primaryValue: '%12',
            primaryLabel: 'Anlamlı feedback',
            secondaryValue: '%88',
            secondaryLabel: 'Yetersiz veya yok',
            chartLabel: 'Feedback niteliği',
            distribution: [
              { label: 'Anlamlı feedback', value: '%12', width: '12%' },
              { label: 'Yetersiz veya yok', value: '%88', width: '88%' },
            ],
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
          'Yaklaşık 30 saniyede iş arama sürecini tanımla ve temsili topluluk görünümüyle karşılaştır.',
        items: [
          'Kayıt gerekmiyor',
          'İsim veya e-posta istenmiyor',
          'Maaş bilgisi yalnızca aralık olarak toplanır',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form ilerlemesi',
        items: ['Kim ve ne durumda', 'Sayılar ve maaş', 'Ek bilgi'],
      },
      privacyRow: 'Anonim · İsim toplanmaz · Belge istenmez',
      selectPlaceholder: 'Seçiniz',
      booleanOptions: [
        { value: true, label: 'Evet' },
        { value: false, label: 'Hayır' },
      ],
      steps: {
        step1: {
          title: 'Kim ve ne durumda',
          description: 'İş arama sürecini anlamlandırmak için yalnızca gerekli bağlamı paylaş.',
          selectPlaceholder: 'Seçiniz',
          booleanOptions: [
            { value: true, label: 'Evet' },
            { value: false, label: 'Hayır' },
          ],
          fields: {
            role: { label: 'Pozisyon / rol', placeholder: 'Örn. Frontend Developer' },
            experienceBand: {
              label: 'Deneyim yılın',
              options: { '0-1': '0-1 yıl', '1-3': '1-3 yıl', '3-5': '3-5 yıl', '5-8': '5-8 yıl', '8+': '8+ yıl' },
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
          title: 'Sayılar ve maaş',
          description: 'Başvurudan teklife kadar geldiğin noktayı sayılarla özetle.',
          countFields: [
            { name: 'applicationsCount', label: 'Kaç başvuru yaptın?' },
            { name: 'responsesCount', label: 'Kaç dönüş aldın?' },
            { name: 'interviewsCount', label: 'Kaç görüşmeye girdin?' },
            { name: 'offersCount', label: 'Kaç teklif aldın?' },
          ],
          salaryTitle: 'Maaş karşılaştırması',
          salaryNote: 'Aylık maaş bilgisini kesin rakam yerine yaklaşık bir bant olarak paylaşabilirsin.',
          optional: 'Opsiyonel',
          preferNotToSay: 'Boş bırak / belirtmek istemiyorum',
          salaryFields: [
            { name: 'currentSalaryBand', label: 'Mevcut veya son maaş bandın' },
            { name: 'expectedSalaryBand', label: 'Beklediğin maaş bandı' },
            { name: 'highestOfferBand', label: 'Aldığın en yüksek teklif bandı' },
          ],
        },
        step3: {
          title: 'Ek bilgi',
          description: 'Son birkaç ayrıntı karşılaştırmayı daha anlamlı hale getirebilir.',
          optionalNote: 'Bu adım tamamen opsiyonel. Dilersen atlayıp sonuç önizlemesine geçebilirsin.',
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
        medianLabel: 'Temsili medyan gün',
        ongoingLabel: 'Devam eden süreç',
        yourApplicationsLabel: 'Senin başvurun',
      },
    },
    companyExperienceForm: {
      trustPanel: {
        dataLabel: 'Anonim Anket',
        title: 'Mülakat sürecinde neler yaşadın?',
        description:
          'İyi ya da kötü, yaşadığın süreci paylaşarak şirketlerin aday deneyimi karnesini oluşturmamıza yardım et.',
        items: [
          'Kayıt gerekmiyor',
          'İsim veya e-posta istenmiyor',
          'Şirket adı doğrudan ifşa edilmez, genel topluluk verisine ve skorlara katılır',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form ilerlemesi',
        items: ['Şirket ve rol', 'Süreç sonucu', 'Değerlendirme'],
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
          description: 'Hangi şirkette ve hangi rol için sürece girdiğini belirt.',
          fields: {
            companyName: { label: 'Şirket adı', placeholder: 'Örn. Tech Corp' },
            appliedRole: { label: 'Pozisyon / rol', placeholder: 'Örn. Frontend Developer' },
            companySector: {
              label: 'Şirket sektörü',
              options: { technology: 'Teknoloji / Yazılım', finance: 'Finans', ecommerce: 'E-ticaret', consulting: 'Danışmanlık', healthcare: 'Sağlık', manufacturing: 'Üretim', education: 'Eğitim', media: 'Medya', telecom: 'Telekomünikasyon', other: 'Diğer' },
            },
            companySize: {
              label: 'Şirket büyüklüğü',
              options: { '1-50': '1-50 çalışan', '50-200': '50-200 çalışan', '200-1000': '200-1000 çalışan', '1000+': '1000+ çalışan' },
            },
            applicationChannel: {
              label: 'Başvuru kanalı',
              options: { linkedin: 'LinkedIn', kariyer_net: 'Kariyer.net', referral: 'Referans (Referral)', company_site: 'Şirket websitesi', other: 'Diğer' },
            },
          },
        },
        step2: {
          title: 'Süreç sonucu',
          description: 'Süreç nasıl ve hangi aşamada sonlandı?',
          fields: {
            lastStage: {
              label: 'Süreç hangi aşamada kaldı/sonlandı?',
              options: { no_response: 'Hiç dönüş olmadı', auto_rejected: 'Otomatik red', hr_rejected: 'HR aşamasında red', hr_interview: 'HR Mülakatı sonrası iptal/red', technical_interview: 'Teknik Mülakat sonrası iptal/red', final_interview: 'Final görüşme sonrası iptal/red', offer_declined: 'Teklif aldım, ben reddettim', offer_accepted: 'Teklif aldım, kabul ettim' },
            },
            gotResponse: { label: 'Başvuru sonrasında herhangi bir dönüş (red dahil) aldın mı?' },
            responseTimeDays: { label: 'Kaç gün sonra dönüş yaptılar?', suffix: 'gün' },
          },
        },
        step3: {
          title: 'Değerlendirme',
          description: 'Sürecin genelini nasıl puanlarsın?',
          fields: {
            overallExperience: {
              label: 'Genel mülakat deneyimi puanın',
              minLabel: 'Çok Kötü',
              maxLabel: 'Çok İyi',
            },
            wouldReapply: { label: 'İleride bu şirkete tekrar başvurmayı düşünür müsün?' },
            freeNote: { label: 'Süreç hakkında paylaşmak istediğin spesifik bir not var mı? (Opsiyonel)', placeholder: 'Örn: Teknik mülakattaki case çok uzundu...' },
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
        ghostingWarning: 'Mülakat aşamasına gelip hiç dönüş almadığınızı belirttiniz. Bu ciddi bir ghosting vakasıdır.',
        summary: 'Devam etmeden önce işaretli alanları kontrol et.',
      },
      submitError: 'Önizleme hazırlanamadı. Lütfen tekrar dene.',
      success: {
        mockLabel: 'Örnek veri · Gerçek karşılaştırma değil',
        title: 'Deneyim değerlendirmen hazır.',
        description: 'Bilgilerin kaydedilmedi. Gerçek sistemde bu veri, şirketin genel aday deneyimi karnesini oluşturmak için kullanılacaktır.',
        experienceLabel: 'Verdiğin Puan',
        recommendLabel: 'Tekrar Başvuru',
        recommendYes: 'Evet',
        recommendNo: 'Hayır',
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
        exploreHover: 'See Where You Stand',
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
            id: 'response-speed',
            type: 'comparison',
            path: '/surveys/company-experience',
            tabLabel: 'Promise / Reality',
            eyebrow: 'Comparison / Promise and reality',
            title: 'The stated timeline and lived timeline do not match',
            description:
              'We compare the response time stated by the company with the timeline candidates actually experienced.',
            comparison: {
              promiseLabel: 'Promise',
              promiseValue: '3 days',
              promiseDescription: 'The first-response timeline stated by the company during the application.',
              realityLabel: 'Reality',
              realityValue: '9 days',
              realityDescription: 'The median actual first-response time reported by candidates.',
              deltaLabel: 'Gap between promise and reality',
              deltaValue: '+6 days',
            },
          },
          {
            id: 'application-benchmark',
            type: 'funnel',
            path: '/surveys/application-benchmark',
            tabLabel: 'Application benchmark',
            eyebrow: 'Signal / Application benchmark',
            title: 'The narrowing path to a technical interview',
            description:
              'Community data makes the narrowing path from application to technical interview visible.',
            primaryValue: '18',
            primaryLabel: 'Applications',
            secondaryValue: '1',
            secondaryLabel: 'Technical interview',
            chartLabel: 'Application stages',
            stages: [
              { label: 'Applications', value: '18', share: '100%' },
              { label: 'Responses', value: '7', share: '39%' },
              { label: 'HR interviews', value: '3', share: '17%' },
              { label: 'Technical interviews', value: '1', share: '6%' },
            ],
          },
          {
            id: 'company-experience',
            type: 'signal',
            path: '/surveys/company-experience',
            tabLabel: 'Company experience',
            eyebrow: 'Signal / Company experience',
            title: 'Silent processes become visible',
            description:
              'Unanswered applications and low feedback rates become a shared signal instead of disappearing one by one.',
            primaryValue: '41%',
            primaryLabel: 'No response',
            secondaryValue: '12%',
            secondaryLabel: 'Automated rejection',
            chartLabel: 'Response status',
            distribution: responseStatuses.en,
          },
          {
            id: 'feedback-quality',
            type: 'signal',
            path: '/surveys/company-experience',
            tabLabel: 'Feedback quality',
            eyebrow: 'Signal / Feedback quality',
            title: 'Meaningful feedback remains the exception',
            description:
              'Only a small share of candidates report receiving actionable feedback that explains why they were rejected.',
            primaryValue: '12%',
            primaryLabel: 'Meaningful feedback',
            secondaryValue: '88%',
            secondaryLabel: 'Insufficient or none',
            chartLabel: 'Feedback quality',
            distribution: [
              { label: 'Meaningful feedback', value: '12%', width: '12%' },
              { label: 'Insufficient or none', value: '88%', width: '88%' },
            ],
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
          'Describe your job search in about 30 seconds and compare it with an illustrative community view.',
        items: [
          'No account required',
          'No name or email requested',
          'Salary is collected only as a range',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form progress',
        items: ['Context and status', 'Numbers and salary', 'Additional details'],
      },
      privacyRow: 'Anonymous · No names · No documents',
      selectPlaceholder: 'Select',
      booleanOptions: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
      steps: {
        step1: {
          title: 'Context and status',
          description: 'Share only the context needed to understand your job-search timeline.',
          selectPlaceholder: 'Select',
          booleanOptions: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
          fields: {
            role: { label: 'Position / role', placeholder: 'e.g. Frontend Developer' },
            experienceBand: {
              label: 'Years of experience',
              options: { '0-1': '0-1 years', '1-3': '1-3 years', '3-5': '3-5 years', '5-8': '5-8 years', '8+': '8+ years' },
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
          title: 'Numbers and salary',
          description: 'Summarize your path from applications to offers with a few numbers.',
          countFields: [
            { name: 'applicationsCount', label: 'How many applications did you submit?' },
            { name: 'responsesCount', label: 'How many responses did you receive?' },
            { name: 'interviewsCount', label: 'How many interviews did you attend?' },
            { name: 'offersCount', label: 'How many offers did you receive?' },
          ],
          salaryTitle: 'Salary comparison',
          salaryNote: 'Share an approximate monthly range instead of an exact salary.',
          optional: 'Optional',
          preferNotToSay: 'Leave blank / prefer not to say',
          salaryFields: [
            { name: 'currentSalaryBand', label: 'Current or most recent salary range' },
            { name: 'expectedSalaryBand', label: 'Expected salary range' },
            { name: 'highestOfferBand', label: 'Highest offer received' },
          ],
        },
        step3: {
          title: 'Additional details',
          description: 'A few final details can make the comparison more meaningful.',
          optionalNote: 'This step is entirely optional. You can skip it and view the result preview.',
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
        medianLabel: 'Illustrative median days',
        ongoingLabel: 'Processes ongoing',
        yourApplicationsLabel: 'Your applications',
      },
    },
    companyExperienceForm: {
      trustPanel: {
        dataLabel: 'Anonymous Survey',
        title: 'What was your interview experience like?',
        description:
          'Good or bad, share your process to help us build a candidate experience report card for companies.',
        items: [
          'No registration required',
          'No name or email asked',
          'Company name is not directly exposed, it contributes to aggregate scores',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form progress',
        items: ['Company and role', 'Process outcome', 'Evaluation'],
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
            companySector: {
              label: 'Company sector',
              options: { technology: 'Technology / Software', finance: 'Finance', ecommerce: 'E-commerce', consulting: 'Consulting', healthcare: 'Healthcare', manufacturing: 'Manufacturing', education: 'Education', media: 'Media', telecom: 'Telecommunications', other: 'Other' },
            },
            companySize: {
              label: 'Company size',
              options: { '1-50': '1-50 employees', '50-200': '50-200 employees', '200-1000': '200-1000 employees', '1000+': '1000+ employees' },
            },
            applicationChannel: {
              label: 'Application channel',
              options: { linkedin: 'LinkedIn', kariyer_net: 'Kariyer.net', referral: 'Referral', company_site: 'Company website', other: 'Other' },
            },
          },
        },
        step2: {
          title: 'Process outcome',
          description: 'How and at what stage did the process end?',
          fields: {
            lastStage: {
              label: 'At what stage did the process end?',
              options: { no_response: 'No response', auto_rejected: 'Auto rejection', hr_rejected: 'Rejected at HR stage', hr_interview: 'Rejected/cancelled after HR Interview', technical_interview: 'Rejected/cancelled after Technical Interview', final_interview: 'Rejected/cancelled after Final Interview', offer_declined: 'Received offer, I declined', offer_accepted: 'Received offer, I accepted' },
            },
            gotResponse: { label: 'Did you receive any response (including rejection) after applying?' },
            responseTimeDays: { label: 'How many days later did they respond?', suffix: 'days' },
          },
        },
        step3: {
          title: 'Evaluation',
          description: 'How would you rate the overall process?',
          fields: {
            overallExperience: {
              label: 'Overall interview experience rating',
              minLabel: 'Very Bad',
              maxLabel: 'Very Good',
            },
            wouldReapply: { label: 'Would you consider applying to this company again in the future?' },
            freeNote: { label: 'Any specific note you want to share about the process? (Optional)', placeholder: 'e.g. The case study in the technical interview was too long...' },
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
        ghostingWarning: 'You indicated you reached the interview stage but received no response. This is a severe case of ghosting.',
        summary: 'Check the highlighted fields before continuing.',
      },
      submitError: 'The preview could not be prepared. Please try again.',
      success: {
        mockLabel: 'Sample data · Not a real comparison',
        title: 'Your experience evaluation is ready.',
        description: 'Your information was not saved. In the real system, this data will be used to build the company’s candidate experience report card.',
        experienceLabel: 'Your Rating',
        recommendLabel: 'Would Apply Again',
        recommendYes: 'Yes',
        recommendNo: 'No',
      },
    },
  },
}
