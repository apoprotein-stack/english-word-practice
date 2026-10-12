// The hyphen package ships without type declarations.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { hyphenateSync } = require("hyphen/en-us") as {
  hyphenateSync: (text: string, options?: { hyphenChar?: string; minWordLength?: number }) => string;
};

const VOWEL = /[aeiouy]/;
// Consonant pairs that usually start a syllable together (pre-pare, ta-ble).
const ONSET_PAIRS = new Set(["bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "ph", "pl", "pr", "sc", "sh", "sk", "sl", "sm", "sn", "sp", "st", "sw", "th", "tr", "tw", "wh", "wr", "qu"]);

/** Spans of pronounced vowel groups, dropping a silent final e and a silent -es/-ed. */
function vowelGroups(word: string): [number, number][] {
  const groups: [number, number][] = [];
  let i = 0;
  while (i < word.length) {
    const isVowel = VOWEL.test(word[i]) && !(word[i] === "y" && i === 0);
    if (!isVowel) {
      i++;
      continue;
    }
    let j = i + 1;
    // A "y" followed by a vowel starts a new syllable (be-yond).
    while (j < word.length && VOWEL.test(word[j]) && !(word[j] === "y" && j + 1 < word.length && VOWEL.test(word[j + 1]))) j++;
    groups.push([i, j]);
    i = j;
  }
  const last = groups[groups.length - 1];
  if (groups.length > 1 && last) {
    const tail = word.slice(last[0]);
    const silentE = tail === "e" && !/[^aeiouy]le$/.test(word);
    const silentSuffix = (tail === "es" || tail === "ed") && !/[td]ed$|(?:s|x|z|ch|sh|c|g)es$/.test(word);
    if (silentE || silentSuffix) groups.pop();
  }
  return groups;
}

/** Splits one hyphenation chunk with V-CV / VC-CV rules. */
function splitChunk(chunk: string): string[] {
  const lower = chunk.toLowerCase();
  const groups = vowelGroups(lower);
  if (groups.length < 2) return [chunk];
  const parts: string[] = [];
  let start = 0;
  for (let k = 0; k < groups.length - 1; k++) {
    const vowelEnd = groups[k][1];
    const nextVowel = groups[k + 1][0];
    const consonants = lower.slice(vowelEnd, nextVowel);
    let cut: number;
    if (consonants.length <= 1) cut = vowelEnd;
    else if (ONSET_PAIRS.has(consonants.slice(-2))) cut = nextVowel - 2;
    else cut = nextVowel - 1;
    if (cut > start) {
      parts.push(chunk.slice(start, cut));
      start = cut;
    }
  }
  parts.push(chunk.slice(start));
  return parts.filter(Boolean);
}

/**
 * Approximate syllable split for an English word, e.g. "breathtaking" → ["breath", "tak", "ing"].
 * Uses TeX (Liang) hyphenation patterns, then splits the edge chunks those patterns leave whole.
 * Results can differ slightly from dictionary syllabification.
 */
export function splitSyllables(word: string): string[] {
  if (!/^[A-Za-z]+$/.test(word)) return word.split(/[\s-]+/).filter(Boolean).flatMap((part) => (/^[A-Za-z]+$/.test(part) ? splitSyllables(part) : [part]));
  return hyphenateSync(word, { hyphenChar: "-", minWordLength: 2 }).split("-").flatMap(splitChunk);
}
