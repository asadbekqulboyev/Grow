'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Settings, BookOpen, Users, Video, LogOut, Plus, Edit2, Trash2, X, HelpCircle, Youtube, Eye, Coins, Upload, Loader2, FileSpreadsheet, AlertTriangle, Award, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'courses' | 'lessons' | 'quizzes' | 'users' | 'shop'>('courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, onConfirm: () => void} | null>(null);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const supabase = createClient();

  // Course Form State
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '', description: '', category: '', level: '', reward_coins: 100, image_url: '', author: ''
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(fileName);

      setCourseForm({ ...courseForm, image_url: publicUrl });
    } catch (err: any) {
      toast.error("Rasm yuklashda xatolik. Supabase'da 'course-images' nomli Public bucket borligiga ishonch hosil qiling.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size if needed, e.g., 100MB
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video hajmi juda katta (maksimal 100MB).");
      return;
    }

    setIsUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('lesson-videos') // Foydalanuvchi bu bucketni Supabase'da ochishi kerak
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lesson-videos')
        .getPublicUrl(fileName);

      setLessonForm(prev => ({ ...prev, video_url: publicUrl }));
      toast.success("Video muvaffaqiyatli yuklandi!");
    } catch (err: any) {
      console.error("Video upload error:", err);
      toast.error("Video yuklashda xatolik. Supabase'da 'lesson-videos' nomli PUBLIC bucket borligiga ishonch hosil qiling.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Lesson Form State
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLessonIdForFilter, setSelectedLessonIdForFilter] = useState<string>('');
  const [lessonForm, setLessonForm] = useState({
    course_id: '', title: '', description: '', video_url: '', content_text: '', order_index: 1, is_free: false, reward_coins: 10
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data || []);
    setIsLoading(false);
  };

  const fetchLessons = async () => {
    setIsLoading(true);
    let query = supabase.from('lessons').select('*, courses(title)').order('order_index', { ascending: true });
    if (selectedCourseId) {
      query = query.eq('course_id', selectedCourseId);
    }
    const { data } = await query;
    setLessons(data || []);
    setIsLoading(false);
  };

  const fetchQuizzes = async () => {
    setIsLoading(true);
    // Use fallback or ignore error if table doesn't exist yet
    let query = supabase.from('quizzes').select('*, courses(title), lessons(title)').order('order_index', { ascending: true });
    if (selectedCourseId) {
      query = query.eq('course_id', selectedCourseId);
    }
    if (selectedLessonIdForFilter) {
      query = query.eq('lesson_id', selectedLessonIdForFilter);
    }
    const { data, error } = await query;
    if (error) {
      console.warn("Quizzes fetch error (might not exist yet):", error);
      setQuizzes([]);
    } else {
      setQuizzes(data || []);
    }
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_all_users_stats');
    if (error) {
       console.error("Raw RPC error:", error);
       console.error("RPC Error Message:", error.message);
       console.error("RPC Error Details:", error.details);
    } else {
       setUsers(data || []);
    }
    setIsLoading(false);
  };

  // --- Shop Items ---
  const [showShopForm, setShowShopForm] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [isUploadingShopImage, setIsUploadingShopImage] = useState(false);
  const [shopForm, setShopForm] = useState({
    name: '', description: '', price: 100, icon_name: 'Gift', color: 'from-amber-400 to-orange-500', available: true, order_index: 1, image_url: ''
  });

  const handleShopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingShopImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `shop_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-images')
        .getPublicUrl(fileName);

      setShopForm({ ...shopForm, image_url: publicUrl });
    } catch (err: any) {
      toast.error("Rasm yuklashda xatolik. Supabase'da 'shop-images' nomli Public bucket borligiga ishonch hosil qiling.");
    } finally {
      setIsUploadingShopImage(false);
    }
  };

  const fetchShopItems = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('shop_items').select('*').order('order_index', { ascending: true });
    setShopItems(data || []);
    setIsLoading(false);
  };

  const openShopForm = (item?: any) => {
    if (item) {
      setEditingShopId(item.id);
      setShopForm({
        name: item.name, description: item.description || '', price: item.price,
        icon_name: item.icon_name || 'Gift', color: item.color || 'from-amber-400 to-orange-500',
        available: item.available !== false, order_index: item.order_index || 1, image_url: item.image_url || ''
      });
    } else {
      setEditingShopId(null);
      const maxOrder = shopItems.length > 0 ? Math.max(...shopItems.map(s => s.order_index || 0)) : 0;
      setShopForm({ name: '', description: '', price: 100, icon_name: 'Gift', color: 'from-amber-400 to-orange-500', available: true, order_index: maxOrder + 1, image_url: '' });
    }
    setShowShopForm(true);
  };

  const saveShopItem = async () => {
    try {
      if (editingShopId) {
        const { error } = await supabase.from('shop_items').update(shopForm).eq('id', editingShopId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('shop_items').insert([shopForm]);
        if (error) throw error;
      }
      setShowShopForm(false);
      fetchShopItems();
      toast.success('Mahsulot saqlandi!');
    } catch (err: any) {
      toast.error('Saqlashda xatolik: ' + err.message);
    }
  };

  const deleteShopItem = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Ushbu mahsulotni rostdan ham o\'chirmoqchimisiz?',
      onConfirm: async () => {
        await supabase.from('shop_items').delete().eq('id', id);
        toast.success('Mahsulot o\'chirildi!');
        fetchShopItems();
      }
    });
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    setIsLoading(true);
    const { error } = await supabase.rpc('set_user_role', { target_user_id: userId, new_role: newRole });
    if (error) {
      toast.error("Rolni o'zgartirishda xatolik: " + error.message);
    } else {
      toast.success("Ruxsat muvaffaqiyatli o'zgartirildi!");
      fetchUsers();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // Middleware handles real protection; this is defense-in-depth
      if (session?.user) {
        setIsAuthenticated(true);
        fetchCourses();
      } else {
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (activeTab === 'courses') fetchCourses();
       
      if (activeTab === 'lessons') fetchLessons();
       
      if (activeTab === 'quizzes') {
        fetchQuizzes();
        fetchLessons();
      }
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'shop') fetchShopItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated, selectedCourseId, selectedLessonIdForFilter]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- Course Handlers ---
  const saveCourse = async () => {
    try {
      if (editingCourseId) {
        const { error } = await supabase.from('courses').update(courseForm).eq('id', editingCourseId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert([courseForm]);
        if (error) throw error;
      }
      setShowCourseForm(false);
      fetchCourses();
    } catch (err: any) {
      toast.error("Kursni saqlashda xatolik yuz berdi:\n" + err.message);
    }
  };

  const deleteCourse = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Rostdan ham ushbu kursni o\'chirmoqchimisiz? Kurs bilan birga uning ichidagi barcha darslar va testlar ham bir umrga o\'chib ketadi!',
      onConfirm: async () => {
        await supabase.from('courses').delete().eq('id', id);
        toast.success("Kurs muvaffaqiyatli o'chirildi!");
        fetchCourses();
      }
    });
  };

  const openCourseForm = (course?: any) => {
    if (course) {
      setEditingCourseId(course.id);
      setCourseForm({
        title: course.title, description: course.description, category: course.category, level: course.level,
        reward_coins: course.reward_coins, image_url: course.image_url || '', author: course.author || ''
      });
    } else {
      setEditingCourseId(null);
      setCourseForm({ title: '', description: '', category: 'Boshqa', level: 'Boshlang\'ich', reward_coins: 100, image_url: '', author: 'Asadbek' });
    }
    setShowCourseForm(true);
  };

  // --- Lesson Handlers ---
  const saveLesson = async () => {
    try {
      if (editingLessonId) {
        const { error } = await supabase.from('lessons').update(lessonForm).eq('id', editingLessonId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('lessons').insert([lessonForm]);
        if (error) throw error;
      }
      setShowLessonForm(false);
      fetchLessons();
    } catch (err: any) {
      toast.error("Darsni saqlashda xatolik yuz berdi:\n" + err.message);
    }
  };

  const deleteLesson = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Ushbu darsni rostdan ham o\'chirmoqchimisiz?',
      onConfirm: async () => {
        await supabase.from('lessons').delete().eq('id', id);
        toast.success("Dars o'chirildi!");
        fetchLessons();
      }
    });
  };

  const openLessonForm = (lesson?: any) => {
    if (lesson) {
      setEditingLessonId(lesson.id);
      setLessonForm({
        course_id: lesson.course_id, title: lesson.title, description: lesson.description || '',
        video_url: lesson.video_url || '', content_text: lesson.content_text || '', order_index: lesson.order_index,
        is_free: lesson.is_free || false, reward_coins: lesson.reward_coins || 10
      });
    } else {
      setEditingLessonId(null);
      const cId = selectedCourseId || (courses[0]?.id || '');
      const existingLessons = lessons.filter(l => l.course_id === cId);
      const maxOrder = existingLessons.length > 0 ? Math.max(...existingLessons.map(l => l.order_index)) : 0;
      setLessonForm({ course_id: cId, title: '', description: '', video_url: '', content_text: '', order_index: maxOrder + 1, is_free: false, reward_coins: 10 });
    }
    setShowLessonForm(true);
  };

  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState({
    course_id: '', lesson_id: '', question: '', options: ['', '', '', ''], correct_option_index: 0, order_index: 1, reward_coins: 10
  });

  const openQuizForm = (quiz?: any) => {
    if (quiz) {
      setEditingQuizId(quiz.id);
      let parsedOptions = ['', '', '', ''];
      try {
        const ops = quiz.options || [];
        parsedOptions = [ops[0]||'', ops[1]||'', ops[2]||'', ops[3]||''];
      } catch (e){}
      setQuizForm({
        course_id: quiz.course_id, lesson_id: quiz.lesson_id || '', question: quiz.question, options: parsedOptions,
        correct_option_index: quiz.correct_option_index, order_index: quiz.order_index, reward_coins: quiz.reward_coins || 10
      });
    } else {
      setEditingQuizId(null);
      const cId = selectedCourseId || (courses[0]?.id || '');
      const existingQuizzes = quizzes.filter(q => q.course_id === cId);
      const maxOrder = existingQuizzes.length > 0 ? Math.max(...existingQuizzes.map(q => q.order_index)) : 0;
      setQuizForm({ course_id: cId, lesson_id: selectedLessonIdForFilter || '', question: '', options: ['', '', '', ''], correct_option_index: 0, order_index: maxOrder + 1, reward_coins: 10 });
    }
    setShowQuizForm(true);
  };

  const saveQuiz = async () => {
    const payload = {
      ...quizForm,
      lesson_id: quizForm.lesson_id || null,
      options: quizForm.options.filter(o => o.trim() !== '')
    };
    if (editingQuizId) {
      await supabase.from('quizzes').update(payload).eq('id', editingQuizId);
    } else {
      await supabase.from('quizzes').insert([payload]);
    }
    setShowQuizForm(false);
    fetchQuizzes();
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedCourseId) {
      toast.error("Iltimos, oldin fayl yuklanadigan Kursni tanlang (tepadagi filterdan).");
      return;
    }
    
    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const XLSX = await import('xlsx');
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]) as any[];
          
          if (!data || data.length === 0) throw new Error("Fayl ichi bo'sh.");
          
          const payload = data.map((row: any, i: number) => {
            const ops = [row['A']?.toString()||'', row['B']?.toString()||'', row['C']?.toString()||'', row['D']?.toString()||''].filter(Boolean);
            let cIdx = 0;
            const ans = row["To'g'ri_javob"]?.toString().toUpperCase();
            if (ans === 'B') cIdx = 1;
            if (ans === 'C') cIdx = 2;
            if (ans === 'D') cIdx = 3;
            
            return {
              course_id: selectedCourseId,
              lesson_id: selectedLessonIdForFilter || null,
              question: row['Savol'] || `Savol ${i+1}`,
              options: ops,
              correct_option_index: cIdx,
              order_index: i + 1,
              reward_coins: row['Ball'] ? Number(row['Ball']) : 10
            };
          });
          
          setConfirmModal({
            isOpen: true,
            title: `Siz ${payload.length} ta savol yukladingiz. Ularni bazaga saqlaymizmi?`,
            onConfirm: async () => {
              try {
                const { error } = await supabase.from('quizzes').insert(payload);
                if (error) throw error;
                toast.success(`${payload.length} ta savol muvaffaqiyatli saqlandi!`);
                fetchQuizzes();
              } catch (e: any) {
                toast.error("Xatolik: " + e.message);
              }
            }
          });
        } catch(err:any) {
           toast.error("Xatolik: " + err.message);
        } finally {
           setIsLoading(false);
           // reset target so same file can be uploaded again if needed
           e.target.value = '';
        }
      };
      reader.readAsBinaryString(file);
    } catch(err) {
      setIsLoading(false);
    }
  }

  const deleteQuiz = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Ushbu testni (quiz) rostdan ham o\'chirmoqchimisiz?',
      onConfirm: async () => {
        await supabase.from('quizzes').delete().eq('id', id);
        toast.success("Test muvaffaqiyatli o'chirildi!");
        fetchQuizzes();
      }
    });
  };

  if (isCheckingAuth) {
    return <div className="flex-1 flex justify-center items-center p-6 bg-[#F3F4F6] dark:bg-[#111827]">Tekshirilmoqda...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex justify-center items-center p-6 bg-[#F3F4F6] dark:bg-[#111827]">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ruxsat yetishmaydi</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Ushbu sahifaga kirish uchun admin huquqiga ega bo'lishingiz kerak.</p>
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-[#2D5A27] text-white rounded-xl font-bold transition-colors w-full">
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full relative">
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#2D5A27', color: '#fff', borderRadius: '16px', fontWeight: 'bold' } }} />
      
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 overflow-hidden backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center pt-8">
                 <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <AlertTriangle className="w-10 h-10" />
                 </div>
                 <h3 className="font-bold text-xl dark:text-white mb-2">Tasdiqlang</h3>
                 <p className="text-gray-500 dark:text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">{confirmModal.title}</p>
              </div>
              <div className="p-4 flex justify-center gap-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                 <button onClick={() => setConfirmModal(null)} className="px-5 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-bold dark:text-gray-200 hover:bg-gray-100 transition-colors w-full shadow-sm">Orqaga</button>
                 <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className="bg-red-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors w-full shadow-lg shadow-red-500/30">Ha, o'chirish</button>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Boshqaruv Paneli</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Platformani to&apos;liq boshqarish tizimi</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium">
          <LogOut className="w-5 h-5" />
          Chiqish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => setActiveTab('courses')} className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium transition-colors ${activeTab === 'courses' ? 'bg-white dark:bg-gray-900 text-[#2D5A27] dark:text-[#A8E6CF] border-t-2 border-[#2D5A27] dark:border-[#A8E6CF]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap'}`}>
          <BookOpen className="w-5 h-5" />
          Kurslar
        </button>
        <button onClick={() => setActiveTab('lessons')} className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium transition-colors ${activeTab === 'lessons' ? 'bg-white dark:bg-gray-900 text-[#2D5A27] dark:text-[#A8E6CF] border-t-2 border-[#2D5A27] dark:border-[#A8E6CF]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap'}`}>
          <Video className="w-5 h-5" />
          Darslar
        </button>
        <button onClick={() => setActiveTab('quizzes')} className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium transition-colors ${activeTab === 'quizzes' ? 'bg-white dark:bg-gray-900 text-[#2D5A27] dark:text-[#A8E6CF] border-t-2 border-[#2D5A27] dark:border-[#A8E6CF]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap'}`}>
          <HelpCircle className="w-5 h-5" />
          Testlar (Quizzes)
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium transition-colors ${activeTab === 'users' ? 'bg-white dark:bg-gray-900 text-[#2D5A27] dark:text-[#A8E6CF] border-t-2 border-[#2D5A27] dark:border-[#A8E6CF]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap'}`}>
          <Users className="w-5 h-5" />
          Foydalanuvchilar
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium transition-colors ${activeTab === 'shop' ? 'bg-white dark:bg-gray-900 text-[#2D5A27] dark:text-[#A8E6CF] border-t-2 border-[#2D5A27] dark:border-[#A8E6CF]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap'}`}>
          <ShoppingBag className="w-5 h-5" />
          Do&apos;kon
        </button>
      </div>

      {/* Courses Tab Content */}
      {activeTab === 'courses' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Barcha kurslar ({courses.length})</h2>
            <button onClick={() => openCourseForm()} className="flex items-center gap-2 bg-[#2D5A27] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1f421a] transition-colors">
              <Plus className="w-4 h-4" />
              Yangi qo&apos;shish
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Rasm</th>
                  <th className="px-4 py-3">Sarlavha</th>
                  <th className="px-4 py-3">Muallif</th>
                  <th className="px-4 py-3">Turkum</th>
                  <th className="px-4 py-3">Daraja</th>
                  <th className="px-4 py-3">Tanga</th>
                  <th className="px-4 py-3 rounded-tr-xl text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      {course.image_url ? (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                          <Image src={course.image_url} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>}
                    </td>
                    <td className="px-4 py-3 font-medium dark:text-white">{course.title}</td>
                    <td className="px-4 py-3 text-gray-500 font-medium">{course.author || 'Asadbek'}</td>
                    <td className="px-4 py-3 text-gray-500">{course.category}</td>
                    <td className="px-4 py-3 text-gray-500">{course.level}</td>
                    <td className="px-4 py-3 text-gray-500">{course.reward_coins}</td>
                    <td className="px-4 py-3 flex justify-end gap-2 text-right">
                      <button onClick={() => openCourseForm(course)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteCourse(course.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lessons Tab Content */}
      {activeTab === 'lessons' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
               <h2 className="text-xl font-bold dark:text-white">Darslar ({lessons.length})</h2>
               <select 
                 value={selectedCourseId} 
                 onChange={(e) => setSelectedCourseId(e.target.value)}
                 className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white outline-none"
               >
                  <option value="">Barcha kurslar</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
               </select>
            </div>
            
            <button onClick={() => openLessonForm()} className="flex items-center gap-2 bg-[#2D5A27] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1f421a] transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Yangi dars qo&apos;shish
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl text-center w-16">Tartib</th>
                  <th className="px-4 py-3">Dars nomi</th>
                  <th className="px-4 py-3">Kurs</th>
                  <th className="px-4 py-3">Cover</th>
                  <th className="px-4 py-3">Bepul?</th>
                  <th className="px-4 py-3">Tanga</th>
                  <th className="px-4 py-3 rounded-tr-xl text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-bold text-center text-gray-500">{lesson.order_index}</td>
                    <td className="px-4 py-3 font-medium dark:text-white">{lesson.title}</td>
                    <td className="px-4 py-3 text-gray-500">{(lesson as any).courses?.title || 'Noma\'lum'}</td>
                    <td className="px-4 py-3">
                      {lesson.video_url ? (
                        getYouTubeId(lesson.video_url) ? (
                           <img src={`https://img.youtube.com/vi/${getYouTubeId(lesson.video_url)}/mqdefault.jpg`} alt="" className="w-20 h-12 object-cover rounded-lg" />
                        ) : (
                           <div className="w-20 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                              <Video className="w-5 h-5 text-green-500" />
                           </div>
                        )
                      ) : <div className="w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"><Video className="w-4 h-4 text-gray-400" /></div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${lesson.is_free ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {lesson.is_free ? 'Bepul' : 'Pullik'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-yellow-500 font-bold">+{lesson.reward_coins || 10}</td>
                    <td className="px-4 py-3 flex justify-end gap-2 text-right">
                      <button onClick={() => openLessonForm(lesson)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteLesson(lesson.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quizzes Tab Content */}
      {activeTab === 'quizzes' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
               <h2 className="text-xl font-bold dark:text-white">Testlar ({quizzes.length})</h2>
               <div className="flex gap-2 w-full sm:w-auto">
                 <select 
                   value={selectedCourseId} 
                   onChange={(e) => setSelectedCourseId(e.target.value)}
                   className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white outline-none w-full sm:w-auto font-medium"
                 >
                    <option value="">Barcha kurslar</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                 </select>
                 <select 
                   value={selectedLessonIdForFilter} 
                   onChange={(e) => setSelectedLessonIdForFilter(e.target.value)}
                   className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white outline-none w-full sm:w-auto font-medium"
                 >
                    <option value="">Barcha darslar</option>
                    {lessons.filter(l => !selectedCourseId || l.course_id === selectedCourseId).map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                 </select>
               </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <label className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors whitespace-nowrap cursor-pointer border border-blue-200 dark:border-blue-800 shadow-sm">
                <FileSpreadsheet className="w-4 h-4" />
                Excel (.xlsx)
                <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleExcelUpload} disabled={isLoading} />
              </label>
              <button onClick={() => openQuizForm()} className="flex items-center gap-2 bg-[#2D5A27] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1f421a] transition-colors whitespace-nowrap shadow-sm">
                <Plus className="w-4 h-4" />
                Yangi test
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl text-center w-16">Tartib</th>
                  <th className="px-4 py-3">Savol</th>
                  <th className="px-4 py-3">Kurs & Dars</th>
                  <th className="px-4 py-3">Tanga</th>
                  <th className="px-4 py-3 rounded-tr-xl text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-bold text-center text-gray-500">{quiz.order_index}</td>
                    <td className="px-4 py-3 font-medium dark:text-white truncate max-w-[300px]">{quiz.question}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <div className="font-bold text-[#2D5A27] dark:text-[#A8E6CF]">{(quiz as any).courses?.title || 'Noma\'lum kursi'}</div>
                      <div className="text-gray-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{(quiz as any).lessons?.title || 'Umumiy kurs testi'}</div>
                    </td>
                    <td className="px-4 py-3 text-yellow-500 font-bold">+{quiz.reward_coins}</td>
                    <td className="px-4 py-3 flex justify-end gap-2 text-right">
                      <button onClick={() => openQuizForm(quiz)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteQuiz(quiz.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-3">
              Foydalanuvchilar statistikasi
              <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">{users.length} ta o'quvchi</span>
            </h2>
            <button onClick={fetchUsers} className="p-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-xl transition-colors">
              <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                <tr>
                  <th className="px-4 py-4 rounded-tl-xl">F.I.SH & Email</th>
                  <th className="px-4 py-4 text-center">Tugatgan darslar</th>
                  <th className="px-4 py-4 text-center">Sertifikatlar</th>
                  <th className="px-4 py-4 text-center">Jamg'argan tangalari</th>
                  <th className="px-4 py-4 text-center">Rol (Lavozim)</th>
                  <th className="px-4 py-4 rounded-tr-xl text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.length === 0 && !isLoading && (
                   <tr>
                     <td colSpan={5} className="py-10 text-center text-gray-500">Hech qanday ma'lumot topilmadi</td>
                   </tr>
                )}
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#4a8c42] flex flex-col items-center justify-center text-white shrink-0 shadow-sm border-2 border-white dark:border-gray-800">
                          <span className="font-bold text-sm uppercase">{user.full_name ? user.full_name.charAt(0) : user.email?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{user.full_name || 'Ismi kiritilmagan'}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800">
                         {user.completed_lessons}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {user.total_certificates > 0 ? (
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold border border-green-100 dark:border-green-800">
                           <Award className="w-4 h-4" /> {user.total_certificates}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                       <span className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-bold shadow-sm whitespace-nowrap">
                          <Coins className="w-4 h-4" /> {user.total_coins}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-center min-w-[130px]">
                      <select 
                        value={user.role || 'student'} 
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        disabled={isLoading || user.email === 'asadbekqulboyev@gmail.com'}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-50 font-bold transition-all"
                      >
                        <option value="student">O'quvchi</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <button onClick={() => toast("Ushbu foydalanuvchini bloklash yoki o'chirish keyingi versiya orqali boshqariladi.", { icon: '🔒' })} title="Qo'shimcha amallar" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <LogOut className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shop Tab Content */}
      {activeTab === 'shop' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Do&apos;kon mahsulotlari ({shopItems.length})</h2>
            <button onClick={() => openShopForm()} className="flex items-center gap-2 bg-[#2D5A27] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1f421a] transition-colors">
              <Plus className="w-4 h-4" />
              Yangi mahsulot
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl text-center w-16">Tartib</th>
                  <th className="px-4 py-3">Nomi</th>
                  <th className="px-4 py-3">Tavsifi</th>
                  <th className="px-4 py-3 text-center">Narxi</th>
                  <th className="px-4 py-3 text-center">Holat</th>
                  <th className="px-4 py-3 text-center">Icon</th>
                  <th className="px-4 py-3 rounded-tr-xl text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {shopItems.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">Hali mahsulot qo&apos;shilmagan</td>
                  </tr>
                )}
                {shopItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-bold text-center text-gray-500">{item.order_index}</td>
                    <td className="px-4 py-3 font-medium dark:text-white">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{item.description}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-bold text-xs">
                        <Coins className="w-3.5 h-3.5" /> {item.price}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.available ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {item.available ? 'Faol' : 'O\'chiq'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.image_url ? (
                        <div className="w-10 h-10 relative rounded-lg overflow-hidden mx-auto border border-gray-200 dark:border-gray-700">
                          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} mx-auto flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">{item.icon_name?.[0] || '?'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 flex justify-end gap-2 text-right">
                      <button onClick={() => openShopForm(item)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteShopItem(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* --- FORMS/MODALS --- */}

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <h3 className="font-bold text-lg dark:text-white">{editingCourseId ? 'Kursni tahrirlash' : 'Yangi kurs qo\'shish'}</h3>
                 <button onClick={() => setShowCourseForm(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sarlavha</label>
                   <input type="text" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tavsif</label>
                   <textarea rows={3} value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Daraja</label>
                      <select value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]">
                        <option value="Boshlang'ich">Boshlang&apos;ich</option>
                        <option value="O'rta">O&apos;rta</option>
                        <option value="Murakkab">Murakkab</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Turkum</label>
                      <select value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]">
                        <option value="Shar dekoratsiyasi">Shar dekoratsiyasi</option>
                        <option value="SMM">SMM</option>
                        <option value="Dasturlash">Dasturlash</option>
                        <option value="Dizayn">Dizayn</option>
                        <option value="Xorijiy tillar">Xorijiy tillar</option>
                        <option value="Biznes">Biznes</option>
                        <option value="Notiqlik">Notiqlik</option>
                        <option value="Time Management">Time Management</option>
                        <option value="Imij">Imij (Shaxsiy Brend)</option>
                        <option value="Volontyorlik">Volontyorlik</option>
                        <option value="Boshqa">Boshqa</option>
                      </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Muallif / Mentor</label>
                      <input type="text" value={courseForm.author} onChange={e => setCourseForm({...courseForm, author: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sovrin (tanga)</label>
                      <input type="number" value={courseForm.reward_coins} onChange={e => setCourseForm({...courseForm, reward_coins: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rasm Yuklash yoki Manzili (URL)</label>
                    <div className="flex flex-col gap-3">
                      {courseForm.image_url && (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <Image src={courseForm.image_url} alt="Joylanayotgan rasm" fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex gap-2 items-center">
                        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors w-1/3 shrink-0">
                          {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> : <Upload className="w-5 h-5 text-gray-500" />}
                          <span className="text-sm font-medium dark:text-gray-300">{isUploadingImage ? 'Yuklanmoqda...' : 'Yuklash'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                        </label>
                        <span className="text-xs text-gray-400">yoki</span>
                        <input type="text" value={courseForm.image_url} onChange={e => setCourseForm({...courseForm, image_url: e.target.value})} placeholder="https://" className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                      </div>
                    </div>
                  </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/30">
                 <button onClick={() => setShowCourseForm(false)} className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">Bekor qilish</button>
                 <button onClick={saveCourse} className="bg-[#2D5A27] text-white px-5 py-2.5 rounded-xl font-medium">Saqlash</button>
              </div>
           </div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <h3 className="font-bold text-lg dark:text-white">{editingLessonId ? 'Darsni tahrirlash' : 'Yangi dars qo\'shish'}</h3>
                 <button onClick={() => setShowLessonForm(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tegishli Kurs</label>
                   <select value={lessonForm.course_id} onChange={e => setLessonForm({...lessonForm, course_id: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]">
                     <option value="" disabled>Kursni tanlang...</option>
                     {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Dars Nomi / Sarlavha</label>
                   <input type="text" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Qisqacha Tavsif</label>
                   <textarea rows={2} value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                                   </div>
                  <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Video Havolasi (YouTube yoki Direct URL)</label>
                     <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center">
                          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors w-1/3 shrink-0 shadow-sm border border-gray-200 dark:border-gray-700">
                            {isUploadingVideo ? <Loader2 className="w-5 h-5 animate-spin text-green-500" /> : <Upload className="w-5 h-5 text-green-500" />}
                            <span className="text-sm font-bold dark:text-gray-300">{isUploadingVideo ? 'Yuklash...' : 'Fayl'}</span>
                            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={isUploadingVideo} />
                          </label>
                          <span className="text-xs text-gray-400">yoki</span>
                          <input 
                            type="text" 
                            value={lessonForm.video_url} 
                            onChange={e => setLessonForm({...lessonForm, video_url: e.target.value})} 
                            placeholder="URL yokie /videos/..." 
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF] font-medium" 
                          />
                        </div>

                        {lessonForm.video_url && (
                          <div className="mt-1 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                             {getYouTubeId(lessonForm.video_url) ? (
                                <>
                                  <img src={`https://img.youtube.com/vi/${getYouTubeId(lessonForm.video_url)}/hqdefault.jpg`} alt="Video preview" className="w-full h-40 object-cover" />
                                  <div className="p-2.5 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-bold">
                                    <Youtube className="w-4 h-4" /> YouTube Video aniqlandi ✓
                                  </div>
                                </>
                             ) : (
                                <div className="p-4 flex items-center gap-3">
                                   <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center shrink-0">
                                      <Video className="w-6 h-6 text-green-600 dark:text-green-400" />
                                   </div>
                                   <div className="min-w-0 flex-1">
                                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Direct Video aniqlandi</div>
                                      <div className="text-sm font-bold dark:text-white truncate">{lessonForm.video_url}</div>
                                   </div>
                                </div>
                             )}
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 italic">Maslahat: Local saqlash uchun /videos/kurs-nomi/dars1.mp4 shaklida yozing.</p>
                     </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Dars Matni / Qo'shimcha Eslatmalar</label>
                    <textarea rows={3} value={lessonForm.content_text} onChange={e => setLessonForm({...lessonForm, content_text: e.target.value})} placeholder="Video ostida ko'rsatiladigan matn..." className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tartib</label>
                      <input type="number" value={lessonForm.order_index} onChange={e => setLessonForm({...lessonForm, order_index: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tanga</label>
                      <input type="number" value={lessonForm.reward_coins} onChange={e => setLessonForm({...lessonForm, reward_coins: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 p-2.5 cursor-pointer">
                        <input type="checkbox" checked={lessonForm.is_free} onChange={e => setLessonForm({...lessonForm, is_free: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#2D5A27] focus:ring-[#A8E6CF]" />
                        <span className="text-sm font-medium dark:text-gray-300">Bepul</span>
                      </label>
                    </div>
                  </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/30">
                 <button onClick={() => setShowLessonForm(false)} className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">Bekor qilish</button>
                 <button onClick={saveLesson} className="bg-[#2D5A27] text-white px-5 py-2.5 rounded-xl font-medium">Saqlash</button>
              </div>
           </div>
        </div>
      )}

      {/* Quiz Form Modal */}
      {showQuizForm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <h3 className="font-bold text-lg dark:text-white">{editingQuizId ? 'Testni tahrirlash' : 'Yangi test qo\'shish'}</h3>
                 <button onClick={() => setShowQuizForm(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tegishli Kurs</label>
                     <select value={quizForm.course_id} onChange={e => setQuizForm({...quizForm, course_id: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]">
                       <option value="" disabled>Kursni tanlang...</option>
                       {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tegishli Dars (ixtiyoriy)</label>
                     <select value={quizForm.lesson_id} onChange={e => setQuizForm({...quizForm, lesson_id: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]">
                       <option value="">Umumiy kurs testi</option>
                       {lessons.filter(l => !quizForm.course_id || l.course_id === quizForm.course_id).map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                     </select>
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Savol matni</label>
                   <textarea rows={2} value={quizForm.question} onChange={e => setQuizForm({...quizForm, question: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF] resize-none" placeholder="Masalan: JavaScriptda o'zgaruvchilar qanday e'lon qilinadi?" />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium mb-2 dark:text-gray-300">Variantlar (To'g'ri javobni belgilang)</label>
                   <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                     {['A', 'B', 'C', 'D'].map((letter, idx) => (
                       <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${quizForm.correct_option_index === idx ? 'border-[#2D5A27] bg-[#2D5A27]/5' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} transition-all`}>
                         <label className="flex items-center cursor-pointer p-1">
                           <input 
                             type="radio" 
                             name="correctAnswer" 
                             checked={quizForm.correct_option_index === idx}
                             onChange={() => setQuizForm({...quizForm, correct_option_index: idx})}
                             className="w-5 h-5 text-[#2D5A27] focus:ring-[#2D5A27] cursor-pointer"
                           />
                           <span className="font-bold text-gray-500 w-6 ml-2 text-center select-none">{letter})</span>
                         </label>
                         <input 
                           type="text" 
                           value={quizForm.options[idx] || ''}
                           onChange={e => {
                             const newOps = [...quizForm.options];
                             newOps[idx] = e.target.value;
                             setQuizForm({...quizForm, options: newOps});
                           }}
                           placeholder={`${letter} variantini kiriting...`} 
                           className="flex-1 p-2 bg-transparent outline-none dark:text-white text-sm border-l border-gray-200 dark:border-gray-700 pl-3" 
                         />
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tartib Raqami</label>
                     <input type="number" value={quizForm.order_index} onChange={e => setQuizForm({...quizForm, order_index: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sovrin (tanga)</label>
                     <input type="number" value={quizForm.reward_coins} onChange={e => setQuizForm({...quizForm, reward_coins: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                   </div>
                 </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/30">
                 <button onClick={() => setShowQuizForm(false)} className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">Bekor qilish</button>
                 <button onClick={saveQuiz} className="bg-[#2D5A27] text-white px-5 py-2.5 rounded-xl font-medium">Saqlash</button>
              </div>
           </div>
        </div>
      )}

      {/* Shop Item Form Modal */}
      {showShopForm && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <h3 className="font-bold text-lg dark:text-white">{editingShopId ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h3>
                 <button onClick={() => setShowShopForm(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Mahsulot nomi</label>
                   <input type="text" value={shopForm.name} onChange={e => setShopForm({...shopForm, name: e.target.value})} placeholder="Masalan: Premium Badge" className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tavsifi</label>
                   <textarea rows={2} value={shopForm.description} onChange={e => setShopForm({...shopForm, description: e.target.value})} placeholder="Qisqacha tavsif..." className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Narxi (tanga)</label>
                      <input type="number" value={shopForm.price} onChange={e => setShopForm({...shopForm, price: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tartib</label>
                      <input type="number" value={shopForm.order_index} onChange={e => setShopForm({...shopForm, order_index: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Icon nomi</label>
                      <select value={shopForm.icon_name} onChange={e => setShopForm({...shopForm, icon_name: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]">
                        <option value="Crown">Crown 👑</option>
                        <option value="Sparkles">Sparkles ✨</option>
                        <option value="Gift">Gift 🎁</option>
                        <option value="ShoppingBag">ShoppingBag 🛍</option>
                        <option value="Lock">Lock 🔒</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rang (gradient)</label>
                      <select value={shopForm.color} onChange={e => setShopForm({...shopForm, color: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]">
                        <option value="from-amber-400 to-orange-500">🟠 Oltin</option>
                        <option value="from-purple-400 to-indigo-500">🟣 Binafsha</option>
                        <option value="from-pink-400 to-rose-500">🩷 Pushti</option>
                        <option value="from-emerald-400 to-teal-500">🟢 Yashil</option>
                        <option value="from-blue-400 to-cyan-500">🔵 Ko&apos;k</option>
                        <option value="from-red-400 to-rose-600">🔴 Qizil</option>
                        <option value="from-gray-600 to-gray-800">⚫ Qora</option>
                      </select>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                   <input type="checkbox" checked={shopForm.available} onChange={e => setShopForm({...shopForm, available: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#2D5A27] focus:ring-[#A8E6CF]" />
                   <div>
                     <label className="text-sm font-medium dark:text-gray-300">Faol (sotuvda)</label>
                     <p className="text-xs text-gray-400">O&apos;chirilsa, foydalanuvchilarga ko&apos;rinmaydi</p>
                   </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rasm Yuklash (Ixtiyoriy)</label>
                    <div className="flex flex-col gap-3">
                      {shopForm.image_url && (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <Image src={shopForm.image_url} alt="Joylanayotgan rasm" fill className="object-contain" />
                        </div>
                      )}
                      <div className="flex gap-2 items-center">
                        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors w-1/3 shrink-0">
                          {isUploadingShopImage ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> : <Upload className="w-5 h-5 text-gray-500" />}
                          <span className="text-sm font-medium dark:text-gray-300">{isUploadingShopImage ? 'Yuklanmoqda...' : 'Yuklash'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleShopImageUpload} disabled={isUploadingShopImage} />
                        </label>
                        <span className="text-xs text-gray-400">yoki</span>
                        <input type="text" value={shopForm.image_url} onChange={e => setShopForm({...shopForm, image_url: e.target.value})} placeholder="https://" className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                      </div>
                    </div>
                  </div>

                 {/* Preview */}
                 <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                   {shopForm.image_url ? (
                      <div className="h-32 relative bg-white">
                        <Image src={shopForm.image_url} alt="Preview" fill className="object-cover" />
                      </div>
                   ) : (
                      <div className={`h-20 bg-gradient-to-br ${shopForm.color} flex items-center justify-center`}>
                        <span className="text-white text-2xl">{ shopForm.icon_name === 'Crown' ? '👑' : shopForm.icon_name === 'Sparkles' ? '✨' : shopForm.icon_name === 'Gift' ? '🎁' : '🛍' }</span>
                      </div>
                   )}
                   <div className="p-3 bg-white dark:bg-gray-900">
                     <p className="font-bold text-sm dark:text-white">{shopForm.name || 'Mahsulot nomi'}</p>
                     <p className="text-xs text-gray-400 mt-0.5">{shopForm.description || 'Tavsif...'}</p>
                     <p className="text-xs font-bold text-yellow-600 mt-1">💰 {shopForm.price} tanga</p>
                   </div>
                 </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/30">
                 <button onClick={() => setShowShopForm(false)} className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">Bekor qilish</button>
                 <button onClick={saveShopItem} className="bg-[#2D5A27] text-white px-5 py-2.5 rounded-xl font-medium">Saqlash</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
