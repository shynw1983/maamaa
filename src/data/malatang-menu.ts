export type MenuChoice = {
  id: string;
  name: string;
  displayNames?: Record<string, string>;
  price: number;
  note?: string;
};

export type MenuSection = {
  id: string;
  title: string;
  displayNames?: Record<string, string>;
  limit: number;
  items: MenuChoice[];
};

// Web予約 prices are 80% of the corresponding Uber Eats prices, rounded to the nearest ¥10.
export const baseSoup: MenuChoice = {
  id: "mala-soup",
  name: "旨味マーラータンスープ",
  price: 330,
  note: "ご注文を受けてから一杯ずつ仕上げる、まぁ麻のベーススープです。",
};

export const medicinalSpiceOptions: MenuChoice[] = [
  { id: "with-spice", name: "薬膳スパイスあり", price: 0, note: "おすすめ" },
  { id: "without-spice", name: "薬膳スパイスなし", price: 0 },
];

export const heatLevels: MenuChoice[] = [
  { id: "normal", name: "普通辛", price: 0 },
  { id: "medium", name: "中辛", price: 40 },
  { id: "hot", name: "大辛", price: 60, note: "おすすめ" },
  { id: "stress", name: "激辛", price: 100 },
  { id: "oni", name: "鬼の一歩手前", price: 200 },
  { id: "shura", name: "修羅の道", price: 400 },
  { id: "jigoku", name: "地獄の業火", price: 800 },
];

export const numbLevels: MenuChoice[] = [
  { id: "tiny", name: "微シビ", price: 0 },
  { id: "little", name: "ちょいシビ", price: 0 },
  { id: "numb", name: "シビレ", price: 30 },
  { id: "biriri", name: "ビリリ", price: 70 },
  { id: "biribiri", name: "ビリビリ", price: 100 },
];

export const specialFlavors: MenuChoice[] = [
  { id: "aroma", name: "香酢", price: 120, note: "おすすめ" },
  { id: "shacha", name: "サーチャージャン / 沙茶醤", price: 120 },
  { id: "fermented-tofu", name: "発酵豆腐タレ", price: 120 },
  { id: "extra-spice", name: "薬膳スパイス追加", price: 120 },
];

export const menuSections: MenuSection[] = [
  {
    id: "noodles",
    title: "麺の種類",
    limit: 2,
    items: [
      { id: "wide-harusame", name: "もちもち板春雨", price: 140, note: "おすすめ" },
      { id: "harusame", name: "春雨", price: 140 },
      { id: "beef-noodle", name: "牛筋麺", price: 220 },
      { id: "tteokbokki", name: "トッポッキ", price: 170 },
      { id: "sweet-potato-noodle", name: "さつまいも麺", price: 140 },
    ],
  },
  {
    id: "base",
    title: "ベーシックトッピング",
    limit: 50,
    items: [
      { id: "squid-ball", name: "特選イカ団子1個", price: 200 },
      { id: "pork-ball", name: "特選豚団子1個", price: 200 },
      { id: "beef-ball", name: "特選牛肉団子1個", price: 200 },
      { id: "crab-ball", name: "魚卵入り蟹団子1個", price: 220 },
      { id: "wonton", name: "特製ワンタン1個", price: 120 },
      { id: "tsukune", name: "華味鳥つくね1個", price: 120 },
      { id: "tofu-skin", name: "火鍋豆皮", price: 160 },
      { id: "quail-egg", name: "うずらの卵1個", price: 100 },
      { id: "shrimp-ball", name: "特選えび団子1個", price: 220 },
      { id: "shrimp-gyoza", name: "ほうれん草えび餃子1個", price: 220 },
      { id: "fresh-yuba", name: "生腐竹", price: 220 },
    ],
  },
  {
    id: "standard",
    title: "スタンダードトッピング",
    limit: 100,
    items: [
      { id: "sausage", name: "ウインナー1個", price: 120 },
      { id: "eringi", name: "エリンギ", price: 220 },
      { id: "enoki", name: "えのき", price: 220 },
      { id: "okra", name: "オクラ1本", price: 220 },
      { id: "kanikama", name: "カニカマ", price: 220 },
      { id: "cabbage", name: "キャベツ", price: 220 },
      { id: "asparagus", name: "グリーンアスパラガス1本", price: 220 },
      { id: "sweet-potato", name: "さつまいも", price: 200 },
      { id: "shimeji", name: "しめじ", price: 220 },
      { id: "potato", name: "じゃがいも", price: 200 },
      { id: "spam", name: "スパム1枚", price: 220 },
      { id: "bok-choy", name: "チンゲン菜", price: 280 },
      { id: "nira", name: "ニラ", price: 220 },
      { id: "cilantro", name: "パクチー", price: 320 },
      { id: "baby-corn", name: "ベビーコーン1本", price: 170 },
      { id: "lotus", name: "れんこん1個", price: 100 },
      { id: "wakame", name: "わかめ", price: 140 },
      { id: "pea-sprouts", name: "豆苗", price: 180 },
      { id: "tofu", name: "豆腐", price: 200 },
      { id: "white-negi", name: "白ネギ", price: 220 },
      { id: "hakusai", name: "白菜", price: 280 },
      { id: "wood-ear", name: "黒キクラゲ", price: 220 },
      { id: "taro", name: "里芋1個", price: 120 },
      { id: "broccoli", name: "ブロッコリー", price: 220 },
      { id: "shiitake", name: "しいたけ", price: 220 },
      { id: "pumpkin", name: "かぼちゃ", price: 220 },
      { id: "white-wood-ear", name: "白きくらげ", price: 260 },
      { id: "beef-slice", name: "牛肉スライス 50g", price: 350 },
      { id: "mochi", name: "国産もち1個", price: 160 },
      { id: "spinach", name: "ほうれん草", price: 220 },
      { id: "eggplant", name: "茄子", price: 220 },
      { id: "celery", name: "セロリ", price: 260 },
      { id: "mini-hamburg", name: "ミニハンバーグ1個", price: 220 },
      { id: "carrot", name: "人参", price: 220 },
      { id: "lettuce", name: "レタス", price: 220 },
      { id: "kaiware", name: "カイワレ", price: 160 },
    ],
  },
  {
    id: "premium",
    title: "プレミアムトッピング",
    limit: 20,
    items: [
      { id: "lamb", name: "高級NZ羊ラム 50g", price: 540 },
      { id: "scallop", name: "丸ごとホタテ1個", price: 310 },
      { id: "squid-ring", name: "イカリング 50g", price: 310 },
      { id: "white-fish", name: "白身魚", price: 310 },
      { id: "clam", name: "たっぷりあさり", price: 320 },
      { id: "chicken-slice", name: "国産とりむねスライス 50g", price: 320 },
      { id: "pork-tongue", name: "国産 豚タン 約50g", price: 400 },
      { id: "pork-liver", name: "国産豚レバー 50g", price: 320 },
      { id: "pork-offal", name: "国産牛モツ 50g", price: 480 },
      { id: "pork-cartilage", name: "国産豚軟骨 50g", price: 480 },
      { id: "beef-suji", name: "国産牛すじ 50g", price: 560 },
      { id: "large-shrimp", name: "大海老1匹", price: 460 },
      { id: "octopus", name: "ぶつ切りたこ 50g", price: 560 },
    ],
  },
  {
    id: "vip",
    title: "VIP トッピング",
    limit: 10,
    items: [
      { id: "oyster", name: "広島県産牡蠣 3個", price: 700 },
      { id: "frankfurt", name: "糸島豚の特大フランクフルト1本", price: 1000 },
      { id: "camembert", name: "丸ごとカマンベール", price: 1020 },
      { id: "seafood-set", name: "特選海鮮3種盛り", price: 1340 },
      { id: "mozzarella", name: "丸ごとモッツァレラ1個", price: 1020 },
    ],
  },
  {
    id: "request",
    title: "リクエスト制トッピング",
    limit: 10,
    items: [{ id: "stem-lettuce", name: "山クラゲ", price: 140 }],
  },
  {
    id: "drink",
    title: "おすすめペアリング",
    limit: 3,
    items: [{ id: "cola-shot", name: "コーラ1ショット", price: 280 }],
  },
];
