import React, { useState, useEffect } from 'react';
import { BookOpen, Hand, Home, Loader2, HeartHandshake, UserCircle2, ArrowRight, Moon, Sun, Menu, X, Users, ShieldCheck, MessageSquareHeart } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// ==========================================
// 1. إعدادات قاعدة البيانات (Supabase Setup)
// ==========================================
const supabaseUrl = 'https://pryozvjbpvwlkfzambpi.supabase.co'; 
const supabaseKey = 'sb_publishable_QLyhq9BUIf1FNHAwGngCyQ_l53CC4Zx';
const supabase = createClient(supabaseUrl, supabaseKey);


// ==========================================
// 2. المكون الرئيسي للتطبيق (Main App Component)
// ==========================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(1);

  // المتواجدون الآن (Live Presence)
  useEffect(() => {
    if (!userData) return;
    const room = supabase.channel('online-users');
    room.on('presence', { event: 'sync' }, () => {
      const state = room.presenceState();
      setOnlineUsers(Object.keys(state).length || 1);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await room.track({ online_at: new Date().toISOString() });
      }
    });
    return () => { room.unsubscribe(); };
  }, [userData]);

  // تطبيق الوضع المظلم
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // التحقق من المستخدم
  useEffect(() => {
    const checkUser = async () => {
      let deviceId = localStorage.getItem('mahmoud_device_id');
      if (!deviceId) {
        setIsLoading(false);
        return; 
      }
      try {
        const { data, error } = await supabase.from('users').select('*').eq('device_id', deviceId).single();
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
    return <div className="min-h-screen bg-teal-50 dark:bg-slate-900 flex items-center justify-center"><LoadingSpinner text="جاري التحقق..." /></div>;
  }

  if (!isRegistered) {
    return <RegistrationView onRegisterSuccess={(data) => { setUserData(data); setIsRegistered(true); }} />;
  }

  return (
    <div className={`min-h-screen text-slate-800 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-teal-50'}`} dir="rtl">
      
      {/* الهيدر العلوي */}
      <header className={`shadow-md sticky top-0 z-30 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 text-teal-400' : 'bg-teal-700 text-white'}`}>
        <div className={`text-center text-[10px] py-1 font-bold tracking-wider ${isDarkMode ? 'bg-slate-900 text-teal-500' : 'bg-teal-600 text-white'}`}>
          <Users className="w-3 h-3 inline-block ml-1" /> يتواجد الآن للمشاركة بالدعاء: {onlineUsers}
        </div>
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-teal-200/50 bg-teal-100 flex-shrink-0">
                <img src="/mahmoud.jpg" alt="محمود صلاح" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=M&backgroundColor=0d9488'; }} />
              </div>
              <h1 className="text-lg font-bold truncate">شفاء محمود</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5 text-teal-300" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className={`text-xs px-2 py-1 rounded-full flex items-center shadow-inner max-w-[80px] ${isDarkMode ? 'bg-slate-700 text-teal-300' : 'bg-teal-800 text-teal-100'}`}>
              <UserCircle2 className="w-3 h-3 ml-1 opacity-70" />
              <span className="truncate">{userData?.nickname}</span>
            </div>
          </div>
        </div>
      </header>

      {/* القائمة الجانبية */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>}
      <div className={`fixed top-0 right-0 h-full w-64 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-slate-800 border-l border-slate-700' : 'bg-white'}`}>
        <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-700' : 'border-teal-100'}`}>
          <h2 className={`font-bold text-lg ${isDarkMode ? 'text-teal-400' : 'text-teal-800'}`}>القائمة الرئيسية</h2>
          <button onClick={() => setIsSidebarOpen(false)} className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-teal-50 text-slate-500'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <SidebarLink icon={<Home/>} label="الرئيسية" onClick={() => {setCurrentPage('home'); setIsSidebarOpen(false);}} active={currentPage === 'home'} isDark={isDarkMode}/>
          <SidebarLink icon={<BookOpen/>} label="الختمة التشاركية" onClick={() => {setCurrentPage('khatmah'); setIsSidebarOpen(false);}} active={currentPage === 'khatmah'} isDark={isDarkMode}/>
          <SidebarLink icon={<Hand/>} label="عداد التسبيح" onClick={() => {setCurrentPage('tasbeeh'); setIsSidebarOpen(false);}} active={currentPage === 'tasbeeh'} isDark={isDarkMode}/>
          <SidebarLink icon={<ShieldCheck/>} label="الرقية الشرعية" onClick={() => {setCurrentPage('ruqyah'); setIsSidebarOpen(false);}} active={currentPage === 'ruqyah'} isDark={isDarkMode}/>
          <SidebarLink icon={<MessageSquareHeart/>} label="حائط الدعاء" onClick={() => {setCurrentPage('guestbook'); setIsSidebarOpen(false);}} active={currentPage === 'guestbook'} isDark={isDarkMode}/>
          <SidebarLink icon={<HeartHandshake/>} label="أدعية الشفاء" onClick={() => {setCurrentPage('duas'); setIsSidebarOpen(false);}} active={currentPage === 'duas'} isDark={isDarkMode}/>
        </div>
      </div>

      {/* منطقة العرض الرئيسية */}
      <main className="max-w-md mx-auto pb-24 p-4 min-h-[calc(100vh-140px)] animate-fade-in">
        {currentPage === 'home' && <HomeView setCurrentPage={setCurrentPage} isDark={isDarkMode} />}
        {currentPage === 'khatmah' && <KhatmahView deviceId={userData.device_id} isDark={isDarkMode} />}
        {currentPage === 'tasbeeh' && <TasbeehView deviceId={userData.device_id} isDark={isDarkMode} />}
        {currentPage === 'duas' && <DuasView isDark={isDarkMode} />}
        {currentPage === 'ruqyah' && <RuqyahView isDark={isDarkMode} />}
        {currentPage === 'guestbook' && <GuestbookView userData={userData} isDark={isDarkMode} />}
      </main>

      {/* شريط التنقل السفلي */}
      <nav className={`fixed bottom-0 w-full border-t shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20 pb-safe transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-100'}`}>
        <div className="max-w-md mx-auto flex justify-between px-2 py-2">
          <NavButton icon={<Home />} label="الرئيسية" isActive={currentPage === 'home'} onClick={() => setCurrentPage('home')} isDark={isDarkMode} />
          <NavButton icon={<BookOpen />} label="الختمة" isActive={currentPage === 'khatmah'} onClick={() => setCurrentPage('khatmah')} isDark={isDarkMode} />
          <NavButton icon={<Hand />} label="التسبيح" isActive={currentPage === 'tasbeeh'} onClick={() => setCurrentPage('tasbeeh')} isDark={isDarkMode} />
          <NavButton icon={<MessageSquareHeart />} label="الدعاء" isActive={currentPage === 'guestbook'} onClick={() => setCurrentPage('guestbook')} isDark={isDarkMode} />
        </div>
      </nav>
    </div>
  );
}

// ==========================================
// 3. شاشة التسجيل (RegistrationView)
// ==========================================
function RegistrationView({ onRegisterSuccess }) {
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) { setError('الرجاء إدخال اسم مستعار للمشاركة.'); return; }
    setIsSubmitting(true); setError('');
    const newDeviceId = uuidv4();
    try {
      const { data, error: dbError } = await supabase.from('users').insert([{ device_id: newDeviceId, nickname: nickname.trim() }]).select().single();
      if (dbError) throw dbError;
      localStorage.setItem('mahmoud_device_id', newDeviceId);
      onRegisterSuccess(data);
    } catch (err) {
      setError('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-teal-100 shadow-md">
           <img src="/mahmoud.jpg" alt="محمود" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=M&backgroundColor=0d9488'; }} />
        </div>
        <h2 className="text-2xl font-bold text-teal-800 mb-2">بنية الشفاء العاجل</h2>
        <h3 className="text-xl font-bold text-slate-700 mb-6">لحبيبنا / محمود صلاح</h3>
        <p className="text-slate-600 mb-8 text-sm">أهلاً بك. لحفظ تقدمك في الختمة وعداد التسبيح، يرجى إدخال اسم للبدء.</p>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="اسمك أو اسم مستعار..." value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full px-4 py-3 mb-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-500 bg-teal-50/50 outline-none text-right" disabled={isSubmitting} />
          {error && <p className="text-red-500 text-xs mb-4 text-right">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 flex justify-center items-center gap-2 transition-colors">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>الدخول للتطبيق</span><ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. الشاشة الرئيسية (HomeView)
// ==========================================
function HomeView({ setCurrentPage, isDark }) {
  const shareOnWhatsApp = () => {
    const text = "شاركنا الأجر في ختمة القرآن الكريم وتسبيح بنية الشفاء العاجل للأخ محمود صلاح. اضغط هنا للمشاركة: " + window.location.href;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="flex flex-col space-y-6 mt-4">
      <div className={`p-6 rounded-3xl shadow-sm border text-center relative overflow-hidden transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-100'}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-40 pointer-events-none ${isDark ? 'bg-teal-900' : 'bg-teal-50'}`}></div>
        
        <div className="w-50 h-50 mx-auto mb-4 rounded-full overflow-hidden border-4 shadow-md relative z-10" style={{ borderColor: isDark ? '#0f766e' : '#ccfbf1' }}>
           <img src="/mahmoud.jpg" alt="محمود" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=M&backgroundColor=0d9488'; }} />
        </div>
        
        <h2 className={`text-2xl font-bold mb-2 relative z-10 ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>شاركنا الأجر</h2>
        <p className={`leading-relaxed mb-6 relative z-10 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          نسأل الله العظيم رب العرش العظيم أن يشفي محمود صلاح ويعافيه. 
          مشاركتك تُحفظ لك في ميزان حسناتك إن شاء الله.
        </p>
        
        <div className="flex flex-col gap-3 relative z-10">
          <button onClick={() => setCurrentPage('duas')} className={`px-6 py-2 rounded-full font-medium transition ${isDark ? 'bg-slate-700 text-teal-300 hover:bg-slate-600 border border-slate-600' : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'}`}>
            اقرأ أدعية الشفاء
          </button>
          
          <button onClick={shareOnWhatsApp} className="px-6 py-2 rounded-full font-bold transition bg-teal-600 text-white hover:bg-teal-700 shadow-md flex items-center justify-center gap-2">
            <HeartHandshake className="w-5 h-5" /> مشاركة على واتساب
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => setCurrentPage('khatmah')} className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
          <BookOpen className="w-10 h-10 mb-2 opacity-90" />
          <span className="font-bold">الختمة</span>
        </div>
        <div onClick={() => setCurrentPage('tasbeeh')} className="bg-gradient-to-br from-teal-600 to-cyan-600 p-4 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
          <Hand className="w-10 h-10 mb-2 opacity-90" />
          <span className="font-bold">التسبيح</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. شاشة الختمة (KhatmahView)
// ==========================================
function KhatmahView({ deviceId, isDark }) {
  const [myPageNumber, setMyPageNumber] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [khatmahInfo, setKhatmahInfo] = useState({ number: 1, userPagesRead: 0 });
  const [globalCurrentPage, setGlobalCurrentPage] = useState(1); 

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedCount = localStorage.getItem('mahmoud_user_pages_read') || '0';
      setKhatmahInfo(prev => ({ ...prev, userPagesRead: parseInt(savedCount) }));

      try {
        const { data, error } = await supabase.from('khatmah_state').select('*').eq('id', 1).single();
        if (!error && data) {
          setGlobalCurrentPage(data.current_page);
          setKhatmahInfo(prev => ({ ...prev, number: data.khatmah_number || 1 }));
        }
      } catch (err) {
        console.error("Error fetching initial khatmah state:", err);
      }
    };
    fetchInitialData();
  }, []);

  const reservePage = async () => {
    setLoading(true); setErrorMsg('');
    try {
      // التنفيذ الآن في حركة واحدة (Atomic) عبر دالة RPC التي أنشأتها
      const { data, error } = await supabase.rpc('reserve_next_khatmah_page');
      if (error) throw error;

      const pageToRead = data.assigned_page;
      const currentKhatmahNum = data.khatmah_number;

      setMyPageNumber(pageToRead);
      setGlobalCurrentPage(pageToRead === 604 ? 1 : pageToRead + 1); 
      setKhatmahInfo(prev => ({ ...prev, number: currentKhatmahNum }));
      
      fetchQuranPage(pageToRead);
    } catch (error) {
      console.error("Error reserving page:", error);
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuranPage = async (pageNumber) => {
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
      const data = await response.json();
      if (data.code === 200) setPageData(data.data);
    } catch (error) {
      setErrorMsg('خطأ في جلب الآيات.');
    } finally { setLoading(false); }
  };

  const handleComplete = () => {
    const newCount = khatmahInfo.userPagesRead + 1;
    setKhatmahInfo(prev => ({ ...prev, userPagesRead: newCount }));
    localStorage.setItem('mahmoud_user_pages_read', newCount.toString());

    if (myPageNumber === 604) {
      setShowCelebration(true);
    } else {
      setCompleted(true);
    }
  };

  if (showCelebration) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in">
        <div className="w-32 h-32 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-teal-200">
          <BookOpen className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-teal-600">الله أكبر ولله الحمد!</h2>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>تم إكمال الختمة رقم {khatmahInfo.number}</h3>
        <p className={`mb-8 px-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          بفضلك وبفضل المشاركين، أتممنا ختمة كاملة للقرآن الكريم بنية الشفاء العاجل لمحمود صلاح. نسأل الله القبول.
        </p>
        <button onClick={() => { setShowCelebration(false); setCompleted(false); setMyPageNumber(null); }} className="bg-teal-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-teal-700">
          البدء في ختمة جديدة
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"><BookOpen className="w-12 h-12" /></div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>تقبل الله منك</h2>
        <p className={`mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>تم تسجيل قراءتك بنجاح.</p>
        <button onClick={() => { setCompleted(false); setMyPageNumber(null); }} className="text-emerald-500 font-bold underline">قراءة صفحة أخرى</button>
      </div>
    );
  }

  if (!myPageNumber) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <BookOpen className={`w-20 h-20 mb-4 ${isDark ? 'text-teal-700' : 'text-teal-200'}`} />
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>الختمة التشاركية</h2>
        
        <div className={`mb-6 p-4 rounded-xl text-sm border inline-block min-w-[200px] ${isDark ? 'bg-slate-800 border-slate-700 text-teal-300' : 'bg-teal-50 border-teal-100 text-teal-800'}`}>
           <p className="font-bold mb-2 border-b border-current/20 pb-2">
             الختمة الحالية: <span className="text-lg text-teal-500">رقم {khatmahInfo.number}</span>
             <br/>
             <span className="text-xs opacity-80">وصلنا للصفحة: {globalCurrentPage}</span>
           </p>
           <p className="font-bold">إجمالي ما قرأته أنت: <span className="text-lg text-emerald-500">{khatmahInfo.userPagesRead}</span> صفحة</p>
        </div>

        <p className={`mb-8 text-sm px-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>اضغط لحجز صفحة تقرأها بنية الشفاء.</p>
        {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
        <button onClick={reservePage} disabled={loading} className="bg-teal-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-teal-700 w-full max-w-xs flex justify-center h-14 items-center transition-colors">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'احجز صفحة'}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className={`flex flex-col gap-2 mb-4 p-3 rounded-xl font-bold text-sm border ${isDark ? 'bg-slate-800 border-slate-700 text-teal-300' : 'bg-teal-100 border-teal-200 text-teal-800'}`}>
        <div className="flex justify-between items-center border-b pb-2 border-current/20">
           <span>الختمة رقم: <span className="text-teal-500">{khatmahInfo.number}</span></span>
           <span>الصفحة: {myPageNumber}</span>
        </div>
        <div className="flex justify-between items-center pt-1">
           <span className="opacity-80 font-normal">قرأت: {khatmahInfo.userPagesRead} صفحة</span>
           {pageData && <span>سورة {pageData.ayahs[0].surah.name}</span>}
        </div>
      </div>

      {loading || !pageData ? (
        <LoadingSpinner text="جاري جلب الآيات..." />
      ) : (
        <div className={`rounded-xl shadow-sm border p-6 mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-100'}`}>
          <div className={`text-justify leading-[3.5rem] text-2xl font-serif ${isDark ? 'text-slate-200' : 'text-slate-800'}`} dir="rtl">
            {pageData.ayahs.map((ayah) => (
              <span key={ayah.number}>
                {ayah.text}
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-[14px] mx-2 font-sans ${isDark ? 'bg-slate-700 border-slate-600 text-teal-400' : 'bg-teal-50 border-teal-300 text-teal-700'}`}>
                  {ayah.numberInSurah}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {!loading && pageData && (
        <button onClick={handleComplete} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-emerald-700 transition-colors">
          أتممت القراءة بحمد الله
        </button>
      )}
    </div>
  );
}

// ==========================================
// 6. شاشة التسبيح (TasbeehView)
// ==========================================
function TasbeehView({ deviceId, isDark }) {
  const dhikrOptions = [
    { id: 'tasbeeh', title: 'تسبيح', label: 'سبحان الله وبحمده سبحان الله العظيم' },
    { id: 'istighfar', title: 'استغفار', label: 'أستغفر الله العظيم' },
    { id: 'salawat', title: 'صلاة على النبي', label: 'اللهم صل على محمد، وعلى آل محمد، كما صليت على إبراهيم، وعلى آل إبراهيم، إنك حميد مجيد، اللهم بارك على محمد، وعلى آل محمد، كما باركت على إبراهيم، وعلى آل إبراهيم، إنك حميد مجيد' },
    { id: 'hawqala', title: 'حوقلة', label: 'لا حول ولا قوة إلا بالله' },
    { id: 'dua', title: 'دعاء الشفاء', label: 'اللهم اشفِ محمود صلاح شفاء لا يغادر سقما' },
    { id: 'azkar', title: 'اذكار', label: 'سبحان الله والحمد لله ولا اله الا الله وحده لا شريك له الملك وله الحمد وهو على كل شيء قدير' },
  ];

  const [selectedType, setSelectedType] = useState(dhikrOptions[0]);
  const [globalCounts, setGlobalCounts] = useState({});
  const [localCounts, setLocalCounts] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data: globalData } = await supabase.from('tasbeeh_counters').select('*');
      if (globalData) {
        const countsObj = {}; globalData.forEach(item => countsObj[item.id] = item.count);
        setGlobalCounts(countsObj); setDbReady(true);
      }
      if (deviceId) {
        const { data: userCountsData } = await supabase.from('user_tasbeeh_counts').select('*').eq('device_id', deviceId);
        if (userCountsData) {
          const userCountsObj = {}; userCountsData.forEach(item => userCountsObj[item.dhikr_id] = item.count);
          setLocalCounts(userCountsObj);
        }
      }
    };
    fetchCounts();
    const subscription = supabase.channel('public:tasbeeh_counters').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasbeeh_counters' }, payload => {
        setGlobalCounts(prev => ({ ...prev, [payload.new.id]: payload.new.count }));
    }).subscribe();
    return () => supabase.removeChannel(subscription);
  }, [deviceId]);

  const handleTasbeeh = async () => {
    if (!dbReady) return;
    setIsAnimating(true); setTimeout(() => setIsAnimating(false), 150);
    
    // التحديث المحلي
    const newLocalCount = (localCounts[selectedType.id] || 0) + 1;
    setLocalCounts(prev => ({ ...prev, [selectedType.id]: newLocalCount }));
    
    try {
      // استلام الرقم الحقيقي من الخادم عبر دالة RPC الخاصة بك
      const { data: realGlobalCount, error } = await supabase.rpc('increment_tasbeeh_count', { dhikr_id: selectedType.id });
      
      if (!error && realGlobalCount) {
         setGlobalCounts(prev => ({ ...prev, [selectedType.id]: realGlobalCount }));
      }

      if (deviceId) {
        await supabase.from('user_tasbeeh_counts').upsert({ device_id: deviceId, dhikr_id: selectedType.id, count: newLocalCount }, { onConflict: 'device_id, dhikr_id' });
      }
    } catch (err) { 
      console.error("Error updating tasbeeh:", err);
    }
  };

  return (
    <div className="flex flex-col items-center mt-2">
      <div className="w-full overflow-x-auto pb-4 mb-4 hide-scrollbar">
        <div className="flex space-x-2 space-x-reverse px-2">
          {dhikrOptions.map((opt) => (
            <button key={opt.id} onClick={() => setSelectedType(opt)} 
              className={`whitespace-nowrap px-5 py-2 rounded-full font-medium transition-colors border ${
                selectedType.id === opt.id 
                  ? 'bg-teal-600 text-white border-teal-600' 
                  : isDark ? 'bg-slate-800 text-teal-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'
              }`}>
              {opt.title}
            </button>
          ))}
        </div>
      </div>

      <div className={`w-full rounded-2xl p-6 shadow-sm border mb-8 text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-100'}`}>
        <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي التشاركات ({selectedType.title})</h3>
        <div className={`text-4xl font-bold tracking-wider font-mono ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
          {!dbReady ? '...' : (globalCounts[selectedType.id] || 0).toLocaleString('ar-EG')}
        </div>
      </div>

      <div className="text-center mb-10 w-full">
        <p className={`text-xl font-bold mb-15 h-20 flex items-center justify-center leading-relaxed ${isDark ? 'text-slate-200' : 'text-teal-900'}`}>
          {selectedType.label}
        </p>
        <button onClick={handleTasbeeh} disabled={!dbReady} className={`w-50 h-50 mx-auto rounded-full text-white shadow-lg flex flex-col items-center justify-center transition-transform ${isAnimating ? 'scale-95' : 'scale-100'} ${!dbReady ? 'opacity-70 cursor-not-allowed' : ''} ${isDark ? 'bg-gradient-to-br from-teal-600 to-slate-900 border border-teal-600/30' : 'bg-gradient-to-br from-teal-600 to-slate-600'}`} style={{ WebkitTapHighlightColor: 'transparent' }}>
          <span className="text-6xl font-bold mb-2">{localCounts[selectedType.id] || 0}</span>
          <span className={`text-sm font-medium ${isDark ? 'text-teal-200' : 'text-teal-200'}`}>تسبيحك المحفوظ</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 7. شاشة حائط الدعاء (GuestbookView)
// ==========================================
function GuestbookView({ userData, isDark }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from('guestbook_messages').select('*').order('created_at', { ascending: false }).limit(50);
      if (data) setMessages(data);
    };
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsSubmitting(true);
    
    const msg = { nickname: userData.nickname, message: newMessage.trim() };
    try {
      await supabase.from('guestbook_messages').insert([msg]);
      setMessages([msg, ...messages]);
      setNewMessage('');
    } catch(err) {}
    setIsSubmitting(false);
  };

  return (
    <div className="pb-10">
      <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>مشاركة الدعاء</h2>
      
      <form onSubmit={handleSubmit} className={`mb-8 p-4 rounded-xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-100'}`}>
        <textarea 
          value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب دعوة من قلبك لمحمود..."
          className={`w-full p-3 rounded-lg border outline-none mb-3 resize-none h-24 ${isDark ? 'bg-slate-900 border-slate-600 text-slate-200 focus:border-teal-500' : 'bg-teal-50/50 border-teal-200 text-slate-700 focus:border-teal-500'}`}
        ></textarea>
        <button disabled={isSubmitting} type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition-colors">
          {isSubmitting ? 'جاري الإرسال...' : 'أرسل الدعاء'}
        </button>
      </form>

      <div className="space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-50 shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareHeart className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              {/* هنا التعديل: إزالة opacity-70 واستخدام ألوان واضحة */}
              <span className={`font-bold text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                {msg.nickname}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 8. شاشة الأدعية (DuasView)
// ==========================================
function DuasView({ isDark }) {
  const duas = [
    { category: "فضل الدعاء", items: [
      "عن أبي هريرة قال: قال رسول الله صلى الله عليه وسلم: ((رُبَّ أشعثَ أغبَرَ مدفوعٍ بالأبواب، لو أقسَمَ على الله لَأَبَرَّهُ))؛ رواه مسلم.",
      "استجابة الدعاء بظهر الغيب: دعوة المسلم لأخيه بظهر الغيب مستجابة، ويُصاحبها تأمين من الملائكة."
    ]},
    { category: "أدعية الشفاء العام", items: [
        "اللهم اشفِ محمود صلاح شفاءً ليس بعده سقم أبداً، اللهم خذ بيده.",
        "اللهم إنا نسألك بأسمائك الحسنى وصفاتك العلا وبرحمتك التي وسعت كّل شيء، أن تمّن عليه بالشفاء العاجل."
    ]},
    { category: "لحالات الإغماء والصرع", items: [
        "اللهم رد إلى محمود وعيه، وأيقظه من غفلته سالماً معافى.",
        "اللهم يا حي يا قيوم، يا من تعيد للمريض صحته، ردّ إلى محمود صلاح وعيه وعافيته سريعاً، واشفه شفاءً لا يغادر سقماً."
    ]}
  ];

  return (
    <div className="pb-10">
      <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>أدعية الشفاء</h2>
      {duas.map((section, idx) => (
        <div key={idx} className="mb-8">
          <h3 className={`text-lg font-bold mb-3 border-b-2 pb-2 inline-block ${isDark ? 'text-teal-500 border-teal-900' : 'text-emerald-700 border-emerald-100'}`}>
            {section.category}
          </h3>
          <div className="space-y-3">
            {section.items.map((dua, dIdx) => (
              <div key={dIdx} className={`p-4 rounded-xl shadow-sm border relative ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-50'}`}>
                <HeartHandshake className={`absolute top-4 right-4 w-6 h-6 opacity-30 ${isDark ? 'text-teal-500' : 'text-teal-300'}`} />
                <p className={`leading-relaxed text-lg pr-8 text-justify font-serif ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{dua}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 9. شاشة الرقية الشرعية (RuqyahView)
// ==========================================
function RuqyahView({ isDark }) {
  const ruqyah = [
    "الفاتحة (7 مرات): بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ...",
    "آية الكرسي: اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
    "أواخر سورة البقرة: آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ...",
    "الإخلاص والمعوذتين (3 مرات).",
    "بسم الله أرقيك من كل شيء يؤذيك، من شر كل نفس أو عين حاسد الله يشفيك."
  ];

  return (
    <div className="pb-10">
      <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>الرقية الشرعية</h2>
      <div className="space-y-4">
        {ruqyah.map((item, idx) => (
          <div key={idx} className={`p-5 rounded-xl shadow-sm border relative ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-100'}`}>
            <ShieldCheck className={`absolute top-4 right-4 w-6 h-6 opacity-20 ${isDark ? 'text-teal-500' : 'text-teal-500'}`} />
            <p className={`leading-relaxed text-lg pr-6 font-serif ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 10. المكونات المساعدة (Helper Components)
// ==========================================
function NavButton({ icon, label, isActive, onClick, isDark }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 py-2 relative transition-colors ${isActive ? (isDark ? 'text-teal-400' : 'text-teal-600') : (isDark ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-500')}`}>
      {isActive && <div className={`absolute top-0 w-8 h-1 rounded-b-full ${isDark ? 'bg-teal-400' : 'bg-teal-500'}`}></div>}
      <div className={`mb-1 ${isActive ? 'scale-110' : ''}`}>{icon}</div>
      <span className="text-[10px] font-medium truncate w-full text-center">{label}</span>
    </button>
  );
}

function SidebarLink({ icon, label, onClick, active, isDark }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-right ${active ? (isDark ? 'bg-teal-900/50 text-teal-400' : 'bg-teal-50 text-teal-700 font-bold') : (isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50')}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function LoadingSpinner({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-teal-600 dark:text-teal-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="font-medium">{text}</p>
    </div>
  );
}