import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, HeartHandshake, MessageSquareHeart, ShieldCheck } from 'lucide-react';
import { supabase } from './supabase';

export function HomeView({ setCurrentPage, isDark }) {
  // ميزة مشاركة واتساب
  const shareOnWhatsApp = () => {
    const text = "شاركنا الأجر في ختمة القرآن وتسبيح بنية الشفاء العاجل لمحمود صلاح. اضغط هنا للمشاركة: " + window.location.href;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="flex flex-col space-y-6 mt-4">
      <div className={`p-6 rounded-3xl shadow-sm border text-center relative overflow-hidden transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-100'}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-40 pointer-events-none ${isDark ? 'bg-teal-900' : 'bg-teal-50'}`}></div>
        
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 shadow-md relative z-10" style={{ borderColor: isDark ? '#0f766e' : '#ccfbf1' }}>
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
          
          {/* زر المشاركة بألوان خوارزماث */}
          <button onClick={shareOnWhatsApp} className="px-6 py-2 rounded-full font-bold transition bg-amber-600 text-white hover:bg-amber-700 shadow-md flex items-center justify-center gap-2">
            <HeartHandshake className="w-5 h-5" /> شارك التطبيق للأجر
          </button>
        </div>
      </div>
    </div>
  );
}

export function KhatmahView({ deviceId, isDark }) {
  const [myPageNumber, setMyPageNumber] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [khatmahInfo, setKhatmahInfo] = useState({ number: 1, userPagesRead: 0 });
  const [globalCurrentPage, setGlobalCurrentPage] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false); // شاشة الاحتفال

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedCount = localStorage.getItem('mahmoud_user_pages_read') || '0';
      setKhatmahInfo(prev => ({ ...prev, userPagesRead: parseInt(savedCount) }));
      try {
        const { data } = await supabase.from('khatmah_state').select('*').eq('id', 1).single();
        if (data) {
          setGlobalCurrentPage(data.current_page);
          setKhatmahInfo(prev => ({ ...prev, number: data.khatmah_number || 1 }));
        }
      } catch (err) {}
    };
    fetchInitialData();
  }, []);

  const reservePage = async () => {
    setLoading(true); setErrorMsg(''); setShowCelebration(false);
    try {
      const { data, error } = await supabase.from('khatmah_state').select('*').eq('id', 1).single();
      if (error) throw error;

      let nextTargetPage = data.current_page + 1;
      let nextKhatmahNum = data.khatmah_number || 1;
      
      if (nextTargetPage > 604) {
        nextTargetPage = 1;
        nextKhatmahNum += 1;
      }

      await supabase.from('khatmah_state').update({ current_page: nextTargetPage, khatmah_number: nextKhatmahNum }).eq('id', 1);

      const pageToRead = nextTargetPage === 1 ? 604 : nextTargetPage - 1;
      setMyPageNumber(pageToRead);
      setGlobalCurrentPage(nextTargetPage);
      setKhatmahInfo(prev => ({ ...prev, number: pageToRead === 604 ? nextKhatmahNum - 1 : nextKhatmahNum }));
      
      fetchQuranPage(pageToRead);
    } catch (error) {
      setErrorMsg('حدث خطأ. حاول مرة أخرى.'); setLoading(false);
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
    
    // إظهار الاحتفال إذا كانت الصفحة 604
    if (myPageNumber === 604) {
      setShowCelebration(true);
    } else {
      setCompleted(true);
    }
  };

  if (showCelebration) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in">
        <div className="w-32 h-32 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-amber-200">
          <BookOpen className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-amber-600">الله أكبر ولله الحمد!</h2>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>تم إكمال الختمة رقم {khatmahInfo.number}</h3>
        <p className={`mb-8 px-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          بفضلك وبفضل المشاركين، أتممنا ختمة كاملة للقرآن الكريم بنية الشفاء العاجل لمحمود صلاح. نسأل الله القبول.
        </p>
        <button onClick={() => { setShowCelebration(false); setCompleted(false); setMyPageNumber(null); }} className="bg-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-amber-700">
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
             الختمة الحالية: <span className="text-lg">رقم {khatmahInfo.number}</span>
             <br/>
             <span className="text-xs opacity-80">وصلنا للصفحة: {globalCurrentPage}</span>
           </p>
           <p className="font-bold">إجمالي ما قرأته أنت: <span className="text-lg text-emerald-500">{khatmahInfo.userPagesRead}</span> صفحة</p>
        </div>

        <p className={`mb-8 text-sm px-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>اضغط لحجز صفحة تقرأها بنية الشفاء.</p>
        {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
        <button onClick={reservePage} disabled={loading} className="bg-teal-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-teal-700 w-full max-w-xs flex justify-center items-center h-14">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'احجز صفحة'}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className={`flex flex-col gap-2 mb-4 p-3 rounded-xl font-bold text-sm border ${isDark ? 'bg-slate-800 border-slate-700 text-teal-300' : 'bg-teal-100 border-teal-200 text-teal-800'}`}>
        <div className="flex justify-between items-center border-b pb-2 border-current/20">
           <span>الختمة رقم: {khatmahInfo.number}</span>
           <span>الصفحة: {myPageNumber}</span>
        </div>
        <div className="flex justify-between items-center pt-1">
           <span className="opacity-80 font-normal">قرأت: {khatmahInfo.userPagesRead} صفحة</span>
           {pageData && <span>سورة {pageData.ayahs[0].surah.name}</span>}
        </div>
      </div>

      {loading || !pageData ? (
        <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-teal-500" /></div>
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
        <button onClick={handleComplete} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-emerald-700">
          أتممت القراءة بحمد الله
        </button>
      )}
    </div>
  );
}

// الرقية الشرعية
export function RuqyahView({ isDark }) {
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

// حائط الدعاء
export function GuestbookView({ userData, isDark }) {
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
      <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>دفتر المحبة والدعاء</h2>
      
      <form onSubmit={handleSubmit} className={`mb-8 p-4 rounded-xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-100'}`}>
        <textarea 
          value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب دعوة من قلبك لمحمود..."
          className={`w-full p-3 rounded-lg border outline-none mb-3 resize-none h-24 ${isDark ? 'bg-slate-900 border-slate-600 text-slate-200 focus:border-teal-500' : 'bg-teal-50/50 border-teal-200 text-slate-700 focus:border-teal-500'}`}
        ></textarea>
        <button disabled={isSubmitting} type="submit" className="w-full bg-amber-600 text-white font-bold py-2 rounded-lg hover:bg-amber-700">
          {isSubmitting ? 'جاري الإرسال...' : 'أرسل الدعاء'}
        </button>
      </form>

      <div className="space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-teal-50 shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-2 opacity-70">
              <MessageSquareHeart className="w-4 h-4" />
              <span className="font-bold text-sm">{msg.nickname}</span>
            </div>
            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}