// Japanese Flick Typing Practice Vocabulary Database

export const KANA_ROWS = {
  hiragana: {
    "あ行": ["あ", "い", "う", "え", "お"],
    "か行": ["か", "き", "く", "け", "こ", "が", "ぎ", "ぐ", "げ", "ご"],
    "さ行": ["さ", "し", "す", "せ", "そ", "ざ", "じ", "ず", "ぜ", "ぞ"],
    "た行": ["た", "ち", "つ", "て", "と", "だ", "ぢ", "づ", "で", "ど", "っ"],
    "な行": ["な", "に", "ぬ", "ね", "の"],
    "は行": ["は", "ひ", "ふ", "へ", "ほ", "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
    "ま行": ["ま", "み", "む", "め", "も"],
    "や行": ["や", "ゆ", "よ", "ゃ", "ゅ", "ょ"],
    "ら行": ["ら", "り", "る", "れ", "ろ"],
    "わ行": ["わ", "を", "ん", "ー"]
  },
  katakana: {
    "ア行": ["ア", "イ", "ウ", "エ", "オ"],
    "カ行": ["カ", "キ", "ク", "ケ", "コ", "ガ", "ギ", "グ", "ゲ", "ゴ"],
    "サ行": ["サ", "シ", "ス", "セ", "ソ", "ザ", "ジ", "ズ", "ゼ", "ゾ"],
    "タ行": ["タ", "チ", "ツ", "テ", "ト", "ダ", "ヂ", "ヅ", "デ", "ド", "ッ"],
    "ナ行": ["ナ", "ニ", "ヌ", "ネ", "ノ"],
    "ハ行": ["ハ", "ヒ", "フ", "ヘ", "ホ", "バ", "ビ", "ブ", "ベ", "ボ", "パ", "ピ", "プ", "ペ", "ポ"],
    "マ行": ["マ", "ミ", "ム", "メ", "モ"],
    "ヤ行": ["ヤ", "ユ", "ヨ", "ャ", "ュ", "ョ"],
    "ラ行": ["ラ", "リ", "ル", "レ", "ロ"],
    "ワ行": ["ワ", "ヲ", "ン", "ー"]
  }
};

export const COMMON_WORDS = [
  // N5 Level Words
  { kanji: "行く", kana: "いく", level: "N5", english: "to go" },
  { kanji: "来る", kana: "くる", level: "N5", english: "to come" },
  { kanji: "食べる", kana: "たべる", level: "N5", english: "to eat" },
  { kanji: "飲む", kana: "のむ", level: "N5", english: "to drink" },
  { kanji: "見る", kana: "みる", level: "N5", english: "to see/watch" },
  { kanji: "聞く", kana: "きく", level: "N5", english: "to listen/hear" },
  { kanji: "書く", kana: "かく", level: "N5", english: "to write" },
  { kanji: "読む", kana: "よむ", level: "N5", english: "to read" },
  { kanji: "話す", kana: "はなす", level: "N5", english: "to speak" },
  { kanji: "買う", kana: "かう", level: "N5", english: "to buy" },
  { kanji: "日本", kana: "にほん", level: "N5", english: "Japan" },
  { kanji: "先生", kana: "せんせい", level: "N5", english: "teacher" },
  { kanji: "学生", kana: "がくせい", level: "N5", english: "student" },
  { kanji: "学校", kana: "がっこう", level: "N5", english: "school" },
  { kanji: "友達", kana: "ともだち", level: "N5", english: "friend" },
  { kanji: "今日", kana: "きょう", level: "N5", english: "today" },
  { kanji: "明日", kana: "あした", level: "N5", english: "tomorrow" },
  { kanji: "昨日", kana: "きのう", level: "N5", english: "yesterday" },
  { kanji: "時間", kana: "じかん", level: "N5", english: "time" },
  { kanji: "車", kana: "くるま", level: "N5", english: "car" },
  { kanji: "電車", kana: "でんしゃ", level: "N5", english: "train" },
  { kanji: "水", kana: "みず", level: "N5", english: "water" },
  { kanji: "お茶", kana: "おちゃ", level: "N5", english: "tea" },
  { kanji: "魚", kana: "さかな", level: "N5", english: "fish" },
  { kanji: "肉", kana: "にく", level: "N5", english: "meat" },

  // N4 Level Words
  { kanji: "始める", kana: "はじめる", level: "N4", english: "to begin" },
  { kanji: "終わる", kana: "おわる", level: "N4", english: "to end" },
  { kanji: "家族", kana: "かぞく", level: "N4", english: "family" },
  { kanji: "旅行", kana: "りょこう", level: "N4", english: "travel" },
  { kanji: "料理", kana: "りょうり", level: "N4", english: "cooking/cuisine" },
  { kanji: "仕事", kana: "しごと", level: "N4", english: "work/job" },
  { kanji: "勉強", kana: "べんきょう", level: "N4", english: "study" },
  { kanji: "音楽", kana: "おんがく", level: "N4", english: "music" },
  { kanji: "映画", kana: "えいが", level: "N4", english: "movie" },
  { kanji: "病院", kana: "びょういん", level: "N4", english: "hospital" },
  { kanji: "自転車", kana: "じてんしゃ", level: "N4", english: "bicycle" },
  { kanji: "地下鉄", kana: "ちかてつ", level: "N4", english: "subway" },
  { kanji: "世界", kana: "せかい", level: "N4", english: "world" },
  { kanji: "空気", kana: "くうき", level: "N4", english: "air" },
  { kanji: "天気", kana: "てんき", level: "N4", english: "weather" },

  // N3 Level Words
  { kanji: "準備", kana: "じゅんび", level: "N3", english: "preparation" },
  { kanji: "連絡", kana: "れんらく", level: "N3", english: "contact/communication" },
  { kanji: "関係", kana: "かんけい", level: "N3", english: "relation/relationship" },
  { kanji: "経済", kana: "けいざい", level: "N3", english: "economy" },
  { kanji: "社会", kana: "しゃかい", level: "N3", english: "society" },
  { kanji: "技術", kana: "ぎじゅつ", level: "N3", english: "technology" },
  { kanji: "希望", kana: "きぼう", level: "N3", english: "hope/wish" },
  { kanji: "表現", kana: "ひょうげん", level: "N3", english: "expression" },
  { kanji: "目的", kana: "もくてき", level: "N3", english: "purpose/goal" },
  { kanji: "環境", kana: "かんきょう", level: "N3", english: "environment" }
];

export const COMMON_PHRASES = [
  { kanji: "こんにちは", kana: "こんにちは", level: "Phrases", english: "Hello" },
  { kanji: "ありがとう", kana: "ありがとう", level: "Phrases", english: "Thank you" },
  { kanji: "お元気ですか", kana: "おげんきですか", level: "Phrases", english: "How are you?" },
  { kanji: "はじめまして", kana: "はじめまして", level: "Phrases", english: "Nice to meet you" },
  { kanji: "よろしくおねがいします", kana: "よろしくおねがいします", level: "Phrases", english: "Please be kind to me" },
  { kanji: "すみません", kana: "すみません", level: "Phrases", english: "Excuse me / I'm sorry" },
  { kanji: "ごめんなさい", kana: "ごめんなさい", level: "Phrases", english: "I'm sorry" },
  { kanji: "いただきます", kana: "いただきます", level: "Phrases", english: "Thank you for the meal (before eating)" },
  { kanji: "ごちそうさまでした", kana: "ごちそうさまでした", level: "Phrases", english: "Thank you for the meal (after eating)" },
  { kanji: "おやすみなさい", kana: "おやすみなさい", level: "Phrases", english: "Good night" },
  { kanji: "いってらっしゃい", kana: "いってらっしゃい", level: "Phrases", english: "Take care / Have a good day" },
  { kanji: "いってきます", kana: "いいてきます", level: "Phrases", english: "I'm leaving (home)" },
  { kanji: "ただいま", kana: "ただいま", level: "Phrases", english: "I'm home" },
  { kanji: "おかえりなさい", kana: "おかえりなさい", level: "Phrases", english: "Welcome back" },
  { kanji: "お疲れ様でした", kana: "おつかれさまでした", level: "Phrases", english: "Thank you for your hard work" }
];
