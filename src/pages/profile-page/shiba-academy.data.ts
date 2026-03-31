export type SkillLevel =
  | "Base"
  | "Safety"
  | "Tricks"
  | "Advanced"
  | "Mastery";

export type Skill = {
  id: string;
  level: SkillLevel;
  name: string;
  icon: string;
  desc: string;
  tip: string;
};

export const shibaSkills: Skill[] = [
  { id: "sit", level: "Base", name: "Сидеть", icon: "🪑", desc: "Базовая выдержка.", tip: "Сибы часто садятся боком — поправляй кусочком за нос." },
  { id: "wait", level: "Base", name: "Ждать", icon: "⏳", desc: "Выдержка перед миской.", tip: "Это база иерархии: еда только после разрешения." },
  { id: "lie", level: "Base", name: "Лежать", icon: "😴", desc: "Полный контакт с землей.", tip: "Для сибы это поза подчинения. Не дави, если упирается — играй в 'следи за рукой'." },
  { id: "look", level: "Base", name: "Смотри на меня", icon: "👀", desc: "Контакт глаз.", tip: "Ключ к управлению в городе. Сибы буравят взглядом, но только если ты реально интересен." },
  { id: "place", level: "Base", name: "Место", icon: "🛏️", desc: "Идти на лежак.", tip: "Бросай лакомство на лежак, пока не начнет прибегать по слову." },
  { id: "stand", level: "Base", name: "Стоять", icon: "🧍", desc: "Фиксация стойки.", tip: "Удобно для осмотра лап и визитов к ветеринару." },

  { id: "come", level: "Safety", name: "Ко мне", icon: "🏃", desc: "Главная команда жизни.", tip: "НИКОГДА не ругай, если пришла сама. Только джекпот из лакомств!" },
  { id: "spit", level: "Safety", name: "Фу / Плюнь", icon: "🚫", desc: "Бросить гадость на улице.", tip: "Предложи обмен на что-то более вкусное, не борись силой." },
  { id: "no", level: "Safety", name: "Нельзя", icon: "⛔", desc: "Полный запрет действия.", tip: "Работает только если есть альтернатива. Сиба решит, что 'нельзя' — это 'просто попробуй быстрее'." },
  { id: "heel", level: "Safety", name: "Рядом", icon: "🚶‍♂️", desc: "Идти у ноги без натяга.", tip: "Самая сложная база. Начни у стены, чтобы не вырывалась вперед." },
  { id: "stop", level: "Safety", name: "Стоп", icon: "✋", desc: "Экстренная остановка.", tip: "Для резких рывков перед дорогой. Отрабатывай на длинной дистанции." },
  { id: "leave", level: "Safety", name: "Брось", icon: "🍗➡️👤", desc: "Игнорировать еду/животное.", tip: "Учи через игру: меняй 'вкусняшку' на 'супервкусняшку'." },

  { id: "bunny", level: "Tricks", name: "Зайка", icon: "🐰", desc: "Стойка на задних лапах.", tip: "У сиб сильная спина, им это дается легко и весело." },
  { id: "ignore", level: "Tricks", name: "Игнор", icon: "🕶️", desc: "Не реагировать на птиц.", tip: "Самый сложный уровень дзен для охотника." },
  { id: "highfive", level: "Tricks", name: "Дай пять", icon: "🖐️", desc: "Касание лапой руки.", tip: "Сибы не любят, когда трогают лапы. Преврати это в игру." },
  { id: "spin", level: "Tricks", name: "Кружись", icon: "🔄", desc: "Вращение вокруг оси.", tip: "Используй лакомство как 'приманку-нос'." },
  { id: "bow", level: "Tricks", name: "Поклон", icon: "🙇", desc: "Передние лапы на земле, попа вверх.", tip: "Это приглашение к игре. Легко учится через 'лежать' + движение лакомства вниз." },
  { id: "crawl", level: "Tricks", name: "Ползи", icon: "🐍", desc: "Пластунский по-собачьи.", tip: "Из положения 'лежа' тяни лакомство вперед по земле." },
  { id: "kiss", level: "Tricks", name: "Поцелуй", icon: "😘", desc: "Коснуться носом щеки.", tip: "Сиба не будет облизывать (не королевское дело), но носом ткнет охотно." },
  { id: "paw", level: "Tricks", name: "Дай лапу", icon: "🐾", desc: "Кладет лапу в руку.", tip: "Классика. Если не дает, легонько щекочи подушечку." },
  { id: "circle", level: "Tricks", name: "Восьмерка", icon: "8️⃣", desc: "Проход между ног.", tip: "Впечатляющий трюк для улицы. Начни с обхода одной ноги." },
  { id: "speak", level: "Tricks", name: "Голос", icon: "🔊", desc: "Подать голос.", tip: "Сибы часто 'разговаривают'. Лови момент, когда вот-вот захочет сказать, и командуй." },
  { id: "quiet", level: "Tricks", name: "Тихо", icon: "🤫", desc: "Прекратить лай.", tip: "Сначала научи 'голос', потом учи замолкать за вкусняшку." },

  { id: "tidy", level: "Advanced", name: "Убери игрушки", icon: "🧸➡️📦", desc: "Складывает вещи в коробку.", tip: "Сначала просто бросай игрушку в ящик, потом учи брать из пасти." },
  { id: "door", level: "Advanced", name: "Закрой дверь", icon: "🚪", desc: "Толкает дверь носом/лапой.", tip: "Начни с привязанной тряпкой ручки, чтобы сиба поняла механизм." },
  { id: "fetch", level: "Advanced", name: "Апорт", icon: "🎾", desc: "Принести предмет.", tip: "Сибы не ретриверы. Если не несет, беги сама — проснется азарт." },
  { id: "back", level: "Advanced", name: "Назад", icon: "🔙", desc: "Пятиться назад.", tip: "Иди на сибу, чтобы инстинктивно отступала. Отличный трюк для лифтов." },
  { id: "jump", level: "Advanced", name: "Барьер", icon: "🏃‍♂️➡️🧱", desc: "Прыжок через препятствие.", tip: "Не увлекайся до 1.5 лет, пока не сформировались суставы." },
  { id: "weave", level: "Advanced", name: "Змейка", icon: "🐍🚶", desc: "Обходит ноги на ходу.", tip: "Сначала на месте, потом в движении. Выглядит эффектно на прогулке." },
  { id: "dead", level: "Advanced", name: "Умри", icon: "💀", desc: "Перекат на бок.", tip: "Из 'лежа' веди лакомство за холку, чтобы сиба завалилась набок." },
  { id: "carry", level: "Advanced", name: "Носи", icon: "🛍️", desc: "Несет предмет в зубах.", tip: "Начни с легкой сумки для прогулок. Сибы любят быть полезными, если это их идея." },
  { id: "touch", level: "Advanced", name: "Коснись", icon: "🎯", desc: "Касается носом цели (стикер, рука).", tip: "База для любого продвинутого трюка. Учится за 5 минут." },

  { id: "patience", level: "Mastery", name: "Дзен", icon: "🧘", desc: "Ждет с лакомством на носу.", tip: "Если сиба не сдула печенье за секунду — ты достиг просветления." },
  { id: "turnoff", level: "Mastery", name: "Выключи свет", icon: "💡➡️❌", desc: "Нажимает на выключатель носом.", tip: "Пик эволюции. Требует идеального 'коснись'." },
  { id: "skate", level: "Mastery", name: "Скейтборд", icon: "🛹", desc: "Катается на доске.", tip: "Сибы обожают быть в центре внимания. Начинай с неподвижной доски." },
  { id: "hold", level: "Mastery", name: "Держи", icon: "🤲", desc: "Держит предмет в пасти, пока не скажешь 'дай'.", tip: "Антипод 'плюнь'. Учит контролю инстинктов." },
  { id: "read", level: "Mastery", name: "Читаем", icon: "📖", desc: "Смотрит на картинку в книге.", tip: "Для фотосессий. Сиба сделает вид, что разбирается в литературе." },
  { id: "balance", level: "Mastery", name: "Баланс", icon: "⚖️", desc: "Держит равновесие с предметом на голове.", tip: "Начинай с легкого пластикового стаканчика." },
];

export type ShibaRank = {
  id: string;
  rank: string;
  icon: string;
  minCommands: number;
  bossQuote: string;
};

const ACHIEVEMENT_TARGET_PER_KIND = 20;

export const shibaRanks: ShibaRank[] = [
  { id: "stubborn_fox", rank: "Упрямый Лис", icon: "🦊", minCommands: 0, bossQuote: "🤨 \"Сидеть? Нет, я постою. Вон там. В другой комнате.\"" },
  { id: "selective_hearing", rank: "Избирательный Слух", icon: "👂", minCommands: 3, bossQuote: "🎧 \"Слышу. Но ты сначала покажи, что у тебя в руке.\"" },
  { id: "treat_driven", rank: "Лакомый Хвост", icon: "🍖", minCommands: 8, bossQuote: "🍪 \"Без печенья мы такие команды не учили. Приходите завтра.\"" },
  { id: "little_negotiator", rank: "Маленький Переговорщик", icon: "🤝", minCommands: 15, bossQuote: "💼 \"Я сел. Я дал лапу. Где мой гонорар? По закону полагается две.\"" },
  { id: "honorary_samurai", rank: "Почетный Самурай", icon: "⚔️", minCommands: 25, bossQuote: "🗡️ \"Я делаю это не ради печенья. Я делаю это, потому что ты мой человек. Но печенье все равно дай.\"" },
  { id: "crowd_pleaser", rank: "Звезда Площадки", icon: "🌟", minCommands: 35, bossQuote: "🎭 \"При зрителях? Легко. Дома? Мы не договаривались на такое.\"" },
  { id: "paw_of_peace", rank: "Лапа Мира", icon: "☮️", minCommands: 45, bossQuote: "🕊️ \"Белка? А, да. Пусть живет. У нас есть дела поважнее — вон тот кусочек сыра на скамейке.\"" },
  { id: "telepathic_bond", rank: "Телепатическая Связь", icon: "🔮", minCommands: 55, bossQuote: "🧠 \"Не говори вслух. Я знаю. Я всегда знаю, где лежит вторая пачка вкусняшек.\"" },
  { id: "legendary_foxtrot", rank: "Легендарный Фокстрот", icon: "🏆", minCommands: 70, bossQuote: "🎖️ \"Я не просто сиба-ину. Я — сиба-ину, который умеет закрывать дверь. Запомните это.\"" },
  { id: "shiba_sensei", rank: "Шиба-Сэнсэй", icon: "🧘", minCommands: 85, bossQuote: "🍃 \"Учу щенков, спокоен как Будда.\"" },
  { id: "mythical_kitsune", rank: "Мифический Китсунэ", icon: "🦊✨", minCommands: 100, bossQuote: "🌙 \"Ты думал, ты дрессируешь меня? Нет. Это я дрессировал тебя всё это время. И ты сдал экзамен.\"" },
];

export const getShibaRank = (completedCount: number) => {
  const total = shibaSkills.length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;
  if (completedCount <= 0) {
    return { rank: null, percent };
  }

  let current = shibaRanks[0];
  for (const rank of shibaRanks) {
    if (percent >= rank.minCommands) current = rank;
  }
  return { rank: current, percent };
};

export const getAchievementPercent = (count: number) => {
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  return Math.min(100, Math.round((safeCount / ACHIEVEMENT_TARGET_PER_KIND) * 100));
};

export const getSibaLevel = (params: {
  cafe: number;
  park: number;
  groomer: number;
  completedCommands: number;
}) => {
  const cafePercent = getAchievementPercent(params.cafe);
  const parkPercent = getAchievementPercent(params.park);
  const groomerPercent = getAchievementPercent(params.groomer);
  const achievementsPercent = Math.round((cafePercent + parkPercent + groomerPercent) / 3);
  const academyPercent = getShibaRank(params.completedCommands).percent;
  const totalPercent = Math.round((achievementsPercent + academyPercent) / 2);
  const level = totalPercent === 0 ? 0 : Math.max(1, Math.round(totalPercent / 10));

  return {
    level,
    totalPercent,
    achievementsPercent,
    academyPercent,
    cafePercent,
    parkPercent,
    groomerPercent,
  };
};

export const SKILL_TABS: Array<{ key: SkillLevel; title: string }> = [
  { key: "Base", title: "База" },
  { key: "Safety", title: "Безопасность" },
  { key: "Tricks", title: "Трюки" },
  { key: "Advanced", title: "Продвинутые" },
  { key: "Mastery", title: "Мастерство" },
];
