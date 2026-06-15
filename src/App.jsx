import React, { useState, useEffect } from 'react';
import { BookOpen, Hand, HeartPulse, Home, Loader2, HeartHandshake, UserCircle2, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// --- Supabase Setup ---
const supabaseUrl = 'https://pryozvjbpvwlkfzambpi.supabase.co'; 
const supabaseKey = 'sb_publishable_QLyhq9BUIf1FNHAwGngCyQ_l53CC4Zx';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- نظام التحقق من المستخدم والتسجيل ---
  useEffect(() => {
    const checkUser = async () => {
      let deviceId = localStorage.getItem('mahmoud_device_id');
      
      if (!deviceId) {
        setIsLoading(false);
        return; 
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('device_id', deviceId)
          .single();

        if (data) {
          setUserData(data);
          setIsRegistered(true);
        } else {
          localStorage.removeItem('mahmoud_device_id');
        }
      } catch (err) {
        console.error("Error checking user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
        <LoadingSpinner text="جاري التحقق من البيانات..." />
      </div>
    );
  }

  if (!isRegistered) {
    return <RegistrationView onRegisterSuccess={(data) => {
      setUserData(data);
      setIsRegistered(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-teal-50 text-slate-800 font-sans selection:bg-teal-200" dir="rtl">
      <header className="bg-teal-700 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <HeartPulse className="w-6 h-6 ml-2 text-teal-200 animate-pulse" />
            <h1 className="text-xl font-bold">شفاء محمود صلاح</h1>
          </div>
          <div className="text-sm bg-teal-800 px-3 py-1 rounded-full text-teal-100 flex items-center shadow-inner">
            <UserCircle2 className="w-4 h-4 ml-1 opacity-70" />
            <span className="truncate max-w-[100px]">{userData?.nickname}</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-24 p-4 min-h-[calc(100vh-140px)] animate-fade-in">
        {currentPage === 'home' && <HomeView setCurrentPage={setCurrentPage} />}
        {currentPage === 'khatmah' && <KhatmahView />}
        {currentPage === 'tasbeeh' && <TasbeehView deviceId={userData.device_id} />}
        {currentPage === 'duas' && <DuasView />}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-teal-100 shadow-[0_-5px_15px_rgba(0,128,128,0.05)] z-20 pb-safe">
        <div className="max-w-md mx-auto flex justify-between px-2 py-2">
          <NavButton icon={<Home />} label="الرئيسية" isActive={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
          <NavButton icon={<BookOpen />} label="الختمة" isActive={currentPage === 'khatmah'} onClick={() => setCurrentPage('khatmah')} />
          <NavButton icon={<Hand />} label="التسبيح" isActive={currentPage === 'tasbeeh'} onClick={() => setCurrentPage('tasbeeh')} />
          <NavButton icon={<HeartHandshake />} label="الأدعية" isActive={currentPage === 'duas'} onClick={() => setCurrentPage('duas')} />
        </div>
      </nav>
    </div>
  );
}

// --- Views ---

function RegistrationView({ onRegisterSuccess }) {
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('الرجاء إدخال اسم مستعار للمشاركة.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const newDeviceId = uuidv4();

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .insert([{ device_id: newDeviceId, nickname: nickname.trim() }])
        .select()
        .single();

      if (dbError) throw dbError;

      localStorage.setItem('mahmoud_device_id', newDeviceId);
      onRegisterSuccess(data);

    } catch (err) {
      console.error("Registration error:", err);
      setError('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4 animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-lg border border-teal-100 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
        
        <HeartPulse className="w-20 h-20 text-teal-600 mx-auto mb-6 relative z-10 animate-pulse" />
        <h2 className="text-2xl font-bold text-teal-800 mb-2 relative z-10">صدقة جارية بنية الشفاء</h2>
        <h3 className="text-xl font-bold text-slate-700 mb-6 relative z-10">للأخ / محمود صلاح</h3>
        
        <p className="text-slate-600 leading-relaxed mb-8 relative z-10 text-sm">
          أهلاً بك في هذه الحملة المباركة. لحفظ تقدمك في الختمة وعداد التسبيح الخاص بك، يرجى إدخال اسم مستعار للبدء.
        </p>

        <form onSubmit={handleRegister} className="relative z-10">
          <div className="mb-6 text-right">
            <label className="block text-sm font-bold text-teal-800 mb-2">
              اسمك أو اسم مستعار
            </label>
            <input 
              type="text" 
              placeholder="مثال: فاعل خير، محب للخير..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 bg-teal-50/50"
              disabled={isSubmitting}
            />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-teal-700 active:scale-95 transition flex justify-center items-center"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span>البدء والمشاركة</span>
                <ArrowRight className="w-5 h-5 mr-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function HomeView({ setCurrentPage }) {
  return (
    <div className="flex flex-col space-y-6 mt-4">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-teal-100 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
        <HeartPulse className="w-16 h-16 text-teal-600 mx-auto mb-4 relative z-10" />
        <h2 className="text-2xl font-bold text-teal-800 mb-2 relative z-10">شاركنا الأجر</h2>
        <p className="text-slate-600 leading-relaxed mb-6 relative z-10">
          نسأل الله العظيم رب العرش العظيم أن يشفي محمود صلاح ويعافيه. 
          مشاركتك في الختمة أو التسبيح تُحفظ لك في ميزان حسناتك إن شاء الله.
        </p>
        
        <button 
          onClick={() => setCurrentPage('duas')}
          className="bg-teal-50 text-teal-700 border border-teal-200 px-6 py-2 rounded-full font-medium hover:bg-teal-100 transition relative z-10"
        >
          اقرأ أدعية الشفاء
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => setCurrentPage('khatmah')} className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow text-white flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
          <BookOpen className="w-10 h-10 mb-2 opacity-80" />
          <span className="font-bold">الختمة التشاركية</span>
        </div>
        <div onClick={() => setCurrentPage('tasbeeh')} className="bg-gradient-to-br from-teal-600 to-cyan-600 p-4 rounded-2xl shadow text-white flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
          <Hand className="w-10 h-10 mb-2 opacity-80" />
          <span className="font-bold">عداد التسبيح</span>
        </div>
      </div>
    </div>
  );
}

function KhatmahView() {
  const [myPageNumber, setMyPageNumber] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const reservePage = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('khatmah_state')
        .select('current_page')
        .eq('id', 1)
        .single();

      // التحقق مما إذا كان الجدول فارغاً
      if (error) {
        console.error("Supabase Error:", error);
        setErrorMsg('حدث خطأ أثناء الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.');
        throw error;
      }

      let nextTargetPage = data.current_page + 1;
      if (nextTargetPage > 604) nextTargetPage = 1;

      await supabase
        .from('khatmah_state')
        .update({ current_page: nextTargetPage })
        .eq('id', 1);

      const pageToRead = nextTargetPage === 1 ? 604 : nextTargetPage - 1;
      setMyPageNumber(pageToRead);
      fetchQuranPage(pageToRead);

    } catch (error) {
      console.error("Error reserving page:", error);
      setLoading(false);
    }
  };

  const fetchQuranPage = async (pageNumber) => {
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
      const data = await response.json();
      if (data.code === 200) {
        setPageData(data.data);
      }
    } catch (error) {
      console.error("Error fetching Quran page:", error);
      setErrorMsg('حدث خطأ أثناء جلب آيات القرآن. تأكد من اتصالك بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-teal-800 mb-2">تقبل الله منك</h2>
        <p className="text-slate-600 mb-8">تم تسجيل قراءتك. نسأل الله أن يجعلها في ميزان حسناتك وسبباً في شفاء محمود.</p>
        <button onClick={() => { setCompleted(false); setMyPageNumber(null); }} className="text-teal-600 font-bold underline">
          قراءة صفحة أخرى
        </button>
      </div>
    );
  }

  if (!myPageNumber) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <BookOpen className="w-20 h-20 text-teal-200 mb-4" />
        <h2 className="text-xl font-bold text-teal-800 mb-4">الختمة التشاركية للشفاء</h2>
        <p className="text-slate-600 mb-8 text-sm px-4">
          اضغط على الزر بالأسفل ليتم تخصيص صفحة من القرآن الكريم لك لتقرأها بنية شفاء محمود صلاح.
        </p>
        
        {errorMsg && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{errorMsg}</p>}

        <button 
          onClick={reservePage}
          disabled={loading}
          className="bg-teal-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-teal-700 flex items-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'احجز صفحة للقراءة'}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-4 bg-teal-100 p-3 rounded-xl text-teal-800 font-bold">
        <span>صفحة رقم: {myPageNumber}</span>
        {pageData && <span className="text-sm">سورة {pageData.ayahs[0].surah.name}</span>}
      </div>

      {loading || !pageData ? (
        <LoadingSpinner text="جاري جلب الآيات..." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6 mb-6">
          <div className="text-justify leading-[3.5rem] text-2xl font-serif text-slate-800" dir="rtl">
            {pageData.ayahs.map((ayah) => (
              <span key={ayah.number}>
                {ayah.text}
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-teal-300 text-teal-700 text-[14px] mx-2 bg-teal-50 font-sans">
                  {ayah.numberInSurah}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {!loading && pageData && (
        <button 
          onClick={() => setCompleted(true)}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-emerald-700 transition"
        >
          أتممت القراءة بحمد الله
        </button>
      )}
    </div>
  );
}

function TasbeehView({ deviceId }) {
  const dhikrOptions = [
    { id: 'istighfar', title: 'استغفار', label: 'أستغفر الله العظيم' },
    { id: 'salawat', title: 'صلاة على النبي', label: 'اللهم صل وسلم على نبينا محمد' },
    { id: 'tasbeeh', title: 'تسبيح', label: 'سبحان الله وبحمده' },
    { id: 'hawqala', title: 'حوقلة', label: 'لا حول ولا قوة إلا بالله' },
    { id: 'dua', title: 'دعاء الشفاء', label: 'اللهم اشفِ محمود صلاح شفاءً لا يغادر سقماً' },
  ];

  const [selectedType, setSelectedType] = useState(dhikrOptions[0]);
  const [globalCounts, setGlobalCounts] = useState({});
  const [localCounts, setLocalCounts] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  // جلب العدادات (العالمية والشخصية) من قاعدة البيانات
  useEffect(() => {
    const fetchCounts = async () => {
      // 1. جلب العدادات العالمية
      const { data: globalData } = await supabase.from('tasbeeh_counters').select('*');
      if (globalData) {
        const countsObj = {};
        globalData.forEach(item => countsObj[item.id] = item.count);
        setGlobalCounts(countsObj);
        setDbReady(true);
      }

      // 2. جلب العدادات الشخصية لهذا المستخدم
      if (deviceId) {
        const { data: userCountsData } = await supabase
          .from('user_tasbeeh_counts')
          .select('*')
          .eq('device_id', deviceId);
          
        if (userCountsData) {
          const userCountsObj = {};
          userCountsData.forEach(item => userCountsObj[item.dhikr_id] = item.count);
          setLocalCounts(userCountsObj);
        }
      }
    };

    fetchCounts();

    // الاستماع للتحديثات العالمية
    const subscription = supabase
      .channel('public:tasbeeh_counters')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasbeeh_counters' }, payload => {
        setGlobalCounts(prev => ({
          ...prev,
          [payload.new.id]: payload.new.count
        }));
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [deviceId]);

  const handleTasbeeh = async () => {
    if (!dbReady) return; // منع الضغط قبل تحميل البيانات

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);

    // الحسابات
    const currentLocalCount = localCounts[selectedType.id] || 0;
    const newLocalCount = currentLocalCount + 1;
    const currentGlobalCount = globalCounts[selectedType.id] || 0;
    const newGlobalCount = currentGlobalCount + 1;

    // 1. تحديث الواجهة فوراً للتجاوب السريع
    setLocalCounts(prev => ({ ...prev, [selectedType.id]: newLocalCount }));
    setGlobalCounts(prev => ({ ...prev, [selectedType.id]: newGlobalCount }));

    // 2. تحديث قاعدة البيانات
    try {
      // التحديث العالمي (باستخدام رقم محدد لضمان عدم حدوث تضارب كبير)
      await supabase
        .from('tasbeeh_counters')
        .update({ count: newGlobalCount })
        .eq('id', selectedType.id);

      // التحديث الشخصي
      if (deviceId) {
        const { error } = await supabase
          .from('user_tasbeeh_counts')
          .upsert({ 
            device_id: deviceId, 
            dhikr_id: selectedType.id, 
            count: newLocalCount 
          }, { onConflict: 'device_id, dhikr_id' });
          
          if(error) console.error("Upsert error:", error);
      }
    } catch (err) {
      console.error("Error updating counter in DB:", err);
    }
  };

  return (
    <div className="flex flex-col items-center mt-2">
      <div className="w-full overflow-x-auto pb-4 mb-4 hide-scrollbar">
        <div className="flex space-x-2 space-x-reverse px-2">
          {dhikrOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedType(opt)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-medium transition-all ${
                selectedType.id === opt.id 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'bg-white text-teal-700 border border-teal-200'
              }`}
            >
              {opt.title}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-teal-100 mb-8 text-center relative overflow-hidden">
        <h3 className="text-sm text-slate-500 font-medium mb-1">إجمالي التشاركات ({selectedType.title})</h3>
        <div className="text-4xl font-bold text-teal-700 tracking-wider font-mono">
          {!dbReady ? '...' : (globalCounts[selectedType.id] || 0).toLocaleString('ar-EG')}
        </div>
      </div>

      <div className="text-center mb-10 w-full">
        <p className="text-xl font-bold text-teal-900 mb-6 h-14 flex items-center justify-center leading-relaxed">
          {selectedType.label}
        </p>
        
        <button 
          onClick={handleTasbeeh}
          disabled={!dbReady}
          className={`w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg flex flex-col items-center justify-center transition-transform ${isAnimating ? 'scale-95' : 'scale-100'} ${!dbReady ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <span className="text-6xl font-bold mb-2 drop-shadow-md">
            {localCounts[selectedType.id] || 0}
          </span>
          <span className="text-teal-100 text-sm font-medium">تسبيحك الشخصي المحفوظ</span>
        </button>
      </div>
    </div>
  );
}

function DuasView() {
    const duas = [
      {
        category: "أدعية الشفاء العام لمحمود",
        items: [
          "اللهم اشفِ محمود صلاح شفاءً ليس بعده سقم أبداً، اللهم خذ بيده، اللهم احرسه بعينيك التي لا تنام.",
          "اللهم يا مسهل الشديد، ويا ملين الحديد، أخرج محمود صلاح من حلق الضيق إلى أوسع الطريق.",
          "اللهم ألبس محمود صلاح ثوب الصحة والعافية عاجلاً غير آجل يا أرحم الراحمين.",
        ]
      },
      {
        category: "أدعية خاصة لحالات الإغماء والصرع",
        items: [
          "اللهم رد إلى محمود صلاح وعيه، وأيقظه من غفلته سالماً معافى، اللهم لا تريه مكروهاً في جسده ولا عقله.",
          "بسم الله أرقيك يا محمود من كل شيء يؤذيك، من شر كل نفس أو عين حاسد، الله يشفيك.",
          "اللهم إن محمود صلاح في ودائعك، فاحفظ عليه عقله وروحه وجسده، واصرف عنه نوبات المرض والصرع، واجعله في حصنك الحصين.",
          "يا حي يا قيوم برحمتك نستغيث، أصلح لمحمود شأنه كله ولا تكله إلى نفسه طرفة عين، ورد إليه وعيه وإدراكه التام."
        ]
      },
      {
        category: "أدعية لرفع أثر الحوادث والإصابات",
        items: [
          "اللهم اجعل ما أصاب محمود صلاح في هذا الحادث برداً وسلاماً عليه كما جعلت النار برداً وسلاماً على إبراهيم.",
          "اللهم اجبر كسر محمود صلاح، وضمد جراحه، وسكن ألمه، وارفع عنه البلاء، واجعل ما ألمّ به تكفيراً لسيئاته ورفعة في درجاته.",
          "اللهم إنا نسألك من عظيم لطفك، وكرمك، وسترك الجميل، أن تشفي محمود صلاح وتمده بالصحة والعافية بعد هذا الحادث."
        ]
      }
    ];
  
    return (
      <div className="pb-10">
        <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">أدعية الشفاء</h2>
        
        {duas.map((section, idx) => (
          <div key={idx} className="mb-8">
            <h3 className="text-lg font-bold text-emerald-700 mb-3 border-b-2 border-emerald-100 pb-2 inline-block">
              {section.category}
            </h3>
            <div className="space-y-3">
              {section.items.map((dua, dIdx) => (
                <div key={dIdx} className="bg-white p-4 rounded-xl shadow-sm border border-teal-50 relative">
                  <div className="absolute top-4 right-4 text-teal-200">
                    <HeartHandshake className="w-6 h-6 opacity-50" />
                  </div>
                  <p className="text-slate-700 leading-relaxed text-lg pr-8 text-justify font-serif">
                    {dua}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="bg-teal-600 text-white p-4 rounded-xl text-center shadow-md">
          <p className="font-bold mb-1">أَمَّن يُجِيبُ الْمُضْطَرَّ إِذَا دَعَاهُ وَيَكْشِفُ السُّوءَ</p>
          <p className="text-sm text-teal-100">لا تنسوا محمود من خالص دعائكم في أوقات الإجابة.</p>
        </div>
      </div>
    );
  }

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-20 py-2 transition-colors relative ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-teal-500'}`}
    >
      {isActive && <div className="absolute top-0 w-8 h-1 bg-teal-500 rounded-b-full"></div>}
      <div className={`mb-1 ${isActive ? 'scale-110 transition-transform' : ''}`}>
        {icon}
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function LoadingSpinner({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-teal-600">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="font-medium">{text}</p>
    </div>
  );
}