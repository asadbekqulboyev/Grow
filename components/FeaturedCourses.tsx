import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight, Clock, Coins, PlayCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function FeaturedCourses() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // Agar bazada umuman kurs bo'lmasa, placeholder'lar chiqaramiz
  const displayCourses = courses && courses.length > 0 ? courses : [
    { id: '1', title: 'Notiqlik va omma oldida ishlash', description: 'Odamlar oldida ishonch bilan gapirishni va hayajonni bosishni o\'rganing.', category: 'Notiqlik', level: 'Boshlang\'ich', reward_coins: 100, author: 'Asadbek' },
    { id: '2', title: 'SMM va Marketing', description: 'Ijtimoiy tarmoqlarda o\'z brendingizni yaratish va to\'g\'ri auditoriyani jalb qilish.', category: 'SMM', level: 'O\'rta', reward_coins: 150, author: 'Asadbek' },
    { id: '3', title: 'Vaqtni qanday boshqarish kerak', description: 'Vaqtingizni shijoat va samaradorlik bilan boshqarish orqali maqsadlarga erishish.', category: 'Time Management', level: 'Mukammal', reward_coins: 200, author: 'Asadbek' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayCourses.map((course: any) => (
        <div key={course.id} className="bg-[#F3F4F6] dark:bg-gray-800 rounded-3xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 border border-transparent dark:border-gray-700 hover:shadow-xl hover:shadow-[#A8E6CF]/10 flex flex-col relative group">
          
          <div className="h-48 w-full relative overflow-hidden bg-gradient-to-br from-[#A8E6CF] to-[#2D5A27]">
            {course.image_url && (
                <Image 
                  src={course.image_url} 
                  alt={course.title}
                  fill
                  className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
            )}
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm z-10 border border-white/20">
              {course.category}
            </div>
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
               <Coins className="w-3.5 h-3.5" /> +{course.reward_coins}
            </div>
          </div>
          
          <div className="p-6 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-[#2D5A27] dark:group-hover:text-[#A8E6CF] transition-colors leading-tight line-clamp-2 pr-4">{course.title}</h3>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-[8px]">
                {(course.author?.[0] || 'A').toUpperCase()}
              </div>
              {course.author || 'Asadbek'}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">{course.description}</p>
            
            <div className="mt-auto">
               <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4 px-1">
                  <span className="flex items-center gap-1 font-medium bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md">{course.level}</span>
               </div>
               <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                 <Link href="/login" className="w-full py-2.5 bg-white dark:bg-gray-700 hover:bg-[#A8E6CF]/20 dark:hover:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-gray-100 dark:border-gray-600">
                   <PlayCircle className="w-4 h-4" /> Boshlash &rarr;
                 </Link>
               </div>
            </div>
          </div>
          
        </div>
      ))}
    </div>
  );
}
