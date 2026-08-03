export type MenuChoice = {
  id: string;
  name: string;
  imageUrl?: string;
  displayNames?: Record<string, string>;
  promotionPrefix?: string;
  promotionPrefixDisplayNames?: Record<string, string>;
  showPromotionPrefix?: boolean;
  showEmoji?: boolean;
  price: number;
  note?: string;
  noteDisplayNames?: Record<string, string>;
};

export type MenuSection = {
  id: string;
  title: string;
  displayNames?: Record<string, string>;
  limit: number;
  perOptionMax: number;
  items: MenuChoice[];
};

export type PresetSoup = MenuChoice & {
  category: "chef-special" | "recommended-set";
  defaultNoodle: string;
};

export const menuCategories = [
  { id: "base-soup", name: "🌶️旨味ベースの特別仕立てスープ", sortOrder: 10 },
  { id: "chef-special", name: "👨‍🍳✨️シェフのスペシャル麻辣湯", sortOrder: 20 },
  { id: "recommended-set", name: "🐉🌟おすすめ麻辣湯セット", sortOrder: 30 },
] as const;

const uberBaseSoupDescription = `※こちらの商品はスープのベースになります。
北海道産最高級昆布をベースに丁寧に旨味を抽出した、当店自慢のスープにお好みで具材を選び、旨味のアレンジをお楽しみください‼️
💡ご注文は1,000円〜承っております👨‍🍳

〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜
🏮【ぐわっとくる旨味❗】超旨味マーラータンスープ
〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜

「よし、今日はデリバリーでご褒美だ」
──そう思ったのに、届いた料理は汁がこぼれ、麺は伸び、包装はぐちゃぐちゃ。
あるいは、テープを何重にも貼られすぎて開けるのに苦労し、
せっかくの楽しみがイライラに変わる…。

そして食べ終わった後は「なんか虚しい」。
コンビニやチェーンの料理は確かに便利で手軽。
けれど、どこか心の奥まで響いてこない。

多くの実店舗は「店内飲食」が本業。
デリバリーは片手間だから、包装も適当。
届いた頃には味が落ち、食欲がしぼむことも珍しくありません。

また、コンビニやチェーンのスープは安価な食材と濃い調味料頼み。
一瞬の刺激はあっても、心に残る“旨味”はどこにもない。
──だから、食べ終わった後に虚しさが押し寄せるのです。

🏮まぁ麻の答え（デリバリー専業 × 包装 × 旨味研究家の愛情）

私たち【まぁ麻】は違います。
デリバリー専業店だからこそ、「届いた瞬間が一番美味しい」 ことに命をかけています。

漏れないと開けやすさを追求したパッケージ

厳重すぎず簡単に開けられる設計

旨味を抽出する為に厳選に厳選を重ねた食材

食材の美味しさを1番引き出す為の職人による手間ひまかけた仕込み

全ての工程に愛情を込めて

出来立て麻辣湯をお届けします。

そして何より、旨味研究家の先生の想いが詰まっています。

先生の願いはただ一つ。
「大切なお客様に、人の愛情が込められた“本物のお料理”を、出来立てで届けたい」

その想いを胸に、私たちは世界中の厳選食材を集め、
あらゆる旨味を何層にも重ねてスープを完成させました。

フタを開けた瞬間に立ちのぼる湯気、
鼻腔をくすぐる花椒や高級青山椒の香り、
舌に広がる深い旨味、
喉を通る熱さが体の芯を震わせる──。
それは、愛情と叡智の込もった贈り物です。

疲れた夜に、心を温める一杯

勝負前に、背中を押す一杯

大切な人と笑顔を分かち合う一杯

自分を大切にするためのご褒美の一杯

ただの食事ではない。
「自分を大切にする」体験を、デリバリーで。

🔥 辛さは7段階調整可能❗️
🌿 厳選した花椒や高級青山椒をブレンドしたシビレも調整自在
🥬 野菜・肉・豆腐・春雨など具材をお好みで選び旨味の重なりをお楽しみください。

あなた自身が仕上げる、世界に一杯だけの旨味。

もう、片手間デリバリーにがっかりする必要はありません。
もう、コンビニの薄っぺらな旨味に妥協する必要もありません。

【まぁ麻】が届けるのは──
届いた瞬間が最高の旨味、心に響く本物のお料理。

これは料理ではなく、旨味研究家の先生が魂を込めた“愛情の一杯”。
あなたの心と体を震わせる、出来立ての旨味体験。`;

const uberRecommendedSetStory = `〜〜〜〜〜〜〜〜〜〜〜
世の中にない麻辣湯を
〜〜〜〜〜〜〜〜〜〜〜

本当に美味しい麻辣湯とは何か。
そこから、まぁ麻の一杯は生まれました。

旨味の抽出技術と素材に徹底的にこだわり、
お客様のもとに届く瞬間に最も美味しく、いつでも出来立ての麻辣湯を味わっていただけるよう、
調理技術を極限まで高めました。

旨味 × 辛味 × 痺れ × 薬膳スパイスが身体を整え、心まで温める。
一つひとつの食材を妥協せず、出汁の奥深さと辛さの調和を極めています。

さらに──デリバリー専門店だからこそ、
「開けやすさ」と「こぼれにくさ」を両立した特製包装を採用。
届いた瞬間に最高の状態で楽しめるよう、調理から包装まで一切の妥協を許しません。

コンビニやチェーンでは決して味わえない、
“旨味の相乗効果”が重なり合うスープ。

食べた人が「また明日も頑張れる」と感じ、自然と笑顔になる。
まぁ麻の本気が詰まった麻辣湯です。`;

const withUberRecommendedSetStory = (introduction: string) =>
  `${introduction}\n\n${uberRecommendedSetStory}`;

// Web予約 prices are 80% of the corresponding Uber Eats prices, rounded to the nearest ¥10.
// Source snapshot: Uber Menu Maker, 2026-07-30.
export const baseSoup: MenuChoice = {
  id: "mala-soup",
  name: "【自由にカスタム🤲】旨味マーラータンスープ",
  displayNames: {"zh":"麻辣烫汤底","ko":"마라탕 육수","en":"Mala Tang Broth"},
  price: 330,
  note: uberBaseSoupDescription,
};

// Uber fixed bowls include their ingredients and wide sweet-potato noodles in the base price.
// Their noodle selector replaces that included noodle; it is intentionally separate from
// the add-on noodle section used by the build-your-own broth.
export const presetSoups: PresetSoup[] = [
  {
    id: "set-beef-tendon",
    name: "【人気No.1❗️】とろとろ国産牛すじの麻辣湯",
    displayNames: {"zh":"国产牛筋麻辣烫","ko":"일본산 소힘줄 마라탕","en":"Mala Tang with Japanese Beef Tendon"},
    price: 1580,
    category: "chef-special",
    defaultNoodle: "板春雨",
    note: `​【箸で切れるほどトロトロ…】限界まで煮込んだ国産牛すじの旨味爆弾スープ‼️

​一口食べれば、国産牛の濃厚な旨味がジュワッとあふれ出す——。

時間をかけて「トロトロ」になるまで丁寧に煮込んだ国産牛すじを、たっぷり詰め込みました。

​ベースには、味が染み込んだモチモチの「板春雨」、シャキシャキの青菜、数種類のキノコと根菜、そしてコリコリ食感がたまらない「きくらげ」がゴロゴロ入っています。

これ一杯で栄養も満足感も120%！

​💡あなただけの「悪魔的アレンジ」をお楽しみください！

お好みに合わせて麺の変更も可能です！（※変更した場合、板春雨が選んだ麺に変わります）

さらに豊富なトッピングを追加して、自分だけの「最高の一杯」を完成させてください。

旨味は重ねれば重ねるほど、相乗効果で、爆発します💣️`,
  },
  {
    id: "set-whole-camembert",
    name: "【旨味の相乗効果🧀】丸ごとカマンベールの麻辣湯",
    displayNames: {"zh":"整颗卡芒贝尔奶酪麻辣烫","ko":"통 카망베르 치즈 마라탕","en":"Mala Tang with Whole Camembert Cheese"},
    price: 1660,
    category: "chef-special",
    defaultNoodle: "板春雨",
    note: `カマンベールチーズを丸ごと1個使用❗️

※カマンベールチーズとスープに板春雨に青菜とキノコ、根菜、キクラゲが予め入っております、その他具材はお好みでトッピングをお楽しみください。

麺の種類を変更すると板春雨が選んだ麺に変わります`,
  },
  {
    id: "set-premium-wagyu",
    name: "【厳選霜降り黒毛和牛🥩】極上の肉麻辣湯",
    displayNames: {"zh":"极品黑毛和牛麻辣烫","ko":"최고급 흑모와규 마라탕","en":"Mala Tang with Premium Japanese Black Wagyu"},
    price: 2840,
    category: "chef-special",
    defaultNoodle: "板春雨",
    note: `極上霜降り国産黒毛和牛使用❗️

※極上霜降りお肉に板春雨、青菜とキノコ、根菜、きくらげが予め入っています、その他具材はお好みでトッピングをお楽しみください。

麺の種類を変更すると板春雨が選んだ麺に変わります`,
  },
  {
    id: "set-beef",
    name: "牛肉マーラータン",
    displayNames: {"zh":"牛肉麻辣烫","ko":"소고기 마라탕","en":"Beef Mala Tang"},
    price: 1500,
    category: "recommended-set",
    defaultNoodle: "板春雨",
    note: withUberRecommendedSetStory(`牛肉に板春雨、根菜、きのこ、青菜、キクラゲの入ったセットです。
その他具材はお好みで追加し、お客様だけのアレンジをお楽しみください。

麺の種類を変更すると板春雨が選んだ麺に変わります。`),
  },
  {
    id: "set-pork",
    name: "【超人気🏮】豚肉マーラータン",
    displayNames: {"zh":"猪肉麻辣烫","ko":"돼지고기 마라탕","en":"Pork Mala Tang"},
    price: 1500,
    category: "recommended-set",
    defaultNoodle: "板春雨",
    note: withUberRecommendedSetStory(`豚肉に板春雨、根菜、きのこ、青菜、キクラゲの入ったセットです。
その他具材はお好みで追加し、お客様だけのアレンジをお楽しみください。

麺の種類を変更すると板春雨が選んだ麺に変わります。`),
  },
  {
    id: "set-lamb",
    name: "【厳選高級ラム肉】ラムマーラータン",
    displayNames: {"zh":"羊肉麻辣烫","ko":"양고기 마라탕","en":"Lamb Mala Tang"},
    price: 2060,
    category: "recommended-set",
    defaultNoodle: "板春雨",
    note: withUberRecommendedSetStory(`厳選した高級ラムの希少部位のみ使用！

板春雨、根菜、きのこ、青菜、キクラゲの入ったセットです。

その他具材はお好みで追加し、お客様だけのアレンジをお楽しみください。

麺の種類を変更すると板春雨が選んだ麺に変わります。`),
  },
  {
    id: "set-seafood-trio",
    name: "【大海老使用🦐】3種の海鮮マーラータン",
    displayNames: {"zh":"三种海鲜麻辣烫","ko":"3가지 해산물 마라탕","en":"Mala Tang with 3 Kinds of Seafood"},
    price: 1660,
    category: "recommended-set",
    defaultNoodle: "板春雨",
    note: withUberRecommendedSetStory(`大えび、ホタテ、イカ（またはタコ）に板春雨、根菜、きのこ、青菜、キクラゲの入ったセットです。
その他具材はお好みで追加し、お客様だけのアレンジをお楽しみください。

麺の種類を変更すると板春雨が選んだ麺に変わります。`),
  },
  {
    id: "set-vegetable",
    name: "野菜マーラータン",
    displayNames: {"zh":"蔬菜麻辣烫","ko":"야채 마라탕","en":"Vegetable Mala Tang"},
    price: 1500,
    category: "recommended-set",
    defaultNoodle: "板春雨",
    note: withUberRecommendedSetStory(`板春雨、根菜、かぼちゃ、青菜、きのこ、キクラゲ、プチトマトなどが入ったセットです。
野菜の内容は時期により少し変わる事もございますがたっぷりの色彩り野菜をお入れいたします、ご了承くださいませ。
その他具材はお好みで追加し、お客様だけのアレンジをお楽しみください。

麺の種類を変更すると板春雨が選んだ麺に変わります。`),
  },
  {
    id: "set-cilantro",
    name: "パクチーマーラータン",
    displayNames: {"zh":"香菜麻辣烫","ko":"고수 마라탕","en":"Cilantro Mala Tang"},
    price: 1660,
    category: "recommended-set",
    defaultNoodle: "板春雨",
    note: withUberRecommendedSetStory(`大盛りパクチーにまぁ麻特選お団子達、根菜、きのこ、板春雨、きくらげが入っております。

その他具材はお好みで追加し、お客様だけのアレンジをお楽しみください。

麺の種類を変更すると板春雨が選んだ麺に変わります。`),
  },
  {
    id: "set-chicken-lovers",
    name: "【🐔スタミナ】鶏づくしマーラータン",
    displayNames: {"zh":"全鸡盛宴麻辣烫","ko":"닭고기 모둠 마라탕","en":"Chicken Lover's Mala Tang"},
    price: 1660,
    category: "recommended-set",
    defaultNoodle: "板春雨",
    note: withUberRecommendedSetStory(`鶏一羽の美味しさを、一杯に。

ジューシーな鶏もも、濃厚な旨みの鶏レバー、コリコリ食感の鶏ハツに、板春雨、根菜、きのこ、青菜、キクラゲを合わせた、鶏好きのための贅沢なセットです。

部位ごとに異なる旨みと食感が、旨辛スープと重なり合い、最後の一口まで飽きることなくお楽しみいただけます。

その他具材はお好みで追加し、お客様だけのアレンジをお楽しみください。
麺の種類を変更すると板春雨が選んだ麺に変わります。`),
  },
];

export const noodleReplacementRule = {
  limit: 2,
  perOptionMax: 2,
};

export const noodleReplacementOptions: MenuChoice[] = [
  { id: "replace-extra-wide-harusame", name: "板春雨に変更", displayNames: {"zh":"更换为宽粉","ko":"넓적당면으로 변경","en":"Change to Wide Sweet Potato Noodles"}, price: 170 },
  { id: "replace-corn-noodle", name: "【お一人様1回限り】トウモロコシ麺に変更", displayNames: {"zh":"更换为玉米面","ko":"옥수수면으로 변경","en":"Change to Corn Noodles"}, price: 0 },
  { id: "replace-harusame", name: "春雨に変更", displayNames: {"zh":"更换为粉丝","ko":"당면으로 변경","en":"Change to Glass Noodles"}, price: 140 },
  { id: "replace-sweet-potato-noodle", name: "さつまいも麺に変更", displayNames: {"zh":"更换为红薯粉","ko":"고구마당면으로 변경","en":"Change to Sweet Potato Noodles"}, price: 140 },
  { id: "replace-round-yam-sheet", name: "【数量限定】山芋粉皮（丸）に変更", displayNames: {"zh":"更换为圆形山药粉皮","ko":"둥근 참마 당면으로 변경","en":"Change to Round Chinese Yam Starch Sheets"}, price: 140 },
  { id: "replace-rice-noodle", name: "ビーフンに変更", displayNames: {"zh":"更换为米粉","ko":"쌀국수로 변경","en":"Change to Rice Noodles"}, price: 140 },
  { id: "replace-yam-noodle", name: "山芋麺に変更", displayNames: {"zh":"更换为山药粉","ko":"마 산약 당면으로 변경","en":"Change to Chinese Yam Noodles"}, price: 140 },
  { id: "replace-wide-sweet-potato-noodle", name: "さつまいも板春雨に変更", displayNames: {"zh":"更换为红薯宽粉","ko":"고구마 넓적당면으로 변경","en":"Change to Wide Sweet Potato Noodles"}, price: 170 },
  { id: "replace-soybean-sprouts-noodle", name: "【ヘルシー】小大豆もやしに変更", displayNames: {"zh":"更换为黄豆芽","ko":"콩나물로 변경","en":"Change to Soybean Sprouts"}, price: 140 },
  { id: "replace-tteokbokki", name: "トッポッキに変更", displayNames: {"zh":"更换为韩式年糕","ko":"떡볶이떡으로 변경","en":"Change to Tteokbokki Rice Cakes"}, price: 170 },
  { id: "replace-knife-shaved-noodle", name: "【大盛り】刀削麺に変更", displayNames: {"zh":"更换为刀削面","ko":"칼국수면으로 변경","en":"Change to Knife-Shaved Noodles"}, price: 220 },
  { id: "replace-kishimen", name: "【もっちりつるん】きしめんに変更", displayNames: {"zh":"更换为宽乌冬面","ko":"기시멘으로 변경","en":"Change to Kishimen Noodles"}, price: 220 },
  { id: "replace-beef-noodle", name: "【もちもちつるん】牛筋麺に変更", displayNames: {"zh":"更换为牛筋面","ko":"우근면으로 변경","en":"Change to Niujin Noodles"}, price: 220 },
];

export const medicinalSpiceOptions: MenuChoice[] = [
  { id: "with-spice", name: "薬膳スパイスあり【超おすすめ🏮】", displayNames: {"zh":"添加药膳香料","ko":"약선 향신료 추가","en":"With Herbal Spice Blend"}, price: 0, note: "おすすめ" },
  { id: "without-spice", name: "薬膳スパイスなし", displayNames: {"zh":"不要药膳香料","ko":"약선 향신료 제외","en":"No Herbal Spice Blend"}, price: 0 },
];

export const heatLevels: MenuChoice[] = [
  { id: "normal", name: "普通辛🔥", displayNames: {"zh":"普通辣","ko":"보통 매운맛","en":"Regular Spicy"}, price: 0 },
  { id: "medium", name: "中辛🔥🔥", displayNames: {"zh":"中辣","ko":"중간 매운맛","en":"Medium Spicy"}, price: 40 },
  { id: "hot", name: "大辛🔥🔥🔥👈️おすすめです😳", displayNames: {"zh":"大辣","ko":"매우 매운맛","en":"Very Spicy"}, price: 60, note: "おすすめ" },
  { id: "stress", name: "【ストレスを燃やし尽くす💪】激辛🔥🔥🔥🔥", displayNames: {"zh":"特辣","ko":"매운맛(최고)","en":"Extra Spicy"}, price: 100 },
  { id: "oni", name: "鬼の一歩手前🔥🔥🔥🔥🔥", displayNames: {"zh":"鬼门关前","ko":"귀신 직전","en":"One Step from Hell"}, price: 200 },
  { id: "shura", name: "修羅の道🔥🔥🔥🔥🔥🔥", displayNames: {"zh":"修罗之路","ko":"수라의 길","en":"Path of Shura"}, price: 400 },
  { id: "jigoku", name: "【食べる、サウナ🧖‍♀️】地獄の業火🔥🔥🔥🔥🔥🔥🔥", displayNames: {"zh":"地狱业火","ko":"지옥의 업화","en":"Infernal Hellfire"}, price: 800 },
];

export const numbLevels: MenuChoice[] = [
  { id: "tiny", name: "微シビレ", displayNames: {"zh":"微微麻","ko":"약간 얼얼함","en":"Slightly Numbing"}, price: 0 },
  { id: "little", name: "ちょいシビ⚡️", displayNames: {"zh":"微麻","ko":"약한 얼얼함","en":"Mild Numbing"}, price: 0 },
  { id: "numb", name: "シビレ⚡️⚡️", displayNames: {"zh":"麻","ko":"얼얼함","en":"Numbing"}, price: 30 },
  { id: "biriri", name: "ビリリ⚡️⚡️⚡️", displayNames: {"zh":"重麻","ko":"강한 얼얼함","en":"Strong Numbing"}, price: 70 },
  { id: "biribiri", name: "【舌が痺れるほどの幸福を💞】ビリビリ⚡️⚡️⚡️⚡️", displayNames: {"zh":"特麻","ko":"극강 얼얼함","en":"Extreme Numbing"}, price: 100 },
];

export const specialFlavors: MenuChoice[] = [
  { id: "aroma", name: "【別添容器】香酢👈️超おすすめです🤫", displayNames: {"zh":"香醋","ko":"흑식초","en":"Chinese Black Vinegar"}, price: 120, note: "おすすめ" },
  { id: "shacha", name: "【超凝縮旨味タレ🦐🐟️🧄🧅🥥】サーチャージャン", displayNames: {"zh":"沙茶酱","ko":"사차소스","en":"Satay Sauce"}, price: 120 },
  { id: "fermented-tofu", name: "発酵豆腐タレ", displayNames: {"zh":"南乳汁","ko":"남유 소스","en":"Fermented Red Bean Curd Sauce"}, price: 120 },
  { id: "sesame-peanut-sauce", name: "ごまピーナッツタレ🥜", displayNames: {"zh":"二八酱","ko":"이팔 소스","en":"Sesame Peanut Blend (2:8 Sauce)"}, price: 200 },
  { id: "extra-spice", name: "薬膳スパイス追加", displayNames: {"zh":"加药膳香料","ko":"약선 향신료 추가","en":"Extra Herbal Spice Blend"}, price: 120 },
  { id: "extra-garlic", name: "にんにくマシマシ🧄", displayNames: {"zh":"加倍蒜蓉","ko":"마늘 듬뿍","en":"Extra Garlic"}, price: 120 },
  { id: "fried-onion", name: "フライドオニオン🧅", displayNames: {"zh":"炸洋葱碎","ko":"프라이드 어니언","en":"Fried Onions"}, price: 140 },
];

export const menuSections: MenuSection[] = [
  {
    id: "noodles",
    title: "麺の種類",
    limit: 2,
    perOptionMax: 2,
    items: [
      { id: "wide-harusame", name: "【おすすめ❗️】もちもち板春雨", displayNames: {"zh":"宽粉","ko":"넓적당면","en":"Wide Sweet Potato Noodles"}, price: 170, note: "おすすめ" },
      { id: "corn-noodle", name: "トウモロコシ麺", displayNames: {"zh":"玉米面","ko":"옥수수면","en":"Corn Noodles"}, price: 170 },
      { id: "harusame", name: "春雨", displayNames: {"zh":"粉丝","ko":"당면","en":"Glass Noodles"}, price: 140 },
      { id: "sweet-potato-noodle", name: "さつまいも麺", displayNames: {"zh":"红薯粉","ko":"고구마당면","en":"Sweet Potato Noodles"}, price: 140 },
      { id: "beef-noodle", name: "【もちもちつるん】牛筋麺", displayNames: {"zh":"牛筋面","ko":"우근면","en":"Niujin Noodles"}, price: 220 },
      { id: "tteokbokki", name: "トッポッキ", displayNames: {"zh":"韩式年糕","ko":"떡볶이떡","en":"Tteokbokki Rice Cakes"}, price: 170 },
      { id: "soybean-sprouts-noodle", name: "【ヘルシー】小大豆もやし", displayNames: {"zh":"黄豆芽","ko":"콩나물","en":"Soybean Sprouts"}, price: 140 },
      { id: "wide-sweet-potato-noodle", name: "さつまいも板春雨", displayNames: {"zh":"红薯宽粉","ko":"고구마 넓적당면","en":"Wide Sweet Potato Noodles"}, price: 170 },
      { id: "round-yam-sheet", name: "【数量限定】山芋粉皮（丸）", displayNames: {"zh":"圆形山药粉皮","ko":"둥근 참마 당면","en":"Round Chinese Yam Starch Sheets"}, price: 140 },
      { id: "yam-noodle", name: "山芋麺", displayNames: {"zh":"山药粉","ko":"마 산약 당면","en":"Chinese Yam Noodles"}, price: 140 },
      { id: "option-dcafe1ea", name: "【もっちりつるん】きしめん", displayNames: {"zh":"宽乌冬面","ko":"기시멘","en":"Kishimen Noodles"}, price: 220 },
      { id: "knife-shaved-noodle", name: "【大盛り】刀削麺", displayNames: {"zh":"刀削面","ko":"칼국수면","en":"Knife-Shaved Noodles"}, price: 220 },
    ],
  },
  {
    id: "base",
    title: "ベーシックトッピング",
    limit: 50,
    perOptionMax: 50,
    items: [
      { id: "squid-ball", name: "特選イカ団子1個", displayNames: {"zh":"花枝丸","ko":"화지완(오징어 완자)","en":"Cuttlefish Ball"}, price: 200 },
      { id: "pork-ball", name: "特選豚団子1個", displayNames: {"zh":"猪肉贡丸","ko":"돼지고기 공완","en":"Taiwanese Pork Meatball"}, price: 200 },
      { id: "beef-ball", name: "特選牛肉団子1個", displayNames: {"zh":"牛肉贡丸","ko":"소고기 공완","en":"Taiwanese Beef Meatball"}, price: 200 },
      { id: "crab-ball", name: "魚卵入り蟹団子1個", displayNames: {"zh":"蟹籽包","ko":"날치알 게완자","en":"Crab Roe Ball"}, price: 220 },
      { id: "fuzhou-fish-ball", name: "【肉汁たっぷり】肉餡入り魚団子", displayNames: {"zh":"福州鱼丸","ko":"푸저우 어묵완자","en":"Fuzhou Fish Ball"}, price: 220 },
      { id: "wonton", name: "特製ワンタン1個", displayNames: {"zh":"肉燕","ko":"러우옌","en":"Rouyan (Fuzhou Pork Dumpling)"}, price: 120 },
      { id: "tsukune", name: "華味鳥つくね1個", displayNames: {"zh":"华味鸟鸡肉丸","ko":"하카타 하나미도리 닭완자","en":"Hanamidori Chicken Meatball"}, price: 120 },
      { id: "tofu-skin", name: "火鍋豆皮", displayNames: {"zh":"火锅豆皮","ko":"훠궈 두부피","en":"Hot Pot Tofu Skin"}, price: 160 },
      { id: "quail-egg", name: "うずらの卵1個", displayNames: {"zh":"鹌鹑蛋","ko":"메추리알","en":"Quail Eggs"}, price: 100 },
      { id: "tofu-knots", name: "結びゆば1個", displayNames: {"zh":"百叶结","ko":"두부 매듭","en":"Tofu Knots"}, price: 120 },
      { id: "shrimp-ball", name: "特選えび団子1個", displayNames: {"zh":"鲜虾丸","ko":"새우완자","en":"Shrimp Ball"}, price: 220 },
      { id: "rainbow-roll", name: "彩虹巻1個", displayNames: {"zh":"彩虹卷","ko":"무지개 롤","en":"Rainbow Roll"}, price: 170 },
      { id: "shrimp-gyoza", name: "ほうれん草えび餃子1個", displayNames: {"zh":"翡翠虾饺","ko":"시금치 새우교자","en":"Spinach Shrimp Dumplings"}, price: 220 },
      { id: "fresh-yuba", name: "【とろとろ食感✨️】生腐竹", displayNames: {"zh":"鲜腐竹","ko":"생 푸주","en":"Fresh Tofu Skin"}, price: 220 },
      { id: "fried-yuba", name: "【スープが染み込む🤤】揚げ腐竹", displayNames: {"zh":"鲜炸腐竹","ko":"튀긴 푸주","en":"Fried Tofu Skin"}, price: 220 },
      { id: "dried-yuba", name: "乾燥腐竹", displayNames: {"zh":"干腐竹","ko":"건조 푸주","en":"Dried Tofu Skin"}, price: 170 },
      { id: "wheat-gluten", name: "小麦グルテン", displayNames: {"zh":"面筋","ko":"밀글루텐","en":"Wheat Gluten"}, price: 170 },
      { id: "traditional-tofu-skin", name: "【大サイズ】老豆皮1枚", displayNames: {"zh":"老豆皮","ko":"노두부피","en":"Traditional Tofu Skin"}, price: 220 },
    ],
  },
  {
    id: "standard",
    title: "スタンダードトッピング",
    limit: 100,
    perOptionMax: 10,
    items: [
      { id: "sausage", name: "ウインナー1個", displayNames: {"zh":"香肠","ko":"소시지","en":"Sausage"}, price: 120 },
      { id: "eringi", name: "エリンギ", displayNames: {"zh":"杏鲍菇","ko":"새송이버섯","en":"King Oyster Mushroom"}, price: 220 },
      { id: "enoki", name: "えのき", displayNames: {"zh":"金针菇","ko":"팽이버섯","en":"Enoki Mushroom"}, price: 220 },
      { id: "okra", name: "オクラ1本", displayNames: {"zh":"秋葵","ko":"오크라","en":"Okra"}, price: 220 },
      { id: "kanikama", name: "カニカマ", displayNames: {"zh":"蟹棒","ko":"게맛살","en":"Imitation Crab Stick"}, price: 220 },
      { id: "cabbage", name: "キャベツ", displayNames: {"zh":"卷心菜","ko":"양배추","en":"Cabbage"}, price: 220 },
      { id: "asparagus", name: "グリーンアスパラガス1本", displayNames: {"zh":"芦笋","ko":"그린 아스파라거스","en":"Green Asparagus"}, price: 220 },
      { id: "sweet-potato", name: "さつまいも", displayNames: {"zh":"红薯","ko":"고구마","en":"Sweet Potato"}, price: 200 },
      { id: "shimeji", name: "しめじ", displayNames: {"zh":"蟹味菇","ko":"만가닥버섯","en":"Shimeji Mushrooms"}, price: 220 },
      { id: "spam", name: "大判！横切りスパム1枚", displayNames: {"zh":"大块横切午餐肉（1片）","ko":"두툼한 가로컷 스팸 1장","en":"1 Thick-Cut Slice of Spam"}, price: 220 },
      { id: "bok-choy", name: "チンゲン菜", displayNames: {"zh":"上海青","ko":"청경채","en":"Bok Choy"}, price: 280 },
      { id: "nira", name: "ニラ", displayNames: {"zh":"韭菜","ko":"부추","en":"Chinese Chives"}, price: 220 },
      { id: "cilantro", name: "パクチー", displayNames: {"zh":"香菜","ko":"고수","en":"Cilantro"}, price: 320 },
      { id: "baby-corn", name: "ベビーコーン1本", displayNames: {"zh":"玉米笋","ko":"베이비콘","en":"Baby Corn"}, price: 170 },
      { id: "lotus", name: "れんこん1個", displayNames: {"zh":"莲藕","ko":"연근","en":"Lotus Root"}, price: 100 },
      { id: "wakame", name: "わかめ", displayNames: {"zh":"裙带菜","ko":"미역","en":"Wakame Seaweed"}, price: 140 },
      { id: "cabbage-roll", name: "ロールキャベツ1個", displayNames: {"zh":"卷心菜卷","ko":"양배추 롤","en":"Cabbage Roll"}, price: 240 },
      { id: "pea-sprouts", name: "豆苗", displayNames: {"zh":"豆苗","ko":"완두순","en":"Pea Shoots"}, price: 220 },
      { id: "tofu", name: "豆腐", displayNames: {"zh":"豆腐","ko":"두부","en":"Tofu"}, price: 200 },
      { id: "white-negi", name: "白ネギ", displayNames: {"zh":"大葱","ko":"대파","en":"Welsh Onion"}, price: 220 },
      { id: "hakusai", name: "白菜", displayNames: {"zh":"白菜","ko":"배추","en":"Napa Cabbage"}, price: 280 },
      { id: "wood-ear", name: "黒キクラゲ", displayNames: {"zh":"黑木耳","ko":"목이버섯","en":"Wood Ear Mushroom"}, price: 220 },
      { id: "white-jade-wood-ear", name: "【コリコリ】白玉木耳", displayNames: {"zh":"白玉木耳","ko":"백색 목이버섯","en":"White Wood Ear Mushroom"}, price: 260 },
      { id: "taro", name: "里芋1個", displayNames: {"zh":"芋头","ko":"토란","en":"Taro"}, price: 120 },
      { id: "baby-bamboo", name: "姫たけのこ1本", displayNames: {"zh":"小竹笋","ko":"어린 죽순","en":"Baby Bamboo Shoots"}, price: 220 },
      { id: "menma", name: "【もちもち】穂先メンマ", displayNames: {"zh":"糯米笋","ko":"죽순 멘마","en":"Tender Bamboo Menma"}, price: 220 },
      { id: "broccoli", name: "ブロッコリー", displayNames: {"zh":"西兰花","ko":"브로콜리","en":"Broccoli"}, price: 220 },
      { id: "shiitake", name: "しいたけ", displayNames: {"zh":"香菇","ko":"표고버섯","en":"Shiitake Mushroom"}, price: 220 },
      { id: "pumpkin", name: "かぼちゃ", displayNames: {"zh":"南瓜","ko":"단호박","en":"Kabocha Squash"}, price: 220 },
      { id: "white-wood-ear", name: "白きくらげ", displayNames: {"zh":"银耳","ko":"흰목이버섯","en":"White Fungus"}, price: 260 },
      { id: "beef-slice", name: "牛肉スライス(1人前約50g)", displayNames: {"zh":"牛肉片","ko":"소고기 슬라이스","en":"Sliced Beef"}, price: 350 },
      { id: "mochi", name: "国産もち1個", displayNames: {"zh":"国产年糕","ko":"일본산 떡","en":"Japanese Rice Cake"}, price: 160 },
      { id: "spinach", name: "ほうれん草", displayNames: {"zh":"菠菜","ko":"시금치","en":"Spinach"}, price: 220 },
      { id: "eggplant", name: "茄子", displayNames: {"zh":"茄子","ko":"가지","en":"Eggplant"}, price: 220 },
      { id: "cherry-tomato", name: "国産プチトマト1個", displayNames: {"zh":"国产小番茄","ko":"일본산 방울토마토","en":"Japanese Cherry Tomatoes"}, price: 100 },
      { id: "celery", name: "セロリ", displayNames: {"zh":"芹菜","ko":"셀러리","en":"Celery"}, price: 260 },
      { id: "mini-hamburg", name: "ミニハンバーグ１個", displayNames: {"zh":"迷你汉堡排","ko":"미니 함박스테이크","en":"Mini Hamburger Steak"}, price: 220 },
      { id: "soybean-sprouts", name: "【大分県産】小大豆もやし", price: 220 },
      { id: "baby-leaf", name: "【栄養】ベビーリーフ", price: 220 },
      { id: "ganmodoki", name: "ミニがんも1個", displayNames: {"zh":"迷你炸豆腐饼","ko":"미니 두부튀김","en":"Mini Fried Tofu Fritter"}, price: 80 },
      { id: "aburaage", name: "油あげ", displayNames: {"zh":"油豆腐","ko":"유부","en":"Fried Tofu (Aburaage)"}, price: 80 },
      { id: "shishamo", name: "【ぷちぷち】子持ちししゃも一匹", displayNames: {"zh":"柳叶鱼","ko":"알배기 시샤모","en":"Roe Shishamo Smelt"}, price: 180 },
      { id: "bamboo-shoots", name: "たけのこ", displayNames: {"zh":"竹笋","ko":"죽순","en":"Bamboo Shoots"}, price: 220 },
      { id: "nanohana", name: "菜の花", displayNames: {"zh":"菜心","ko":"유채나물","en":"Rapeseed Greens"}, price: 220 },
      { id: "komatsuna", name: "小松菜", displayNames: {"zh":"小松菜","ko":"고마쓰나","en":"Komatsuna Greens"}, price: 240 },
      { id: "lettuce", name: "レタス", displayNames: {"zh":"生菜","ko":"상추","en":"Lettuce"}, price: 220 },
      { id: "water-spinach", name: "空心菜", displayNames: {"zh":"空心菜","ko":"공심채","en":"Water Spinach"}, price: 220 },
    ],
  },
  {
    id: "premium",
    title: "プレミアムトッピング",
    limit: 20,
    perOptionMax: 20,
    items: [
      { id: "pork-slice", name: "【厳選】豚肉スライス(1人前約50g)", displayNames: {"zh":"猪肉片","ko":"돼지고기 슬라이스","en":"Sliced Pork"}, price: 340 },
      { id: "lamb", name: "【高級NZ子羊】厳選ラム肉(1人前約50g)", displayNames: {"zh":"精选羊肉","ko":"엄선한 양고기","en":"Selected Lamb"}, price: 540 },
      { id: "scallop", name: "丸ごとホタテ1個", displayNames: {"zh":"整颗扇贝","ko":"통 가리비","en":"Whole Scallop"}, price: 310 },
      { id: "squid-ring", name: "ヤリイカリング（1人前約50g）", displayNames: {"zh":"枪乌贼圈","ko":"한치 링","en":"Spear Squid Rings"}, price: 310 },
      { id: "white-fish", name: "白身魚", displayNames: {"zh":"白身鱼","ko":"흰살생선","en":"White Fish"}, price: 310 },
      { id: "clam", name: "たっぷりあさり", displayNames: {"zh":"蛤蜊（多份）","ko":"바지락 듬뿍","en":"Extra Clams"}, price: 320 },
      { id: "chicken-slice", name: "【高たんぱく💪】国産とりむねスライス約50g", price: 320 },
      { id: "beef-tripe", name: "牛ハチノス約50g", displayNames: {"zh":"牛肚","ko":"소양","en":"Beef Tripe"}, price: 480 },
      { id: "beef-omasum", name: "【国産】牛センマイ約50g", displayNames: {"zh":"牛百叶","ko":"소 천엽","en":"Beef Omasum Tripe"}, price: 540 },
      { id: "pork-tongue", name: "【国産】豚タン約50g", displayNames: {"zh":"国产猪舌","ko":"일본산 돼지혀","en":"Japanese Pork Tongue"}, price: 400 },
      { id: "pork-liver", name: "【スタミナ💪】国産豚レバー（1人前約50g）", displayNames: {"zh":"国产猪肝","ko":"일본산 돼지간","en":"Japanese Pork Liver"}, price: 320 },
      { id: "pork-offal", name: "ぷりぷり国産牛モツ(1人前約50g)", displayNames: {"zh":"国产牛肠","ko":"국산 소곱창","en":"Japanese Beef Intestine"}, price: 480 },
      { id: "pork-cartilage", name: "【コラーゲン】とろとろ国産豚軟骨(約50g)", displayNames: {"zh":"国产猪软骨","ko":"일본산 돼지연골","en":"Japanese Pork Cartilage"}, price: 480 },
      { id: "beef-suji", name: "【厳選牛】とろとろ国産牛すじ(1人前約50g)", displayNames: {"zh":"软烂国产牛筋","ko":"부드러운 일본산 소힘줄","en":"Tender Japanese Beef Tendon"}, price: 560 },
      { id: "large-shrimp", name: "大海老1匹", displayNames: {"zh":"大虾","ko":"왕새우","en":"King Prawns"}, price: 460 },
      { id: "octopus", name: "【旨味が爆発💥】ぶつ切りたこ🐙（約50g）", displayNames: {"zh":"章鱼块","ko":"문어 조각","en":"Octopus Pieces"}, price: 560 },
      { id: "squid", name: "イカ🦑（約50g）", displayNames: {"zh":"鱿鱼","ko":"오징어","en":"Squid"}, price: 560 },
      { id: "baby-octopus", name: "【주꾸미🐙】丸ごとイイダコ１匹", displayNames: {"zh":"整只小章鱼","ko":"통 쭈꾸미","en":"Whole Baby Octopus"}, price: 480 },
      { id: "surf-clam", name: "【旨味溢れる】ホッキ貝1個", displayNames: {"zh":"北寄贝","ko":"북방조개","en":"Surf Clam"}, price: 260 },
      { id: "beef-red-omasum", name: "【数量限定品】牛赤センマイ（約50g）", displayNames: {"zh":"牛红百叶","ko":"소 홍천엽","en":"Beef Red Omasum Tripe"}, price: 420 },
      { id: "beef-cecum", name: "【数量限定品】牛もうちょう（約50g）", displayNames: {"zh":"牛盲肠","ko":"소 맹장","en":"Beef Cecum"}, price: 460 },
      { id: "smoked-duck", name: "🦆合鴨あぶりスモーク", displayNames: {"zh":"炙烤烟熏鸭胸","ko":"훈제 오리 가슴살","en":"Smoked Seared Duck Breast"}, price: 310 },
      { id: "chicken-liver-heart", name: "鶏レバー＆ハツ", displayNames: {"zh":"鸡肝&鸡心","ko":"닭간 & 닭심장","en":"Chicken Liver & Heart"}, price: 310 },
      { id: "mussels", name: "ムール貝", displayNames: {"zh":"青口贝","ko":"홍합","en":"Mussels"}, price: 320 },
    ],
  },
  {
    id: "vip",
    title: "VIP トッピング",
    limit: 10,
    perOptionMax: 10,
    items: [
      { id: "oyster", name: "【期間限定品】🦪広島県産牡蠣(3個)", displayNames: {"zh":"广岛县产牡蛎（3个）","ko":"히로시마산 굴 (3개)","en":"Hiroshima Oysters (3 Pieces)"}, price: 700 },
      { id: "wagyu", name: "【厳選国産黒毛和牛🥩】極上の肉👑", displayNames: {"zh":"极品黑毛和牛","ko":"최고급 흑모와규","en":"Premium Japanese Black Wagyu"}, price: 2380 },
      { id: "frankfurt", name: "【数量限定𓃟】糸島豚の特大フランクフルト1本", displayNames: {"zh":"糸岛猪特大香肠","ko":"이토시마 돼지 특대 프랑크푸르트","en":"Extra Large Itoshima Pork Frankfurter"}, price: 1000 },
      { id: "camembert", name: "【極上🧀】丸ごとカマンベール", displayNames: {"zh":"整颗卡芒贝尔奶酪","ko":"통 카망베르 치즈","en":"Whole Camembert Cheese"}, price: 1020 },
      { id: "seafood-set", name: "特選海鮮3種盛り👑（大えび1匹、ほたて1個、イカリング約50g）", displayNames: {"zh":"精选三种海鲜拼盘（大虾1只、扇贝1个、鱿鱼圈约50克）","ko":"특선 해산물 3종 모둠 (왕새우 1마리, 가리비 1개, 오징어 링 약 50g)","en":"Premium Seafood Trio (1 King Prawn, 1 Scallop, Approx. 50g Squid Rings)"}, price: 1340 },
      { id: "mozzarella", name: "【ご褒美🫕】丸ごとモッツァレラ１個", displayNames: {"zh":"马苏里拉芝士","ko":"모차렐라 치즈","en":"Mozzarella Cheese Ball"}, price: 1020 },
    ],
  },
  {
    id: "royal-vip",
    title: "ロイヤルVIPトッピング",
    limit: 10,
    perOptionMax: 10,
    items: [
      { id: "snow-crab-claw", name: "特大ずわい蟹爪1個", displayNames: {"zh":"特大雪蟹蟹钳","ko":"특대 대게 집게발","en":"Extra Large Snow Crab Claw"}, price: 860 },
    ],
  },
  {
    id: "request",
    title: "リクエスト制トッピング",
    limit: 10,
    perOptionMax: 10,
    items: [
      { id: "stem-lettuce", name: "山クラゲ🥇", displayNames: {"zh":"贡菜","ko":"궁채","en":"Gongcai (Dried Lettuce Stem)"}, price: 140 },
      { id: "bunmoja", name: "ブンモジャ1本🥈", displayNames: {"zh":"粉耗子","ko":"분모자","en":"Bunmoja Potato Noodles"}, price: 180 },
      { id: "xiaolongbao", name: "もちもち小籠包1個🥉", displayNames: {"zh":"小笼包","ko":"샤오룽바오","en":"Xiaolongbao"}, price: 170 },
    ],
  },
  {
    id: "drink",
    title: "おすすめペアリング",
    limit: 5,
    perOptionMax: 5,
    items: [
      { id: "cola-shot", name: "コーラ1ショット", displayNames: {"zh":"可乐","ko":"콜라","en":"Cola"}, price: 280 },
    ],
  },
  {
    id: "limited",
    title: "限定トッピング",
    limit: 1,
    perOptionMax: 1,
    items: [
      { id: "spicy-meat-miso", name: "特製旨辛肉味噌", displayNames: {"zh":"特制香辣肉味噌","ko":"특제 매콤 고기 미소","en":"Special Savory Spicy Meat Miso Sauce"}, price: 320 },
    ],
  },
];
