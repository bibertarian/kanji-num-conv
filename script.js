// --- 大字・異体字を標準の漢数字に正規化する ---
function normalizeKanjiNumerals(s) {
  if (!s) return s;

  // 「廿/卄=20」「卅/丗=30」「卌=40」を展開
  s = s
    .replace(/廿|卄/g, "二十")
    .replace(/卅|丗/g, "三十")
    .replace(/卌/g, "四十");

  // 大字や異体字を通常の漢数字へ1文字ずつ置換
  const map = {
    零: "零",
    〇: "〇",
    壱: "一",
    壹: "一",
    弐: "二",
    貳: "二",
    貮: "二",
    参: "三",
    參: "三",
    肆: "四",
    伍: "五",
    陸: "六",
    柒: "七",
    捌: "八",
    玖: "九",
    拾: "十",
    佰: "百",
    仟: "千",
  };

  // 変換対象だけを置換（該当しない文字はそのまま）
  return s.replace(
    /[壱壹弐貳貮参參肆伍陸柒捌玖拾佰仟]/g,
    (ch) => map[ch] || ch
  );
}

// --- 0〜9999 のブロックを計算（十・百・千） ---
const digitMap = {
  零: 0,
  〇: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};
const smallUnits = { 十: 10, 百: 100, 千: 1000 };
const bigUnits = { 兆: 1_0000_0000_0000, 億: 1_0000_0000, 万: 1_0000 };

function parseUnder10000(s) {
  let total = 0;
  let num = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (digitMap.hasOwnProperty(ch)) {
      num = digitMap[ch];
    } else if (smallUnits.hasOwnProperty(ch)) {
      const unit = smallUnits[ch];
      total += (num === 0 ? 1 : num) * unit; // 「十」=10、「二十」=20
      num = 0;
    }
  }
  total += num;
  return total;
}

// --- 万・億・兆 を左から順に処理 ---
function kanjiNumberToArabic(ks) {
  if (!ks) return ks;
  // 大字・異体字を標準形に
  ks = normalizeKanjiNumerals(ks);

  let rest = ks;
  let result = 0;

  for (const unitChar of ["兆", "億", "万"]) {
    const parts = rest.split(unitChar);
    if (parts.length > 1) {
      const left = parts[0];
      const leftVal = left ? parseUnder10000(left) : 1;
      result += leftVal * bigUnits[unitChar];
      rest = parts.slice(1).join(unitChar);
    }
  }
  result += parseUnder10000(rest);
  return String(result);
}

// --- 文章中の「漢数字(＋大字)の連なり」だけを置換 ---
function replaceKanjiNumbersInText(text) {
  // 漢数字＋大字の文字クラス
  const re =
    /[〇零一二三四五六七八九十百千万億兆壱壹弐貳貮参參肆伍陸柒捌玖拾佰仟廿卅丗卌卄]+/g;
  return text.replace(re, (m) => kanjiNumberToArabic(m));
}

document.getElementById("go").addEventListener("click", () => {
  const src = document.getElementById("src").value;
  const out = replaceKanjiNumbersInText(src);
  document.getElementById("dst").textContent = out;
});
