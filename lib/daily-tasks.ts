// ============================================================
// Daily Task Generator — Maqsadga bog'liq vazifa templatelar
// ============================================================

export type GoalType = 'grants' | 'soft_skill' | 'hard_skill' | 'language' | 'startup';
export type LevelType = 'beginner' | 'intermediate' | 'advanced';

export interface TaskTemplate {
  title: string;
  description: string;
  coins_reward: number;
}

// Maqsad bo'yicha task templatelar
const TASK_TEMPLATES: Record<GoalType, TaskTemplate[]> = {
  grants: [
    { title: "CV tayyorlash", description: "O'z CV-ingizni yangilang yoki yangidan yozing. Asosiy tajriba va ko'nikmalaringizni kiriting.", coins_reward: 15 },
    { title: "Motivatsion xat yozish", description: "Grant uchun motivatsion xat namunasini tayyorlang. Nima uchun siz eng mos nomzodsiz?", coins_reward: 20 },
    { title: "Grant topish", description: "Bugun kamida 3 ta aktual grant dasturini toping va ro'yxatga oling.", coins_reward: 15 },
    { title: "Donor tashkilotlar tadqiqi", description: "Sohangizdagi 5 ta asosiy donor tashkilotni o'rganing.", coins_reward: 10 },
    { title: "Portfolio yangilash", description: "O'z loyihalaringiz va yutuqlaringizni portfolio sifatida yozib chiqing.", coins_reward: 15 },
    { title: "Grant arizasini to'ldirish", description: "Biror grant dasturiga ariza namunasini to'ldiring (qoralama).", coins_reward: 25 },
    { title: "Grant muvaffaqiyat hikoyalari", description: "Grant yutgan odamlarning muvaffaqiyat hikoyalarini o'qing (kamida 2 ta).", coins_reward: 10 },
    { title: "Loyiha g'oyasi yozish", description: "Grant uchun loyiha g'oyangizni 1 sahifada yozib chiqing.", coins_reward: 20 },
    { title: "Budjet rejasi", description: "Loyihangiz uchun oddiy budjet rejasini tuzing.", coins_reward: 15 },
    { title: "Tavsiya xati so'rash", description: "Ustozingiz yoki hamkasbingizdan tavsiya xati so'rash xatini yozing.", coins_reward: 10 },
    { title: "Deadline kalendar", description: "Yaqin 3 oydagi grant deadlinlarini kalendaringizga kiriting.", coins_reward: 10 },
    { title: "Tarmoqlanish", description: "Grant sohasidagi 1 ta mutaxassis bilan bog'laning (ijtimoiy tarmoqda yoki emailda).", coins_reward: 15 },
  ],

  soft_skill: [
    { title: "Notiqlik mashqi", description: "Oyna oldida 5 daqiqa nutq so'zlang. O'z ovozingizni yozib oling va eshiting.", coins_reward: 15 },
    { title: "Kitob o'qish", description: "Bugun kamida 20 sahifa shaxsiy rivojlanish kitobi o'qing.", coins_reward: 10 },
    { title: "Prezentatsiya tayyorlash", description: "Istalgan mavzuda 5 slaydlik prezentatsiya tayyorlang.", coins_reward: 20 },
    { title: "Aktiv tinglash mashqi", description: "Bugun birov bilan suhbatda 5 daqiqa to'liq diqqat bilan tinglang va qayta fikr bildiring.", coins_reward: 10 },
    { title: "Kundalik yozish", description: "Bugungi kuningiz haqida 200 so'zlik kundalik yozing.", coins_reward: 10 },
    { title: "Tanqidiy fikrlash", description: "Istalgan yangilikni o'qib, uning afzallik va kamchiliklarini tahlil qiling.", coins_reward: 15 },
    { title: "Jamoaviy ish mashqi", description: "Bugun biror odamga yordam bering yoki jamoa loyihasida ishtirok eting.", coins_reward: 15 },
    { title: "Stress boshqarish", description: "5 daqiqa meditatsiya yoki nafas olish mashqini bajaring.", coins_reward: 10 },
    { title: "Networking", description: "Yangi biror odam bilan professional suhbat boshlang.", coins_reward: 15 },
    { title: "TED Talk ko'rish", description: "Bitta TED Talk videosini ko'ring va asosiy g'oyalarni yozing.", coins_reward: 10 },
    { title: "Lift pitch tayyorlash", description: "O'zingiz haqida 30 soniyalik taqdimot tayyorlang.", coins_reward: 15 },
    { title: "Maqola yozish", description: "O'zingizni qiziqtirgan mavzuda 300 so'zlik maqola yozing.", coins_reward: 20 },
  ],

  hard_skill: [
    { title: "Kod yozish mashqi", description: "Kamida 30 daqiqa dasturlash mashq qiling (istalgan til).", coins_reward: 20 },
    { title: "Portfolio yangilash", description: "O'z texnik portfoliongizni yangilang yoki yangi loyiha qo'shing.", coins_reward: 15 },
    { title: "Yangi texnologiya o'rganish", description: "Bugun yangi bir framework/texnologiya haqida 1 ta tutorial ko'ring.", coins_reward: 15 },
    { title: "GitHub loyiha", description: "GitHub profilingizni yangilang, yangi repo yarating yoki mavjud repo'ga contribution qiling.", coins_reward: 20 },
    { title: "Algorithm masala", description: "LeetCode/HackerRank'dan 1 ta algorithm masalasini yeching.", coins_reward: 15 },
    { title: "Texnik maqola o'qish", description: "Sohangizdagi 1 ta texnik blog postni o'qing va xulosa yozing.", coins_reward: 10 },
    { title: "Freela loyiha izlash", description: "Freelance platformalardan 3 ta loyiha topib, ularni tahlil qiling.", coins_reward: 15 },
    { title: "Online kurs davom", description: "O'rganayotgan online kursingizni 1 soat davom eting.", coins_reward: 20 },
    { title: "Debugging mashqi", description: "O'z kodingizdan bug toping va tuzating, yoki debugging challenge bajaring.", coins_reward: 15 },
    { title: "Texnik intervyu tayyorgarlik", description: "1 ta texnik intervyu savoliga javob tayyorlang.", coins_reward: 15 },
    { title: "Open source contribution", description: "Istalgan open source loyihaga pull request yoki issue yozing.", coins_reward: 25 },
    { title: "Tool/IDE o'rganish", description: "Ishlayotgan tool yoki IDE'ngizning 3 ta yangi shortcut/xususiyatini o'rganing.", coins_reward: 10 },
  ],

  language: [
    { title: "20 ta yangi so'z o'rganish", description: "Bugun 20 ta yangi so'z yod oling va ularni jumlalarda ishlating.", coins_reward: 15 },
    { title: "Audio tinglash", description: "O'rganayotgan tilda 15 daqiqa podcast yoki audio eshiting.", coins_reward: 10 },
    { title: "Matn yozish", description: "O'rganayotgan tilda 150 so'zlik matn yozing (kundalik, xat yoki insho).", coins_reward: 15 },
    { title: "Film/serial ko'rish", description: "O'rganayotgan tilda 20 daqiqa film yoki serial ko'ring (subtitrsiz yoki subtitrlari bilan).", coins_reward: 10 },
    { title: "Grammatika mashqi", description: "1 ta grammatika mavzusini o'rganing va 10 ta mashq bajaring.", coins_reward: 15 },
    { title: "Gaplashish mashqi", description: "O'rganayotgan tilda 5 daqiqa ovozli yozuv qiling (monolog).", coins_reward: 15 },
    { title: "Flashcard yaratish", description: "Bugun o'rgangan so'zlaringiz uchun flashcard yarating.", coins_reward: 10 },
    { title: "Kitob o'qish", description: "O'rganayotgan tilda kamida 5 sahifa kitob o'qing.", coins_reward: 10 },
    { title: "Tarjima mashqi", description: "O'zbek tilidan o'rganayotgan tilga 5 ta jumla tarjima qiling.", coins_reward: 10 },
    { title: "Yangiliklar o'qish", description: "O'rganayotgan tilda 1 ta yangilik maqolasini o'qing va xulosa yozing.", coins_reward: 15 },
    { title: "Til almashinuv partnyor", description: "Til almashinuv ilova yoki saytdan partner toping va suhbat boshlang.", coins_reward: 20 },
    { title: "Til testi", description: "O'z darajangizni tekshirish uchun qisqa online test bajaring.", coins_reward: 15 },
  ],

  startup: [
    { title: "Biznes model canvas", description: "O'z g'oyangiz uchun Biznes Model Canvas to'ldiring yoki yangilang.", coins_reward: 20 },
    { title: "MVP loyiha rejasi", description: "MVP (Minimal Viable Product) uchun xususiyatlar ro'yxatini tuzing.", coins_reward: 20 },
    { title: "Raqobatchilar tahlili", description: "Sohangizdagi 3 ta raqobatchini tahlil qiling: kuchli va zaif tomonlari.", coins_reward: 15 },
    { title: "Mijoz intervyusi", description: "Potentsial mijoz bilan suhbat o'tkazing va ularning muammolarini aniqlang.", coins_reward: 25 },
    { title: "Pitch deck tayyorlash", description: "Investorlar uchun 10 slaydlik pitch deck tayyorlang yoki yangilang.", coins_reward: 20 },
    { title: "Moliyaviy prognoz", description: "Startupingiz uchun 6 oylik daromad/xarajat prognozini tuzing.", coins_reward: 15 },
    { title: "Marketing strategiya", description: "O'z mahsulotingiz uchun oddiy marketing rejasini yozing.", coins_reward: 15 },
    { title: "Startup kitob o'qish", description: "Startup haqida kitob yoki maqola o'qing (kamida 20 sahifa).", coins_reward: 10 },
    { title: "Landing page yaratish", description: "Mahsulotingiz uchun oddiy landing page yarating yoki dizayn qiling.", coins_reward: 20 },
    { title: "Investor izlash", description: "Sohangizdagi 3 ta potentsial investor yoki akselerator topib yozing.", coins_reward: 15 },
    { title: "A/B test rejasi", description: "Biror bir xususiyat uchun A/B test rejasini tuzing.", coins_reward: 15 },
    { title: "Jamoa rejasi", description: "Startupingiz uchun ideal jamoa tuzilmasini yozing.", coins_reward: 10 },
  ],
};

/**
 * Berilgan maqsad (goal) uchun kunlik tasklar generatsiya qiladi.
 * Oxirgi 7 kunlik tarixni tekshirib, takrorlanmaslikni ta'minlaydi.
 * @param goal - User tanlagan maqsad
 * @param recentTitles - Oxirgi 7 kunda berilgan task sarlavhalari
 * @param count - Nechta task generatsiya qilish (1-3)
 * @returns TaskTemplate[] — Tanlangan tasklar
 */
export function generateDailyTasks(
  goal: GoalType,
  recentTitles: string[] = [],
  count: number = 3
): TaskTemplate[] {
  const templates = TASK_TEMPLATES[goal] || TASK_TEMPLATES.soft_skill;
  
  // Oxirgi 7 kunda ishlatilmagan tasklarni filter qilish
  const available = templates.filter(t => !recentTitles.includes(t.title));
  
  // Agar yetarli task qolmasa, barchasidan tanlash
  const pool = available.length >= count ? available : templates;
  
  // Random tanlash (Fisher-Yates shuffle)
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Ertangi kun uchun preview tasklar
 */
export function getNextDayPreview(
  goal: GoalType,
  todayTitles: string[] = [],
  recentTitles: string[] = []
): TaskTemplate[] {
  const allExclude = [...new Set([...todayTitles, ...recentTitles])];
  return generateDailyTasks(goal, allExclude, 2);
}

/**
 * Maqsad nomini o'zbek tilida qaytaradi
 */
export function getGoalLabel(goal: GoalType): string {
  const labels: Record<GoalType, string> = {
    grants: 'Grantlar',
    soft_skill: 'Soft skill',
    hard_skill: 'Hard skill',
    language: 'Til o\'rganish',
    startup: 'Startup',
  };
  return labels[goal] || goal;
}

/**
 * Daraja nomini o'zbek tilida qaytaradi
 */
export function getLevelLabel(level: LevelType): string {
  const labels: Record<LevelType, string> = {
    beginner: 'Boshlang\'ich',
    intermediate: 'O\'rta',
    advanced: 'Yuqori',
  };
  return labels[level] || level;
}

/**
 * Maqsad uchun emoji qaytaradi
 */
export function getGoalEmoji(goal: GoalType): string {
  const emojis: Record<GoalType, string> = {
    grants: '🏆',
    soft_skill: '🧠',
    hard_skill: '💻',
    language: '🌍',
    startup: '🚀',
  };
  return emojis[goal] || '📌';
}
