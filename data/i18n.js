export const supportedLocales = ['tr', 'en']

export function isSupportedLocale(locale) {
  return supportedLocales.includes(locale)
}

export function getMessages(locale) {
  return messages[locale] ?? messages.tr
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
        title: 'Başvuru Benchmark',
        description:
          'Başvuru, dönüş, HR görüşmesi ve teknik mülakat oranlarını anonim olarak topluluk verisine ekle.',
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
        badge: 'Kayıt olmadan anonim katkı',
        title: 'Başvuruların kara deliğe mi düşüyor?',
        description:
          'Otomatik red, ghosting ve feedback almayan süreçler artık veri oluyor. Interview Memory, adayların başvuru ve mülakat deneyimlerini anonim şekilde toplayarak işe alım süreçlerini görünür kılar.',
        slogan: 'Şirketler seni değerlendiriyor. Sen de süreci ölç.',
        explore: 'Anketleri keşfet',
        benchmark: 'Kaç başvuruya mülakat düşüyor?',
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
        title: 'Kaç başvuruya bir mülakat düşüyor?',
        description:
          'Benzer deneyim, rol ve network seviyesindeki adayların kaç başvuruda dönüş, HR görüşmesi ve teknik mülakat aldığını anlamamıza katkı sağla.',
        duration: '2-4 dk',
        icon: 'chart',
        cta: 'Başvuru oranımı paylaş',
        bullets: [
          'Son dönemde kaç başvuru yaptın?',
          'Kaç şirket dönüş yaptı?',
          'Kaç HR görüşmesi aldın?',
          'Kaç teknik görüşmeye girdin?',
          'Referans veya network etkisi var mıydı?',
        ],
        tags: ['Başvuru oranı', 'Mülakat şansı', 'Network', 'Benchmark'],
      },
    ],
    community: {
      eyebrow: 'Örnek topluluk verisi',
      title: 'Sessiz kalan başvurular sadece senin başına gelmiyor olabilir.',
      description:
        'Otomatik red, ghosting ve feedback almayan süreçler tek tek kaybolmasın. Bir araya geldiklerinde şirketlerin işe alım davranışlarını görünür kılan sinyallere dönüşür.',
      note:
        'Bu prototipteki değerler temsili mock verilerdir; gerçek topluluk ölçümleri değildir.',
      stats: [
        {
          value: '1.248',
          label: 'Anonim katkı',
          description: 'Başvuru ve mülakat süreci sinyali',
        },
        {
          value: '%41',
          label: 'Sessiz kalan süreç',
          description: 'Dönüş yapılmadığı belirtilen deneyimler',
        },
        {
          value: '%12',
          label: 'Feedback oranı',
          description: 'Olumsuz süreçte anlamlı feedback alan adaylar',
        },
        {
          value: '18',
          label: 'Başvuru / mülakat',
          description: 'Mock veriye göre ilk görüşme ortalaması',
        },
      ],
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
      eyebrow: 'Anket 02',
      title: 'Kaç başvuruya bir mülakat düşüyor?',
      description:
        'Bu form, benzer adayların kaç başvuruda dönüş, HR görüşmesi, teknik görüşme ve teklif alabildiğini anlamak için anonim veri toplar.',
      warning:
        'Bu bir kesin tahmin aracı değildir. Toplanan anonim veriler, adayların başvuru süreçlerini topluluk seviyesinde anlamak için kullanılacaktır.',
      targetRole: 'Hedef rol',
      targetRolePlaceholder: 'Örn. Frontend Developer',
      experienceYears: 'Deneyim yılı',
      experienceYearsPlaceholder: 'Örn. 3',
      period: 'Dönem',
      periodOptions: ['Son 30 gün', 'Son 60 gün', 'Son 90 gün', 'Son 6 ay'],
      workModel: 'Çalışma modeli',
      workModelOptions: ['Remote', 'Hybrid', 'On-site', 'Fark etmez'],
      englishLevel: 'İngilizce seviyesi',
      englishLevelOptions: ['Belirtmek istemiyorum', 'A1-A2', 'B1-B2', 'C1-C2'],
      countLabels: [
        'Kaç başvuru yaptın?',
        'Kaç dönüş aldın?',
        'Kaç otomatik red aldın?',
        'Kaç HR görüşmesi aldın?',
        'Kaç teknik görüşme aldın?',
        'Kaç teklif aldın?',
      ],
      referredApplications: 'Referanslı başvuru',
      portfolio: 'Portfolio var mı?',
      portfolioOptions: ['Evet', 'Hayır'],
      github: 'GitHub aktif mi?',
      githubOptions: ['Evet', 'Hayır', 'Rolüm için gerekli değil'],
      submit: 'Anonim başvuru verimi gönder',
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
        title: 'Application Benchmark',
        description:
          'Add your application, response, HR interview, and technical interview rates to the community data anonymously.',
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
        badge: 'Contribute anonymously without registering',
        title: 'Are your applications falling into a black hole?',
        description:
          'Automated rejections, ghosting, and processes without feedback now become data. Interview Memory collects application and interview experiences anonymously to make hiring processes visible.',
        slogan: 'Companies evaluate you. Now measure the process.',
        explore: 'Explore surveys',
        benchmark: 'How many applications lead to an interview?',
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
        title: 'How many applications lead to one interview?',
        description:
          'Help us understand how many applications result in responses, HR calls, and technical interviews for candidates with similar experience, roles, and networks.',
        duration: '2-4 min',
        icon: 'chart',
        cta: 'Share my application rate',
        bullets: [
          'How many applications did you submit recently?',
          'How many companies responded?',
          'How many HR calls did you receive?',
          'How many technical interviews did you attend?',
          'Did referrals or networking make a difference?',
        ],
        tags: ['Application rate', 'Interview odds', 'Network', 'Benchmark'],
      },
    ],
    community: {
      eyebrow: 'Sample community data',
      title: 'Silent applications may not be happening only to you.',
      description:
        'Do not let automated rejections, ghosting, and missing feedback disappear one by one. Together, they become signals that reveal company hiring behavior.',
      note:
        'The values in this prototype are representative mock data, not real community metrics.',
      stats: [
        {
          value: '1,248',
          label: 'Anonymous contributions',
          description: 'Application and interview process signals',
        },
        {
          value: '41%',
          label: 'Silent processes',
          description: 'Experiences reported without a response',
        },
        {
          value: '12%',
          label: 'Feedback rate',
          description: 'Candidates receiving meaningful feedback after rejection',
        },
        {
          value: '18',
          label: 'Applications / interview',
          description: 'Mock average before the first interview',
        },
      ],
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
      eyebrow: 'Survey 02',
      title: 'How many applications lead to one interview?',
      description:
        'This form collects anonymous data to understand how many applications result in responses, HR interviews, technical interviews, and offers for similar candidates.',
      warning:
        'This is not a definitive prediction tool. Anonymous data will be used to understand application processes at a community level.',
      targetRole: 'Target role',
      targetRolePlaceholder: 'e.g. Frontend Developer',
      experienceYears: 'Years of experience',
      experienceYearsPlaceholder: 'e.g. 3',
      period: 'Period',
      periodOptions: ['Last 30 days', 'Last 60 days', 'Last 90 days', 'Last 6 months'],
      workModel: 'Work model',
      workModelOptions: ['Remote', 'Hybrid', 'On-site', 'No preference'],
      englishLevel: 'English level',
      englishLevelOptions: ['Prefer not to say', 'A1-A2', 'B1-B2', 'C1-C2'],
      countLabels: [
        'How many applications did you submit?',
        'How many responses did you receive?',
        'How many automated rejections did you receive?',
        'How many HR interviews did you receive?',
        'How many technical interviews did you receive?',
        'How many offers did you receive?',
      ],
      referredApplications: 'Referred applications',
      portfolio: 'Do you have a portfolio?',
      portfolioOptions: ['Yes', 'No'],
      github: 'Is your GitHub active?',
      githubOptions: ['Yes', 'No', 'Not required for my role'],
      submit: 'Submit anonymous application data',
    },
  },
}
