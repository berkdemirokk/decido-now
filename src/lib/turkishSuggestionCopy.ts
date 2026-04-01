type TurkishSuggestionCopy = {
  coreTitle: string;
  action: string;
  reason?: string;
};

const tr = (coreTitle: string, action: string, reason?: string): TurkishSuggestionCopy => ({
  coreTitle,
  action,
  reason,
});

export const TR_SUGGESTION_COPY: Record<string, TurkishSuggestionCopy> = {
  'focus-01': tr(
    'Tek Sayfalık Çıkış',
    'Açık kalan işi tek sayfalık ilk taslağa indir.',
    'Büyük bloklar seni durduruyor. Küçük ama görünür bir çıkış momentum üretir.'
  ),
  'focus-02': tr(
    'Telefonu Ters Çevir',
    '10 dakika boyunca telefonu ters çevir ve tek işi kapat.',
    'Bugün ihtiyacın olan şey daha çok seçenek değil; daha az gürültü.'
  ),
  'focus-03': tr(
    '25 Dakikalık Net Blok',
    'Tek hedef seç ve 25 dakika boyunca sadece ona çalış.',
    'Zihin dağıldığında süreyi değil çizgiyi daraltmak kazanır.'
  ),
  'focus-04': tr(
    'Bekleyen Maili Kapat',
    'Uzun süredir açık duran tek maili bitir ve gönder.',
    'Küçük açık uçlar, göründüğünden fazla enerji çalar.'
  ),
  'focus-05': tr(
    'Listeyi Yarıya İndir',
    'Bugünün listesini yalnızca en etkili iki işe indir.',
    'Az seçenek daha az yorgunluk, daha temiz hareket demektir.'
  ),
  'focus-06': tr(
    'Inbox Temizlik Turu',
    '10 dakika boyunca sadece sil, arşivle ya da devret.',
    'Belirsiz girişleri temizlemek, karar kalitesini hızla yükseltir.'
  ),
  'focus-07': tr(
    'Üç Adımlık Blueprint',
    'Kafanı meşgul eden konuyu üç somut adım olarak yaz.',
    'Soyut baskı, net adımlara inince gücünü kaybeder.'
  ),

  'health-01': tr(
    '7 Dakikalık Beden Reset’i',
    'Omuz, boyun ve bel için 7 dakikalık reset turu yap.',
    'Beden gevşeyince karar sistemi de daha temiz çalışır.'
  ),
  'health-02': tr(
    'Su ve Yürüyüş Prime’ı',
    'Büyük bir bardak su iç ve 10 dakikalık kısa yürüyüşe çık.',
    'Düşük enerji sisinden çıkmanın en güvenli yolu hafif harekettir.'
  ),
  'health-03': tr(
    'Dengeli Yakıt Desteği',
    'Bir sonraki öğünü beklemek yerine kısa, dengeli bir atıştırmalık hazırla.',
    'Kan şekeri oynadığında karar kalitesi de oynar.'
  ),
  'health-04': tr(
    'Ekransız Nefes Arası',
    'Dört dakika boyunca ekrandan uzaklaş ve ritimli nefes al.',
    'Kısa bir nefes reset’i sinir sistemine alan açar.'
  ),
  'health-05': tr(
    'Gün Işığı Prime’ı',
    'Dışarı çık, 10 dakika gün ışığında kal ve tempolu yürü.',
    'Ortam değişimi enerjiyi beklenenden hızlı yükseltir.'
  ),
  'health-06': tr(
    'Uyku Zeminini Kur',
    'Bu akşam için 20 dakikalık ekran kapama ritüelini belirle.',
    'Yarınki kararlarının kalitesi bu akşamdan başlar.'
  ),
  'health-07': tr(
    'Mikro Güç Turu',
    'Beş dakika plank, bridge ve squat ile bedeni uyandır.',
    'Kısa güç işi bile biyolojiyi yeniden prime edebilir.'
  ),
  'health-08': tr(
    '10 Dakikalık Ritim Artışı',
    'Bir müzik aç ve 10 dakika tempolu yürü ya da yerinde adım at.',
    'Ritmik hareket, başlama sürtünmesini hızla düşürür.'
  ),
  'health-09': tr(
    'Merdiven Reset’i',
    '2-3 tur merdiven çık ya da kısa bir nabız artış turu yap.',
    'Kısa bir yükseliş zihinsel sisi hızlı keser.'
  ),
  'health-10': tr(
    'Gece Gevşeme Kapanışı',
    'Beş dakika boyunca kalça, sırt ve boyun için yavaş gevşeme hareketleri yap.',
    'Gece gevşemesi, yarının enerjisine görünmez bir yatırım yapar.'
  ),

  'money-01': tr(
    '10 Dakikalık Para Taraması',
    'Son üç günün harcamalarını tek ekranda gözden geçir.',
    'Para stresi çoğu zaman harcamadan değil, sisli görünümden büyür.'
  ),
  'money-02': tr(
    '24 Saatlik Bekleme Kuralı',
    'Bugünkü gereksiz satın almaları 24 saatlik bekleme listesine al.',
    'Gecikme burada kaçış değil, düşük kaliteli karardan korunmadır.'
  ),
  'money-03': tr(
    'Abonelik Sızıntısını Kes',
    'Kullanmadığın tek aboneliği iptal et ya da iptal listene yaz.',
    'Küçük kesintiler bile kontrol hissini geri getirir.'
  ),
  'money-04': tr(
    'Mikro Bütçe Kararı',
    'Bu hafta için tek bir kategoriye harcama limiti koy.',
    'Hayatı baştan kurmak yerine tek alanı sıkılaştırmak daha gerçekçidir.'
  ),
  'money-05': tr(
    'Ekstreye İsim Ver',
    'Bu ayın en büyük üç harcamasını gerekli, keyif ve sarkma diye etiketle.',
    'Harcama davranışı adını alınca daha zor saklanır.'
  ),
  'money-06': tr(
    'Tek Fiyat Kontrolü',
    'Almayı düşündüğün tek ürün için ikinci bir fiyat karşılaştırması yap.',
    'Bir ek karşılaştırma bile dürtüsel kararı yavaşlatır.'
  ),
  'money-07': tr(
    'Ücretsiz Alternatif Testi',
    'Bugünkü keyif harcamasını ücretsiz bir alternatife çevir.',
    'Davranışı denemek için tamamen mahrum kalman gerekmez.'
  ),

  'social-01': tr(
    'Tek Mesaj Hamlesi',
    'Uzun zamandır yazmadığın tek kişiye kısa bir mesaj at.',
    'Sosyal tarafta en pahalı şey kusursuzluk değil, gecikmedir.'
  ),
  'social-02': tr(
    '15 Dakikalık Kahve Planı',
    'Bu hafta için kısa bir buluşma öner ve tek tarih seç.',
    'Net teklif, belirsiz niyetten daha çok dönüş alır.'
  ),
  'social-03': tr(
    'Teşekkür Notu',
    'Son zamanda sana iyi gelen birine kısa bir teşekkür mesajı gönder.',
    'Minnettarlık, bağı güçlendirmenin en düşük sürtünmeli yoludur.'
  ),
  'social-04': tr(
    'Bekleyen Cevabı Bitir',
    'Açık duran tek mesaja şimdi net bir cümleyle dön.',
    'Sosyal baskının çoğu büyük olaylardan değil, küçük açık uçlardan çıkar.'
  ),
  'social-05': tr(
    'Aile Check-in’i',
    'Aileden biriyle beş dakikalık kısa bir durum yoklaması yap.',
    'Kısa temas bile bağı canlı tutar.'
  ),
  'social-06': tr(
    'Tek Arama Aç',
    'Mesaj yerine tek kişiyi ara ve on dakika konuş.',
    'Canlı temas, uzun mesajlaşmadan daha hızlı bağ kurar.'
  ),
  'social-07': tr(
    'Küçük Davet Çıkar',
    'Bu hafta için iki kişilik basit bir plan öner.',
    'Küçük davetler daha az sosyal enerji ister ve daha kolay kapanır.'
  ),

  'reset-01': tr(
    'Masa Reset’i',
    'Çalışma alanında yalnızca sonraki iş için gerekenleri bırak.',
    'Fiziksel sadeleşme zihinsel gürültüyü de düşürür.'
  ),
  'reset-02': tr(
    'Üç Eşyalık Temizlik',
    'Gözüne batan yalnızca üç eşyayı yerine koy.',
    'Küçük düzen, dev temizlikten daha sürdürülebilirdir.'
  ),
  'reset-03': tr(
    'Zihin Boşalt',
    'Aklındakileri beş dakika boyunca sansürsüz şekilde boşalt.',
    'Yazıya dökülen düşünce arka planda daha az yer kaplar.'
  ),
  'reset-04': tr(
    'Bir Metrelik Alan',
    'Yaşadığın yerde sadece bir metrelik alanı temizle.',
    'Küçük ama görünür bir sonuç, tüm modu değiştirebilir.'
  ),
  'reset-05': tr(
    'Tek Şarkılık Sıfırlama',
    'Tek bir şarkı boyunca alanını toparla.',
    'Müzik zamanı yumuşatır, başlama eşiğini düşürür.'
  ),
  'reset-06': tr(
    'Bildirim Orucu',
    'Bir saatlik sessiz mod aç ve tek bir şeye alan yarat.',
    'Sistem düzeyindeki gürültü durunca enerji geri gelir.'
  ),
  'reset-07': tr(
    'Yarını Hafiflet',
    'Sabah seni beklemesin diye tek küçük işi şimdi bitir.',
    'Gelecekten yük çekmek akşam stresini hızla düşürür.'
  ),
  'reset-08': tr(
    'Tek Kapanış Al',
    'Bugün açık kalan tek küçük konuyu şimdi kapat ve listeden sil.',
    'Açık döngüler, olduğundan daha ağır hissettirir.'
  ),
  'reset-09': tr(
    'Mikro Meditasyon',
    'İki dakika boyunca yalnızca nefesine dön ve zihni temizle.',
    'Kısa sakinlik bile karar yorgunluğunu kesebilir.'
  ),
  'reset-10': tr(
    'Yarın İçin Sessiz Boşluk',
    'Yarın sabah için tek sakin açılış bloğu ayarla ve not et.',
    'Yarını bu akşamdan hafifletmek güçlü bir stratejidir.'
  ),

  'growth-01': tr(
    '5 Sayfalık Zihin Takviyesi',
    'Seni ileri taşıyan bir kaynaktan yalnızca beş sayfa oku.',
    'Kısa öğrenme dozları daha kolay tekrar eder.'
  ),
  'growth-02': tr(
    'Tek Öğrenme Notu',
    'Bugün öğrendiğin tek şeyi kısa bir nota çevir.',
    'Yazıya dökülen bilgi, pasif tüketim olmaktan çıkar.'
  ),
  'growth-03': tr(
    'Mikro Beceri Drill’i',
    '20 dakika boyunca tek bir mikro beceriyi tekrar et.',
    'Küçük beceri blokları özgüven ve görünür ilerleme üretir.'
  ),
  'growth-04': tr(
    'Yarının Kazanımını Yaz',
    'Yarın için tek net kazanımı bir cümleye dönüştür.',
    'Yarını önceden adlandırmak belirsizliği düşürür.'
  ),
  'growth-05': tr(
    'Merak Blueprint’i',
    'Aklına takılan tek soru için cevap ara ve not et.',
    'Merak, zorlama olmadan öğrenme enerjisi üretir.'
  ),
  'growth-06': tr(
    'Eski Notu Yeniden Aç',
    'Bir önceki nottan tek fikri bugüne taşı ve güncelle.',
    'Var olanı yeniden kullanmak ilerlemeyi hızlandırır.'
  ),
  'growth-07': tr(
    'Hızlı Fikir Prototipi',
    'Aklındaki fikri tek ekranlık ya da tek paragraflık taslağa çevir.',
    'Prototip, düşünceyi test edilebilir hâle getirir.'
  ),

  'learn-01': tr(
    '10 Dakikalık Konu Taraması',
    'Merak ettiğin tek konu için hızlı kaynak taraması yap ve üç madde not al.',
    'Öğrenme, görünür çıktıyla bittiğinde tekrar edilebilir hâle gelir.'
  ),
  'learn-02': tr(
    'Tek Kavram Sprinti',
    'Bugün yalnızca tek bir kavram seç, tanımını yaz ve bir örnek bul.',
    'Tek kavrama odaklanmak bilgi yükünü hızla düşürür.'
  ),
  'learn-03': tr(
    'Mini Bilgi Haritası',
    'Öğrenmek istediğin konu için merkezde başlık olacak şekilde mini zihin haritası çiz.',
    'Bilgiyi görmek, kafa karışıklığını kısaltır.'
  ),
  'learn-04': tr(
    'Bugünün Tek Özeti',
    'Bugün okuduğun ya da izlediğin şeyi dört cümleyle kendine anlat.',
    'Özet çıkarmak tüketimi üretime çevirir.'
  ),
  'learn-05': tr(
    '20 Dakikalık Kaynak Sprinti',
    'Bir kaynak aç ve 20 dakika boyunca yalnızca tek alt başlığa odaklan.',
    'Dar alan, büyük konuların göz korkutmasını engeller.'
  ),
  'learn-06': tr(
    'Feynman Mini Testi',
    'Bugün öğrendiğin tek konuyu altı yaşındaki birine anlatır gibi yaz.',
    'Basit anlatım, anlamadığın boşlukları hızla gösterir.'
  ),
  'learn-07': tr(
    'Tek Soru Avı',
    'Anlamadığın tek soruyu seç, cevabını bul ve notuna ekle.',
    'Tek soruya odaklanmak öğrenmeyi yeniden netleştirir.'
  ),
  'learn-08': tr(
    'Bilgiyi Kullan',
    'Öğrendiğin bir fikri bugün uygulanabilir tek örneğe çevir.',
    'Kullanılan bilgi daha hızlı kalıcı olur.'
  ),

  'language-01': tr(
    '10 Kelimelik Dil Turu',
    'Bugün işine yarayacak 10 kelime seç ve her biriyle bir cümle kur.',
    'Kelimeler, cümleye girince gerçekten çalışmaya başlar.'
  ),
  'language-02': tr(
    'Sesli Tekrar Prime’ı',
    'Kısa bir metni üç dakika boyunca sesli oku ve telaffuza odaklan.',
    'Sesli tekrar, dil kaygısını sandığından hızlı düşürür.'
  ),
  'language-03': tr(
    'Tek Diyalog Çalış',
    'Günlük bir durum seç ve o durum için beş cümlelik mini diyalog yaz.',
    'Gerçek bağlam, dili daha kullanılabilir yapar.'
  ),
  'language-04': tr(
    'Dinle ve Yakala',
    'Kısa bir yabancı dil videosu aç ve anladığın üç ifadeyi not et.',
    'Parça yakalamak, kusursuzluğu kovalamaktan daha sürdürülebilir.'
  ),
  'language-05': tr(
    'Kendine Ses Kaydı',
    'Hedef dilde kendine 30 saniyelik bir ses kaydı bırak.',
    'Sosyal baskı olmadan konuşmak akıcılığı açar.'
  ),
  'language-06': tr(
    'Günün Tek Kalıbı',
    'Bugün kullanabileceğin tek kalıbı seç ve onunla beş cümle kur.',
    'Tek kalıbı fazla kullanmak akıcılığı hızla yükseltir.'
  ),
  'language-07': tr(
    'Mini Dinleme Tekrarı',
    '20 saniyelik bir klibi üç kez dinle ve aynı ritimle tekrar et.',
    'Kısa tekrarlar dinleme ve konuşmayı hızla birbirine bağlar.'
  ),
  'language-08': tr(
    'Hata Avlamadan Konuş',
    'İki dakika boyunca durmadan konuş ve sadece akışı korumaya odaklan.',
    'Başta akıcılık, özgüveni doğruluktan daha hızlı büyütür.'
  ),

  'earn-01': tr(
    'Tek Gelir Fikrini Netleştir',
    'Bugün tek gelir fikrini seç ve onu tek cümlelik değer önerisine indir.',
    'Gelir, fikir netleştiğinde hızlanır.'
  ),
  'earn-02': tr(
    'Mini Outreach Aç',
    'Potansiyel bir müşteriye ya da iş bağlantısına tek net mesaj gönder.',
    'Gelirde asıl eşik çoğu zaman ilk temasın kendisidir.'
  ),
  'earn-03': tr(
    'Teklif Taslağı Çıkar',
    'Sunabileceğin tek hizmet için kısa teklif ya da paket taslağı yaz.',
    'Paketlenen beceri, satılabilir hâle gelir.'
  ),
  'earn-04': tr(
    'Gelir Darboğazını Bul',
    'Para kazanma planında seni tutan tek darboğazı yaz ve bir çözüm seç.',
    'Darboğaz görünür olunca enerji doğru yere gider.'
  ),
  'earn-05': tr(
    'Ürünleştir ve Fiyatla',
    'Bir becerini tek cümlelik hizmete çevir ve yanına başlangıç fiyatını yaz.',
    'Fiyat yazmak, fikri gelir ihtimaline dönüştürür.'
  ),
  'earn-06': tr(
    'Takip Mesajı Gönder',
    'Daha önce yazdığın ama dönülmeyen tek kişiye kısa bir takip mesajı at.',
    'Para çoğu zaman ilk dokunuşta değil, takipte kapanır.'
  ),
  'earn-07': tr(
    'Portfolyo Tek Satır',
    'Yaptığın bir işi sonuç odaklı tek satırlık vaka cümlesine çevir.',
    'Sonuç dili, becerini daha satılabilir yapar.'
  ),
  'earn-08': tr(
    'Tek Gelir Kaldıracını Bul',
    'Bugün gelirini en hızlı artırabilecek tek beceri kaldıracını seç ve not et.',
    'Doğru kaldıraç, rastgele efordan daha hızlı para getirir.'
  ),
  'earn-09': tr(
    'Mini Landing Taslağı',
    'Sattığın şeyi anlatan üç blokluk mini landing metni çıkar.',
    'Dağınık fikir yerine paketlenmiş teklif daha kolay satılır.'
  ),
};

export const TR_DAILY_SPARKS = [
  {
    title: 'Bugün tek şeyi temiz kapat.',
    body: 'Dev sıçrama arama. Temiz bir hamle günün tonunu değiştirir.',
  },
  {
    title: 'Kararsızlık da bedel keser.',
    body: 'Beklemek de bir seçim. Bugün beklemek yerine küçük ama net bir hamle aç.',
  },
  {
    title: 'Daha az seçenek, daha çok ivme.',
    body: 'Zihni yormak yerine çizgiyi daralt ve içeri gir.',
  },
  {
    title: 'İlhamdan önce execution gelir.',
    body: 'Hazır hissetmeyi bekleme. Temiz bir başlangıç çoğu düğümü çözer.',
  },
  {
    title: 'Kendine sert değil, net ol.',
    body: 'Bugün ihtiyacın olan şey baskı değil; görünür ilk adımdır.',
  },
  {
    title: 'Beden prime olunca zihin toparlanır.',
    body: 'Düşük enerji anında önce hedefi değil, zemini düzelt.',
  },
  {
    title: 'Doğru soru şu: Şimdi ne?',
    body: 'Yanlış soru şu: Bugün her şeyi nasıl çözerim?',
  },
  {
    title: 'Mikro hedefler küçümsenmez.',
    body: '72 saatlik net hedef, 90 günlük soyut niyetten daha çok geri dönüş üretir.',
  },
];
