'use client';

import { ShoppingBag, Gift, Crown, Sparkles, Lock } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

const fallbackShopItems = [
  { id: 1, name: 'Premium Badge', description: 'Profilingizda maxsus nishon ko\'rsatiladi', price: 500, icon_name: 'Crown', color: 'from-amber-400 to-orange-500', available: true },
  { id: 2, name: 'AI Mentor Pro', description: 'Cheksiz AI suhbat va shaxsiy maslahatlar', price: 1000, icon_name: 'Sparkles', color: 'from-purple-400 to-indigo-500', available: true },
  { id: 3, name: 'Sertifikat Ramkasi', description: 'Sertifikatlaringiz uchun maxsus dizayn', price: 300, icon_name: 'Gift', color: 'from-pink-400 to-rose-500', available: true },
  { id: 4, name: 'Maxsus Avatar', description: 'Profil rasmingiz uchun premium ramka', price: 200, icon_name: 'Crown', color: 'from-emerald-400 to-teal-500', available: true },
];

const iconMap: { [key: string]: any } = {
  'Crown': Crown,
  'Sparkles': Sparkles,
  'Gift': Gift,
  'Lock': Lock,
  'ShoppingBag': ShoppingBag
};

export default function ShopPage() {
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [purchasedNames, setPurchasedNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchShopData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch shop items
      const { data: itemsData, error: itemsError } = await supabase
        .from('shop_items')
        .select('*')
        .order('price', { ascending: true });

      const { data: coinsData } = await supabase
        .from('user_coins')
        .select('amount')
        .eq('user_id', user.id);

      // Fetch purchased items
      const purchasesRes = await fetch('/api/shop');
      const purchasesData = await purchasesRes.json();

      if (isMounted) {
        if (!itemsError && itemsData && itemsData.length > 0) {
          setShopItems(itemsData);
        } else {
          setShopItems(fallbackShopItems);
        }

        if (coinsData) {
          const total = coinsData.reduce((s, c) => s + (c.amount || 0), 0);
          setBalance(total);
        }

        if (purchasesData?.purchases) {
          const pNames = new Set<string>();
          purchasesData.purchases.forEach((p: any) => pNames.add(p.item_name));
          setPurchasedNames(pNames);
        }

        setLoading(false);
      }
    };

    fetchShopData();
    return () => { isMounted = false; };
  }, []);

  const handlePurchase = async (item: any) => {
    if (balance < item.price) {
      alert("Xarid qilish uchun tangalaringiz yetarli emas!");
      return;
    }

    setPurchasingId(item.id);
    
    try {
      const res = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: item.name,
          item_type: 'badge', // Default for now
          price: item.price
        })
      });

      if (res.ok) {
        setBalance(prev => prev - item.price);
        setPurchasedNames(prev => new Set(prev).add(item.name));
        alert(`${item.name} muvaffaqiyatli xarid qilindi!`);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Xaridni amalga oshirishda xatolik yuz berdi.");
      }
    } catch (error) {
      alert("Xatolik yuz berdi.");
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F3F4F6] dark:bg-[#111827] transition-colors duration-300">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-[15px] sm:px-8 z-40 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#A8E6CF] to-[#2D5A27] flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold dark:text-white">Do&apos;kon</h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <LanguageSwitcher />
          <div className="flex items-center gap-2 bg-[#F3F4F6] dark:bg-gray-800 px-4 py-2 rounded-full transition-colors duration-300">
            <span className="text-[10px] bg-yellow-400 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white shadow-sm">💰</span>
            {loading ? (
              <span className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse inline-block" />
            ) : (
              <>
                <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 hidden sm:inline-block transition-colors">{balance.toLocaleString()} Tangalar</span>
                <span className="font-bold text-sm text-[#1F2937] dark:text-gray-200 sm:hidden transition-colors">{balance.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-[15px] sm:px-8 py-6 sm:py-8 pb-24 max-w-7xl mx-auto w-full">
        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-br from-[#2D5A27] to-[#1a3816] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#A8E6CF]/20 rounded-full mix-blend-overlay filter blur-[80px] animate-float-slow pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/10 rounded-full mix-blend-overlay filter blur-[60px] animate-float-medium pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A8E6CF]/20 text-[#A8E6CF] text-xs font-bold mb-4 border border-[#A8E6CF]/30 shadow-[0_0_15px_rgba(168,230,207,0.3)]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Do'kon ochildi!
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Tangalaringizni sarflang!</h1>
            <p className="text-[#A8E6CF] max-w-lg text-xs sm:text-sm md:text-base">
              Kurslarni tugatib to&apos;plagan tangalaringiz bilan maxsus badgelar, premium funksiyalar va boshqa sovg&apos;alarni sotib oling.
            </p>
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shopItems.map((item) => {
            const Icon = iconMap[item.icon_name] || Gift;
            const isPurchased = purchasedNames.has(item.name);
            const isPurchasing = purchasingId === item.id;
            
            return (
              <div key={item.id} className={`bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[28px] overflow-hidden shadow-sm border ${isPurchased ? 'border-[#2D5A27]/50 dark:border-[#A8E6CF]/50 ring-2 ring-[#2D5A27]/20 dark:ring-[#A8E6CF]/20' : 'border-gray-100 dark:border-gray-800'} flex flex-col group hover:shadow-xl transition-all duration-300 relative`}>
                {/* Locked overlay */}
                {!item.available && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Lock className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Tez kunda ochiladi</span>
                  </div>
                )}

                {/* Gradient top / Image */}
                <div className={`h-40 relative flex items-center justify-center overflow-hidden ${!item.image_url ? 'bg-gradient-to-br ' + item.color : ''}`}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-16 h-16 text-white/80" />
                  )}
                  {isPurchased && (
                    <div className="absolute top-4 right-4 bg-white/40 backdrop-blur-md rounded-full p-2 z-10">
                       <span className="text-[#2D5A27] font-bold text-xs">Olingan ✅</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-yellow-400 w-4 h-4 rounded-full flex items-center justify-center font-bold text-white">💰</span>
                      <span className="font-bold text-sm text-[#2D5A27] dark:text-[#A8E6CF]">{item.price}</span>
                    </div>
                    {isPurchased ? (
                      <button disabled className="px-4 py-2 bg-[#2D5A27]/10 dark:bg-[#A8E6CF]/10 text-[#2D5A27] dark:text-[#A8E6CF] rounded-lg sm:rounded-xl text-xs font-bold cursor-not-allowed border border-[#2D5A27]/20 dark:border-[#A8E6CF]/20">
                        Faol ✅
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePurchase(item)}
                        disabled={isPurchasing || balance < item.price || !item.available}
                        className={`px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
                          balance >= item.price && item.available
                            ? 'bg-[#2D5A27] hover:bg-[#1a3816] text-white dark:bg-[#A8E6CF] dark:hover:bg-[#86d4b8] dark:text-[#111827] shadow-sm hover:shadow active:scale-[0.98]'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isPurchasing ? 'Kuting...' : 'Sotib olish'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
