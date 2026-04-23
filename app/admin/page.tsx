'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Settings, BookOpen, Users, Video, LogOut, Plus, Edit2, Trash2, X, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'courses' | 'lessons' | 'quizzes' | 'users'>('courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Course Form State
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '', description: '', category: '', level: '', duration_minutes: 60, reward_coins: 100, image_url: ''
  });

  // Lesson Form State
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [lessonForm, setLessonForm] = useState({
    course_id: '', title: '', description: '', video_url: '', duration_minutes: 10, order_index: 1
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
    let query = supabase.from('quizzes').select('*, courses(title)').order('order_index', { ascending: true });
    if (selectedCourseId) {
      query = query.eq('course_id', selectedCourseId);
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

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email === 'asadbekqulboyev@gmail.com') {
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
       
      if (activeTab === 'quizzes') fetchQuizzes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated, selectedCourseId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- Course Handlers ---
  const saveCourse = async () => {
    if (editingCourseId) {
      await supabase.from('courses').update(courseForm).eq('id', editingCourseId);
    } else {
      await supabase.from('courses').insert([courseForm]);
    }
    setShowCourseForm(false);
    fetchCourses();
  };

  const deleteCourse = async (id: string) => {
    if (confirm('Rostdan ham ushbu kursni o\'chirmoqchimisiz?')) {
      await supabase.from('courses').delete().eq('id', id);
      fetchCourses();
    }
  };

  const openCourseForm = (course?: any) => {
    if (course) {
      setEditingCourseId(course.id);
      setCourseForm({
        title: course.title, description: course.description, category: course.category, level: course.level,
        duration_minutes: course.duration_minutes, reward_coins: course.reward_coins, image_url: course.image_url || ''
      });
    } else {
      setEditingCourseId(null);
      setCourseForm({ title: '', description: '', category: 'Boshqa', level: 'Boshlang\'ich', duration_minutes: 60, reward_coins: 100, image_url: '' });
    }
    setShowCourseForm(true);
  };

  // --- Lesson Handlers ---
  const saveLesson = async () => {
    if (editingLessonId) {
      await supabase.from('lessons').update(lessonForm).eq('id', editingLessonId);
    } else {
      await supabase.from('lessons').insert([lessonForm]);
    }
    setShowLessonForm(false);
    fetchLessons();
  };

  const deleteLesson = async (id: string) => {
    if (confirm('Ushbu darsni o\'chirmoqchimisiz?')) {
      await supabase.from('lessons').delete().eq('id', id);
      fetchLessons();
    }
  };

  const openLessonForm = (lesson?: any) => {
    if (lesson) {
      setEditingLessonId(lesson.id);
      setLessonForm({
        course_id: lesson.course_id, title: lesson.title, description: lesson.description || '',
        video_url: lesson.video_url || '', duration_minutes: lesson.duration_minutes, order_index: lesson.order_index
      });
    } else {
      setEditingLessonId(null);
      setLessonForm({ course_id: selectedCourseId || (courses[0]?.id || ''), title: '', description: '', video_url: '', duration_minutes: 10, order_index: 1 });
    }
    setShowLessonForm(true);
  };

  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState({
    course_id: '', question: '', options: '["A", "B"]', correct_option_index: 0, order_index: 1, reward_coins: 10
  });

  const openQuizForm = (quiz?: any) => {
    if (quiz) {
      setEditingQuizId(quiz.id);
      setQuizForm({
        course_id: quiz.course_id, question: quiz.question, options: JSON.stringify(quiz.options || []),
        correct_option_index: quiz.correct_option_index, order_index: quiz.order_index, reward_coins: quiz.reward_coins || 10
      });
    } else {
      setEditingQuizId(null);
      setQuizForm({ course_id: selectedCourseId || (courses[0]?.id || ''), question: '', options: '["A", "B"]', correct_option_index: 0, order_index: 1, reward_coins: 10 });
    }
    setShowQuizForm(true);
  };

  const saveQuiz = async () => {
    const payload = {
      ...quizForm,
      options: JSON.parse(quizForm.options)
    };
    if (editingQuizId) {
      await supabase.from('quizzes').update(payload).eq('id', editingQuizId);
    } else {
      await supabase.from('quizzes').insert([payload]);
    }
    setShowQuizForm(false);
    fetchQuizzes();
  };

  const deleteQuiz = async (id: string) => {
    if (confirm('Ushbu testni (quiz) o\'chirmoqchimisiz?')) {
      await supabase.from('quizzes').delete().eq('id', id);
      fetchQuizzes();
    }
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
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
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
                      {course.image_url ? <img src={course.image_url} alt="" className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>}
                    </td>
                    <td className="px-4 py-3 font-medium dark:text-white">{course.title}</td>
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
                  <th className="px-4 py-3">Davomiylik</th>
                  <th className="px-4 py-3">Video URL</th>
                  <th className="px-4 py-3 rounded-tr-xl text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-bold text-center text-gray-500">{lesson.order_index}</td>
                    <td className="px-4 py-3 font-medium dark:text-white">{lesson.title}</td>
                    <td className="px-4 py-3 text-gray-500">{(lesson as any).courses?.title || 'Noma\'lum'}</td>
                    <td className="px-4 py-3 text-gray-500">{lesson.duration_minutes} daq</td>
                    <td className="px-4 py-3 text-blue-500 truncate max-w-[150px]">{lesson.video_url || '-'}</td>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
               <h2 className="text-xl font-bold dark:text-white">Testlar ({quizzes.length})</h2>
               <select 
                 value={selectedCourseId} 
                 onChange={(e) => setSelectedCourseId(e.target.value)}
                 className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white outline-none"
               >
                  <option value="">Barcha kurslar</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
               </select>
            </div>
            
            <button onClick={() => openQuizForm()} className="flex items-center gap-2 bg-[#2D5A27] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1f421a] transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Yangi test qo&apos;shish
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl text-center w-16">Tartib</th>
                  <th className="px-4 py-3">Savol</th>
                  <th className="px-4 py-3">Kurs</th>
                  <th className="px-4 py-3">Tanga</th>
                  <th className="px-4 py-3 rounded-tr-xl text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-bold text-center text-gray-500">{quiz.order_index}</td>
                    <td className="px-4 py-3 font-medium dark:text-white truncate max-w-[300px]">{quiz.question}</td>
                    <td className="px-4 py-3 text-gray-500">{(quiz as any).courses?.title || 'Noma\'lum'}</td>
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

      {/* Users Tab Content (Placeholder) */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center text-center py-20">
           <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-500" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Foydalanuvchilar modulli tayyorlanmoqda</h3>
           <p className="text-gray-500 max-w-md">Tez kunda bu yerda ro&apos;yxatdan o&apos;tgan barcha o&apos;quvchilarni ko&apos;rish, blokka tushirish va ularni natijalarini boshqarish imkoniyati qo&apos;shiladi.</p>
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
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Daraja (Boshlang&apos;ich, O&apos;rta...)</label>
                     <input type="text" value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Turkum</label>
                     <input type="text" value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Davomiyligi (daqiqa)</label>
                     <input type="number" value={courseForm.duration_minutes} onChange={e => setCourseForm({...courseForm, duration_minutes: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sovrin (tanga)</label>
                     <input type="number" value={courseForm.reward_coins} onChange={e => setCourseForm({...courseForm, reward_coins: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rasm Manzili (URL)</label>
                   <input type="text" value={courseForm.image_url} onChange={e => setCourseForm({...courseForm, image_url: e.target.value})} placeholder="/images/nomi.png" className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
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
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Video Havolasi (URL)</label>
                   <input type="text" value={lessonForm.video_url} onChange={e => setLessonForm({...lessonForm, video_url: e.target.value})} placeholder="https://www.youtube.com/..." className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tartib Raqami</label>
                     <input type="number" value={lessonForm.order_index} onChange={e => setLessonForm({...lessonForm, order_index: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Daqiqa (Davomiyligi)</label>
                     <input type="number" value={lessonForm.duration_minutes} onChange={e => setLessonForm({...lessonForm, duration_minutes: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
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
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tegishli Kurs</label>
                   <select value={quizForm.course_id} onChange={e => setQuizForm({...quizForm, course_id: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]">
                     <option value="" disabled>Kursni tanlang...</option>
                     {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Savol matni</label>
                   <textarea rows={2} value={quizForm.question} onChange={e => setQuizForm({...quizForm, question: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Variantlar (JSON formatida Array)</label>
                   <textarea rows={2} value={quizForm.options} onChange={e => setQuizForm({...quizForm, options: e.target.value})} placeholder='["Variant A", "Variant B", "Variant C"]' className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF] font-mono text-xs" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">To'g'ri variant indeksi (0 dan boshlanadi)</label>
                     <input type="number" value={quizForm.correct_option_index} onChange={e => setQuizForm({...quizForm, correct_option_index: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tartib Raqami</label>
                     <input type="number" value={quizForm.order_index} onChange={e => setQuizForm({...quizForm, order_index: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sovrin (tanga)</label>
                   <input type="number" value={quizForm.reward_coins} onChange={e => setQuizForm({...quizForm, reward_coins: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                 </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/30">
                 <button onClick={() => setShowQuizForm(false)} className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">Bekor qilish</button>
                 <button onClick={saveQuiz} className="bg-[#2D5A27] text-white px-5 py-2.5 rounded-xl font-medium">Saqlash</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
