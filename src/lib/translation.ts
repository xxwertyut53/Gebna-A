export type TranslationLanguage = "en" | "tr" | "ar";

function normalizeText(v: unknown) {
  if (typeof v !== "string") return "";
  return v.trim();
}

export function getFirstNonEmptyText(values: Partial<Record<TranslationLanguage, unknown>>) {
  const en = normalizeText(values.en);
  if (en) return { lang: "en" as const, text: en };
  const tr = normalizeText(values.tr);
  if (tr) return { lang: "tr" as const, text: tr };
  const ar = normalizeText(values.ar);
  if (ar) return { lang: "ar" as const, text: ar };
  return null;
}

async function libreTranslate(text: string, source: TranslationLanguage, target: TranslationLanguage) {
  const baseUrl = (process.env.LIBRETRANSLATE_URL || "").trim();
  if (!baseUrl) throw new Error("Missing LIBRETRANSLATE_URL");
  const url = baseUrl.replace(/\/+$/, "") + "/translate";
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q: text, source, target, format: "text" }),
  });
  const data = await res.json().catch(() => null) as { translatedText?: string; error?: unknown } | null;
  if (!res.ok || !data?.translatedText) throw new Error(typeof data?.error === "string" ? data.error : `Translate failed (${res.status})`);
  return data.translatedText;
}

async function myMemoryTranslate(text: string, source: TranslationLanguage, target: TranslationLanguage) {
  const langMap: Record<TranslationLanguage, string> = { en: "en", tr: "tr", ar: "ar" };
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langMap[source]}|${langMap[target]}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => null) as { responseData?: { translatedText?: string } } | null;
  if (!res.ok || !data?.responseData?.translatedText) throw new Error("MyMemory translation failed");
  return data.responseData.translatedText;
}

export async function autofillTrilingualText(input: Partial<Record<TranslationLanguage, unknown>>) {
  const en = normalizeText(input.en);
  const tr = normalizeText(input.tr);
  const ar = normalizeText(input.ar);
  const seed = getFirstNonEmptyText({ en, tr, ar });
  if (!seed) return { en: "", tr: "", ar: "" };
  const out: Record<TranslationLanguage, string> = { en, tr, ar };

  const missing: TranslationLanguage[] = (["en", "tr", "ar"] as const).filter((l) => !out[l]);
  if (!missing.length) return out;

  await Promise.all(missing.map(async (target) => {
    const source = seed.lang === target ? (["en", "tr", "ar"] as const).find((l) => l !== target && out[l]) : seed.lang;
    const sourceText = source ? out[source] : seed.text;
    if (!sourceText) return;
    try {
      out[target] = await libreTranslate(sourceText, (source || seed.lang) as TranslationLanguage, target);
    } catch (e) {
      // Fallback to MyMemory if LibreTranslate fails
      out[target] = await myMemoryTranslate(sourceText, (source || seed.lang) as TranslationLanguage, target);
    }
  }));

  return out;
}
