// Pexels API integration for high-quality curated carousel photos
// Free tier: 200 req/hour — sign up at pexels.com/api

const PEXELS_SEARCH = "https://api.pexels.com/v1/search";

// Per-niche curated search queries — multiple options for seed-based variety
const NICHE_QUERIES: Record<string, string[]> = {
  advocacia: [
    "law office professional",
    "lawyer business meeting",
    "legal documents desk",
    "corporate attorney office",
    "business contract signing",
    "professional office modern",
  ],
  barbearia: [
    "barber shop professional",
    "haircut barbershop man",
    "beard grooming professional",
    "barber scissors hair",
    "modern barbershop interior",
    "men haircut salon",
  ],
  odontologia: [
    "dental clinic professional",
    "dentist office modern",
    "teeth smile beautiful",
    "dental care professional",
    "dentist patient clinic",
    "oral health professional",
  ],
  fitness: [
    "gym workout training",
    "personal trainer athlete",
    "fitness exercise professional",
    "weightlifting gym modern",
    "sports training person",
    "gym equipment workout",
  ],
  restaurante: [
    "restaurant interior elegant",
    "food plate restaurant",
    "chef cooking kitchen",
    "gourmet meal dining",
    "restaurant ambience modern",
    "dining table food",
  ],
  estetica: [
    "beauty salon professional",
    "spa facial treatment",
    "skincare beauty woman",
    "nail art manicure",
    "beauty treatment professional",
    "wellness spa relaxing",
  ],
  fashion: [
    "fashion boutique clothing",
    "elegant clothing store",
    "woman fashion style",
    "boutique interior clothes",
    "fashion model style",
    "clothing rack boutique",
  ],
  mecanica: [
    "car mechanic professional",
    "auto repair garage",
    "mechanic engine work",
    "car workshop professional",
    "automobile maintenance",
    "mechanic tools garage",
  ],
  imobiliaria: [
    "modern house interior",
    "luxury apartment living room",
    "real estate home architecture",
    "elegant home interior",
    "property modern design",
    "house architecture exterior",
  ],
  saude: [
    "doctor clinic professional",
    "medical professional modern",
    "health care consultation",
    "hospital modern facility",
    "doctor patient consultation",
    "medical office professional",
  ],
  consultoria: [
    "business team meeting",
    "office professional team",
    "corporate strategy meeting",
    "business consultation office",
    "professional meeting room",
    "team collaboration office",
  ],
  fotografia: [
    "photography camera professional",
    "photographer studio work",
    "photo studio lighting",
    "camera lens photography",
    "portrait photography studio",
    "photographer work professional",
  ],
  educacao: [
    "education classroom modern",
    "students learning school",
    "teacher classroom education",
    "study books modern",
    "online course education",
    "learning desk student",
  ],
  tecnologia: [
    "technology computer office",
    "developer coding laptop",
    "software tech modern",
    "programmer code screen",
    "tech startup office",
    "computer work professional",
  ],
  default: [
    "business professional office",
    "team work collaboration",
    "professional meeting modern",
    "office workspace modern",
    "business success team",
    "professional service office",
  ],
};

function detectNicheKey(rawNiche: string): string {
  const n = (rawNiche ?? "").toLowerCase();
  if (n.includes("adv") || n.includes("advocac") || n.includes("jurídic") || n.includes("juridic") || n.includes("direito") || n.includes("contábil") || n.includes("contabi")) return "advocacia";
  if (n.includes("barb") || n.includes("cabeleir") || n.includes("salão") || n.includes("salao")) return "barbearia";
  if (n.includes("odonto") || n.includes("dent") || n.includes("ortodon")) return "odontologia";
  if (n.includes("personal") || n.includes("academia") || n.includes("fitness") || n.includes("crossfit") || n.includes("pilates") || n.includes("esport") || n.includes("muscula")) return "fitness";
  if (n.includes("restaur") || n.includes("comida") || n.includes("pizz") || n.includes("hambur") || n.includes("padaria") || n.includes("delivery") || n.includes("café") || n.includes("cafe")) return "restaurante";
  if (n.includes("estet") || n.includes("manicur") || n.includes("cílios") || n.includes("spa") || n.includes("depila") || n.includes("sobrancelh") || n.includes("micropigment")) return "estetica";
  if (n.includes("loja") || n.includes("moda") || n.includes("roupa") || n.includes("ateliê") || n.includes("fashion")) return "fashion";
  if (n.includes("mecani") || n.includes("oficina") || n.includes("autom") || n.includes("pneu")) return "mecanica";
  if (n.includes("imobil") || n.includes("corretor") || n.includes("imovel") || n.includes("imóvel") || n.includes("constru") || n.includes("aluguel")) return "imobiliaria";
  if (n.includes("clínica") || n.includes("clinica") || n.includes("médic") || n.includes("saúde") || n.includes("nutri") || n.includes("psicol") || n.includes("fisioter") || n.includes("veterinár") || n.includes("farmácia") || n.includes("medic")) return "saude";
  if (n.includes("fotograf")) return "fotografia";
  if (n.includes("escola") || n.includes("curso") || n.includes("educação") || n.includes("ensino")) return "educacao";
  if (n.includes("tecnolog") || n.includes("software") || n.includes("ti ") || n.includes("dev")) return "tecnologia";
  if (n.includes("consult") || n.includes("assessor") || n.includes("coach") || n.includes("market") || n.includes("agência") || n.includes("agencia")) return "consultoria";
  return "default";
}

interface PexelsPhoto {
  id: number;
  src: { large2x: string; large: string; medium: string; portrait: string };
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

export async function getPexelsImagesForCarousel(
  rawNiche: string,
  count: number,
  seed: number,
  apiKey: string,
): Promise<string[]> {
  const nicheKey = detectNicheKey(rawNiche);
  const queries = NICHE_QUERIES[nicheKey] ?? NICHE_QUERIES.default;

  // Use seed to pick different queries for variety between regenerations
  const queryIdx = seed % queries.length;
  const secondaryIdx = (seed + 2) % queries.length;

  // Fetch two queries in parallel — more photo variety per carousel
  const perPage = Math.min(count + 3, 15);
  const page = Math.floor(seed / queries.length) % 3 + 1; // cycle through pages 1-3

  const [primary, secondary] = await Promise.all([
    fetchPexels(queries[queryIdx], perPage, page, apiKey),
    fetchPexels(queries[secondaryIdx], perPage, 1, apiKey),
  ]);

  const allPhotos = [...primary, ...secondary];

  // Deterministic shuffle based on seed — same seed = same order
  const shuffled = [...allPhotos].sort((a, b) =>
    ((a.id * (seed + 1)) % 997) - ((b.id * (seed + 1)) % 997)
  );

  const unique = Array.from(new Map(shuffled.map(p => [p.id, p])).values());

  return unique.slice(0, count).map(p =>
    // Prefer portrait (4:5) → large2x → large → medium
    p.src.portrait || p.src.large2x || p.src.large || p.src.medium
  );
}

async function fetchPexels(
  query: string,
  perPage: number,
  page: number,
  apiKey: string,
): Promise<PexelsPhoto[]> {
  try {
    const url = `${PEXELS_SEARCH}?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=portrait`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      // 8s timeout — don't block carousel generation
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data: PexelsResponse = await res.json();
    return data.photos ?? [];
  } catch {
    return [];
  }
}
