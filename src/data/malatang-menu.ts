export type MenuChoice = {
  id: string;
  name: string;
  price: number;
  note?: string;
};

export type MenuSection = {
  id: string;
  title: string;
  limit: number;
  items: MenuChoice[];
};

export const baseSoup: MenuChoice = {
  id: "mala-soup",
  name: "旨味マーラータンスープ",
  price: 415,
  note: "ご注文を受けてから一杯ずつ仕上げる、まぁ麻のベーススープです。",
};

export const medicinalSpiceOptions: MenuChoice[] = [
  { id: "with-spice", name: "薬膳スパイスあり", price: 0, note: "おすすめ" },
  { id: "without-spice", name: "薬膳スパイスなし", price: 0 },
];

export const heatLevels: MenuChoice[] = [
  { id: "normal", name: "普通辛", price: 0 },
  { id: "medium", name: "中辛", price: 50 },
  { id: "hot", name: "大辛", price: 75, note: "おすすめ" },
  { id: "stress", name: "激辛", price: 125 },
  { id: "oni", name: "鬼の一歩手前", price: 250 },
  { id: "shura", name: "修羅の道", price: 500 },
  { id: "jigoku", name: "地獄の業火", price: 999 },
];

export const numbLevels: MenuChoice[] = [
  { id: "tiny", name: "微シビ", price: 0 },
  { id: "little", name: "ちょいシビ", price: 0 },
  { id: "numb", name: "シビレ", price: 42 },
  { id: "biriri", name: "ビリリ", price: 84 },
  { id: "biribiri", name: "ビリビリ", price: 128 },
];

export const specialFlavors: MenuChoice[] = [
  { id: "aroma", name: "香味", price: 150, note: "おすすめ" },
  { id: "shacha", name: "サーチャージャン / 沙茶醤", price: 150 },
  { id: "fermented-tofu", name: "発酵豆腐タレ", price: 150 },
  { id: "extra-spice", name: "薬膳スパイス追加", price: 150 },
];

export const menuSections: MenuSection[] = [
  {
    id: "noodles",
    title: "麺の種類",
    limit: 2,
    items: [
      { id: "wide-harusame", name: "もちもち板春雨", price: 176, note: "おすすめ" },
      { id: "harusame", name: "春雨", price: 176 },
      { id: "beef-noodle", name: "牛筋麺", price: 276 },
      { id: "tteokbokki", name: "トッポッキ", price: 210 },
      { id: "sweet-potato-noodle", name: "さつまいも麺", price: 176 },
    ],
  },
  {
    id: "base",
    title: "ベーシックトッピング",
    limit: 50,
    items: [
      { id: "squid-ball", name: "特選イカ団子1個", price: 250 },
      { id: "pork-ball", name: "特選豚団子1個", price: 250 },
      { id: "beef-ball", name: "特選牛肉団子1個", price: 250 },
      { id: "crab-ball", name: "魚卵入り蟹団子1個", price: 276 },
      { id: "wonton", name: "特製ワンタン1個", price: 150 },
      { id: "tsukune", name: "華味鳥つくね1個", price: 150 },
      { id: "tofu-skin", name: "火鍋豆皮", price: 196 },
      { id: "quail-egg", name: "うずらの卵1個", price: 120 },
      { id: "shrimp-ball", name: "特選えび団子1個", price: 276 },
      { id: "shrimp-gyoza", name: "ほうれん草えび餃子1個", price: 276 },
      { id: "fresh-yuba", name: "生腐竹", price: 276 },
    ],
  },
  {
    id: "standard",
    title: "スタンダードトッピング",
    limit: 100,
    items: [
      { id: "sausage", name: "ウインナー1個", price: 150 },
      { id: "eringi", name: "エリンギ", price: 276 },
      { id: "enoki", name: "えのき", price: 276 },
      { id: "okra", name: "オクラ1本", price: 276 },
      { id: "kanikama", name: "カニカマ", price: 276 },
      { id: "cabbage", name: "キャベツ", price: 276 },
      { id: "asparagus", name: "グリーンアスパラガス1本", price: 276 },
      { id: "sweet-potato", name: "さつまいも", price: 246 },
      { id: "shimeji", name: "しめじ", price: 276 },
      { id: "potato", name: "じゃがいも", price: 246 },
      { id: "spam", name: "スパム1枚", price: 276 },
      { id: "bok-choy", name: "チンゲン菜", price: 246 },
      { id: "nira", name: "ニラ", price: 276 },
      { id: "cilantro", name: "パクチー", price: 399 },
      { id: "baby-corn", name: "ベビーコーン1本", price: 210 },
      { id: "lotus", name: "れんこん1個", price: 120 },
      { id: "wakame", name: "わかめ", price: 176 },
      { id: "pea-sprouts", name: "豆苗", price: 226 },
      { id: "tofu", name: "豆腐", price: 246 },
      { id: "white-negi", name: "白ネギ", price: 276 },
      { id: "hakusai", name: "白菜", price: 246 },
      { id: "wood-ear", name: "黒キクラゲ", price: 276 },
      { id: "taro", name: "里芋1個", price: 156 },
      { id: "broccoli", name: "ブロッコリー", price: 276 },
      { id: "shiitake", name: "しいたけ", price: 276 },
      { id: "pumpkin", name: "かぼちゃ", price: 276 },
      { id: "white-wood-ear", name: "白きくらげ", price: 326 },
      { id: "beef-slice", name: "牛肉スライス 50g", price: 439 },
      { id: "mochi", name: "国産もち1個", price: 200 },
      { id: "spinach", name: "ほうれん草", price: 276 },
      { id: "eggplant", name: "茄子", price: 276 },
      { id: "celery", name: "セロリ", price: 324 },
      { id: "mini-hamburg", name: "ミニハンバーグ1個", price: 276 },
      { id: "carrot", name: "人参", price: 276 },
      { id: "lettuce", name: "レタス", price: 276 },
      { id: "kaiware", name: "カイワレ", price: 196 },
    ],
  },
  {
    id: "premium",
    title: "プレミアムトッピング",
    limit: 20,
    items: [
      { id: "lamb", name: "高級NZ羊ラム 50g", price: 676 },
      { id: "scallop", name: "丸ごとホタテ1個", price: 390 },
      { id: "squid-ring", name: "イカリング 50g", price: 390 },
      { id: "white-fish", name: "白身魚", price: 390 },
      { id: "clam", name: "たっぷりあさり", price: 399 },
      { id: "chicken-slice", name: "国産とりむねスライス 50g", price: 399 },
      { id: "pork-tongue", name: "国産 豚タン 約50g", price: 400 },
      { id: "pork-liver", name: "国産豚レバー 50g", price: 399 },
      { id: "pork-offal", name: "国産牛モツ 50g", price: 599 },
      { id: "pork-cartilage", name: "国産豚軟骨 50g", price: 599 },
      { id: "beef-suji", name: "国産牛すじ 50g", price: 698 },
      { id: "large-shrimp", name: "大海老1匹", price: 580 },
      { id: "octopus", name: "ぶつ切りたこ 50g", price: 698 },
    ],
  },
  {
    id: "vip",
    title: "VIP トッピング",
    limit: 10,
    items: [
      { id: "oyster", name: "広島県産牡蠣 3個", price: 880 },
      { id: "frankfurt", name: "糸島豚の特大フランクフルト1本", price: 1250 },
      { id: "camembert", name: "丸ごとカマンベール", price: 1280 },
      { id: "seafood-set", name: "特選海鮮3種盛り", price: 1680 },
      { id: "mozzarella", name: "丸ごとモッツァレラ1個", price: 1280 },
    ],
  },
  {
    id: "request",
    title: "リクエスト制トッピング",
    limit: 10,
    items: [{ id: "stem-lettuce", name: "山クラゲ", price: 176 }],
  },
  {
    id: "drink",
    title: "おすすめペアリング",
    limit: 3,
    items: [{ id: "cola-shot", name: "コーラ1ショット", price: 350 }],
  },
];
