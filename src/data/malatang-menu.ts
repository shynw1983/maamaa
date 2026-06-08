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

export const baseSoup: MenuChoice = {
  id: "mala-soup",
  name: "旨味マーラータンスープ",
  price: 280,
  note: "ご注文を受けてから一杯ずつ仕上げる、まぁ麻のベーススープです。",
};

export const medicinalSpiceOptions: MenuChoice[] = [
  { id: "with-spice", name: "薬膳スパイスあり", price: 0, note: "おすすめ" },
  { id: "without-spice", name: "薬膳スパイスなし", price: 0 },
];

export const heatLevels: MenuChoice[] = [
  { id: "normal", name: "普通辛", price: 0 },
  { id: "medium", name: "中辛", price: 30 },
  { id: "hot", name: "大辛", price: 50, note: "おすすめ" },
  { id: "stress", name: "激辛", price: 80 },
  { id: "oni", name: "鬼の一歩手前", price: 170 },
  { id: "shura", name: "修羅の道", price: 330 },
  { id: "jigoku", name: "地獄の業火", price: 670 },
];

export const numbLevels: MenuChoice[] = [
  { id: "tiny", name: "微シビ", price: 0 },
  { id: "little", name: "ちょいシビ", price: 0 },
  { id: "numb", name: "シビレ", price: 30 },
  { id: "biriri", name: "ビリリ", price: 60 },
  { id: "biribiri", name: "ビリビリ", price: 90 },
];

export const specialFlavors: MenuChoice[] = [
  { id: "aroma", name: "香酢", price: 100, note: "おすすめ" },
  { id: "shacha", name: "サーチャージャン / 沙茶醤", price: 100 },
  { id: "fermented-tofu", name: "発酵豆腐タレ", price: 100 },
  { id: "extra-spice", name: "薬膳スパイス追加", price: 100 },
];

export const menuSections: MenuSection[] = [
  {
    id: "noodles",
    title: "麺の種類",
    limit: 2,
    items: [
      { id: "wide-harusame", name: "もちもち板春雨", price: 120, note: "おすすめ" },
      { id: "harusame", name: "春雨", price: 120 },
      { id: "beef-noodle", name: "牛筋麺", price: 180 },
      { id: "tteokbokki", name: "トッポッキ", price: 140 },
      { id: "sweet-potato-noodle", name: "さつまいも麺", price: 120 },
    ],
  },
  {
    id: "base",
    title: "ベーシックトッピング",
    limit: 50,
    items: [
      { id: "squid-ball", name: "特選イカ団子1個", price: 170 },
      { id: "pork-ball", name: "特選豚団子1個", price: 170 },
      { id: "beef-ball", name: "特選牛肉団子1個", price: 170 },
      { id: "crab-ball", name: "魚卵入り蟹団子1個", price: 180 },
      { id: "wonton", name: "特製ワンタン1個", price: 100 },
      { id: "tsukune", name: "華味鳥つくね1個", price: 100 },
      { id: "tofu-skin", name: "火鍋豆皮", price: 130 },
      { id: "quail-egg", name: "うずらの卵1個", price: 80 },
      { id: "shrimp-ball", name: "特選えび団子1個", price: 180 },
      { id: "shrimp-gyoza", name: "ほうれん草えび餃子1個", price: 180 },
      { id: "fresh-yuba", name: "生腐竹", price: 180 },
    ],
  },
  {
    id: "standard",
    title: "スタンダードトッピング",
    limit: 100,
    items: [
      { id: "sausage", name: "ウインナー1個", price: 100 },
      { id: "eringi", name: "エリンギ", price: 180 },
      { id: "enoki", name: "えのき", price: 180 },
      { id: "okra", name: "オクラ1本", price: 180 },
      { id: "kanikama", name: "カニカマ", price: 180 },
      { id: "cabbage", name: "キャベツ", price: 180 },
      { id: "asparagus", name: "グリーンアスパラガス1本", price: 180 },
      { id: "sweet-potato", name: "さつまいも", price: 160 },
      { id: "shimeji", name: "しめじ", price: 180 },
      { id: "potato", name: "じゃがいも", price: 160 },
      { id: "spam", name: "スパム1枚", price: 180 },
      { id: "bok-choy", name: "チンゲン菜", price: 160 },
      { id: "nira", name: "ニラ", price: 180 },
      { id: "cilantro", name: "パクチー", price: 270 },
      { id: "baby-corn", name: "ベビーコーン1本", price: 140 },
      { id: "lotus", name: "れんこん1個", price: 80 },
      { id: "wakame", name: "わかめ", price: 120 },
      { id: "pea-sprouts", name: "豆苗", price: 150 },
      { id: "tofu", name: "豆腐", price: 160 },
      { id: "white-negi", name: "白ネギ", price: 180 },
      { id: "hakusai", name: "白菜", price: 160 },
      { id: "wood-ear", name: "黒キクラゲ", price: 180 },
      { id: "taro", name: "里芋1個", price: 100 },
      { id: "broccoli", name: "ブロッコリー", price: 180 },
      { id: "shiitake", name: "しいたけ", price: 180 },
      { id: "pumpkin", name: "かぼちゃ", price: 180 },
      { id: "white-wood-ear", name: "白きくらげ", price: 220 },
      { id: "beef-slice", name: "牛肉スライス 50g", price: 290 },
      { id: "mochi", name: "国産もち1個", price: 130 },
      { id: "spinach", name: "ほうれん草", price: 180 },
      { id: "eggplant", name: "茄子", price: 180 },
      { id: "celery", name: "セロリ", price: 220 },
      { id: "mini-hamburg", name: "ミニハンバーグ1個", price: 180 },
      { id: "carrot", name: "人参", price: 180 },
      { id: "lettuce", name: "レタス", price: 180 },
      { id: "kaiware", name: "カイワレ", price: 130 },
    ],
  },
  {
    id: "premium",
    title: "プレミアムトッピング",
    limit: 20,
    items: [
      { id: "lamb", name: "高級NZ羊ラム 50g", price: 450 },
      { id: "scallop", name: "丸ごとホタテ1個", price: 260 },
      { id: "squid-ring", name: "イカリング 50g", price: 260 },
      { id: "white-fish", name: "白身魚", price: 260 },
      { id: "clam", name: "たっぷりあさり", price: 270 },
      { id: "chicken-slice", name: "国産とりむねスライス 50g", price: 270 },
      { id: "pork-tongue", name: "国産 豚タン 約50g", price: 270 },
      { id: "pork-liver", name: "国産豚レバー 50g", price: 270 },
      { id: "pork-offal", name: "国産牛モツ 50g", price: 400 },
      { id: "pork-cartilage", name: "国産豚軟骨 50g", price: 400 },
      { id: "beef-suji", name: "国産牛すじ 50g", price: 470 },
      { id: "large-shrimp", name: "大海老1匹", price: 390 },
      { id: "octopus", name: "ぶつ切りたこ 50g", price: 470 },
    ],
  },
  {
    id: "vip",
    title: "VIP トッピング",
    limit: 10,
    items: [
      { id: "oyster", name: "広島県産牡蠣 3個", price: 590 },
      { id: "frankfurt", name: "糸島豚の特大フランクフルト1本", price: 830 },
      { id: "camembert", name: "丸ごとカマンベール", price: 850 },
      { id: "seafood-set", name: "特選海鮮3種盛り", price: 1120 },
      { id: "mozzarella", name: "丸ごとモッツァレラ1個", price: 850 },
    ],
  },
  {
    id: "request",
    title: "リクエスト制トッピング",
    limit: 10,
    items: [{ id: "stem-lettuce", name: "山クラゲ", price: 120 }],
  },
  {
    id: "drink",
    title: "おすすめペアリング",
    limit: 3,
    items: [{ id: "cola-shot", name: "コーラ1ショット", price: 230 }],
  },
];
