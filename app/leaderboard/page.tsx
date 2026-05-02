'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Star, Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Image from 'next/image';
import Link from 'next/link';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string;
  current_level: number;
  total_xp: number;
  rank: number;
}

const LEVEL_NAMES = ['Yangi boshlovchi', 'Faol o\'quvchi', 'Tajribali', 'Ekspert', 'Usta'];
const LEVEL_COLORS = ['text-gray-500', 'text-blue-500', 'text-green-500', 'text-purple-500', 'text-amber-500'];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard?limit=50');
        const data = await res.json();
        setEntries(data.leaderboard || []);
        setCurrentUserId(data.current_user_id || '');
      } catch (e) {
        console.error('Leaderboard xatolik:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-400">{rank}</span>;
  };

  const getRankBg = (rank: number, isMe: boolean) => {
    if (isMe) return 'bg-[#A8E6CF]/20 dark:bg-[#A8E6CF]/10 border-[#2D5A27]/30 dark:border-[#A8E6CF]/30';
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800';
    return 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800';
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F3F4F6] dark:bg-[#111827] transition-colors duration-300">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-[15px] sm:px-8 z-40 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold dark:text-white">Reyting</h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Content */}
      <div className="px-[15px] sm:px-8 py-6 sm:py-8 pb-24 max-w-3xl mx-auto w-full">
        {/* Banner */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full mix-blend-overlay filter blur-[60px] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-xs font-bold mb-3 border border-white/30">
              <Star className="w-3.5 h-3.5" />
              Eng yaxshilar
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Reytinglar jadvali</h1>
            <p className="text-white/80 text-sm">Eng faol o&apos;quvchilar va ularning yutuqlari</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hali ma&apos;lumot yo&apos;q</h3>
            <p className="text-gray-500 dark:text-gray-400">Vazifalarni bajaring va birinchi bo&apos;ling!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => {
              const isMe = entry.user_id === currentUserId;
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all ${getRankBg(entry.rank, isMe)} ${isMe ? 'ring-2 ring-[#2D5A27]/20 dark:ring-[#A8E6CF]/20' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-8 flex-shrink-0 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#A8E6CF] to-[#2D5A27] flex-shrink-0 overflow-hidden border-2 border-white dark:border-gray-800">
                    {entry.avatar_url ? (
                      <Image src={entry.avatar_url} alt="" width={48} height={48} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                        {entry.display_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {entry.display_name || 'Foydalanuvchi'}
                        {isMe && <span className="text-xs font-medium text-[#2D5A27] dark:text-[#A8E6CF] ml-1">(Siz)</span>}
                      </p>
                    </div>
                    <p className={`text-xs font-medium ${LEVEL_COLORS[entry.current_level - 1] || 'text-gray-500'}`}>
                      Level {entry.current_level}: {LEVEL_NAMES[entry.current_level - 1] || 'Yangi'}
                    </p>
                  </div>

                  {/* XP */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#2D5A27] dark:text-[#A8E6CF]" />
                      {entry.total_xp.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
