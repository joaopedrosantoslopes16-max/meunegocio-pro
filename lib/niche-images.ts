// Curated compound keyword pools per niche for LoremFlickr
// LoremFlickr with compound keywords (keyword1,keyword2) does AND-filtering on Flickr tags
// → much more accurate than single generic keywords like "lawyer" (which returned volleyball)

type NicheImageKey =
  | "advocacia" | "barbearia" | "odontologia" | "fitness" | "restaurante"
  | "estetica" | "fashion" | "mecanica" | "imobiliaria" | "saude"
  | "consultoria" | "fotografia" | "educacao" | "tecnologia" | "default";

// Each niche has 8+ compound keyword pairs, one per slide position — ensures visual variety
const NICHE_SLIDE_QUERIES: Record<NicheImageKey, string[]> = {
  advocacia: [
    "business,desk",
    "office,corporate",
    "contract,signature",
    "meeting,professional",
    "office,documents",
    "businessman,suit",
    "conference,business",
    "office,formal",
  ],
  barbearia: [
    "haircut,man",
    "barber,professional",
    "barbershop,interior",
    "beard,grooming",
    "salon,man",
    "hairstyle,man",
    "scissors,hair",
    "barbershop,style",
  ],
  odontologia: [
    "smile,dental",
    "dentist,professional",
    "clinic,medical",
    "teeth,health",
    "dental,office",
    "smile,white",
    "clinic,doctor",
    "dental,care",
  ],
  fitness: [
    "gym,workout",
    "exercise,fitness",
    "training,sport",
    "bodybuilding,gym",
    "fitness,health",
    "sport,athlete",
    "gym,equipment",
    "fitness,woman",
  ],
  restaurante: [
    "restaurant,interior",
    "food,plate",
    "chef,cooking",
    "meal,restaurant",
    "dining,table",
    "food,delicious",
    "restaurant,food",
    "kitchen,chef",
  ],
  estetica: [
    "beauty,salon",
    "spa,relaxation",
    "skincare,beauty",
    "nail,art",
    "facial,treatment",
    "beauty,woman",
    "salon,treatment",
    "spa,wellness",
  ],
  fashion: [
    "fashion,boutique",
    "clothing,style",
    "boutique,interior",
    "woman,fashion",
    "clothes,shopping",
    "dress,fashion",
    "fashion,store",
    "clothing,elegant",
  ],
  mecanica: [
    "car,mechanic",
    "automobile,workshop",
    "garage,repair",
    "car,engine",
    "mechanic,working",
    "car,maintenance",
    "auto,repair",
    "workshop,tools",
  ],
  imobiliaria: [
    "house,interior",
    "modern,home",
    "apartment,luxury",
    "real,estate",
    "architecture,home",
    "living,room",
    "house,modern",
    "property,elegant",
  ],
  saude: [
    "doctor,clinic",
    "medical,professional",
    "health,care",
    "hospital,modern",
    "consultation,medical",
    "doctor,patient",
    "clinic,white",
    "medicine,health",
  ],
  consultoria: [
    "business,meeting",
    "office,team",
    "corporate,desk",
    "team,collaboration",
    "conference,office",
    "business,professional",
    "strategy,business",
    "office,work",
  ],
  fotografia: [
    "photography,camera",
    "photographer,studio",
    "photo,studio",
    "camera,lens",
    "portrait,photography",
    "studio,lighting",
    "photographer,work",
    "photo,equipment",
  ],
  educacao: [
    "education,classroom",
    "school,students",
    "learning,books",
    "teacher,school",
    "study,education",
    "classroom,modern",
    "course,education",
    "study,desk",
  ],
  tecnologia: [
    "technology,computer",
    "software,developer",
    "computer,code",
    "tech,office",
    "developer,coding",
    "technology,screen",
    "computer,work",
    "digital,technology",
  ],
  default: [
    "business,office",
    "professional,work",
    "team,meeting",
    "office,corporate",
    "business,team",
    "work,professional",
    "office,modern",
    "business,success",
  ],
};

function detectNicheImageKey(rawNiche: string): NicheImageKey {
  const n = (rawNiche ?? "").toLowerCase();
  if (n.includes("adv") || n.includes("advocac") || n.includes("jurídic") || n.includes("juridic") ||
      n.includes("direito") || n.includes("contábil") || n.includes("contabi") || n.includes("contador")) return "advocacia";
  if (n.includes("barb") || n.includes("cabeleir") || n.includes("salão") || n.includes("salao")) return "barbearia";
  if (n.includes("odonto") || n.includes("dent") || n.includes("ortodon")) return "odontologia";
  if (n.includes("personal") || n.includes("academia") || n.includes("fitness") || n.includes("crossfit") ||
      n.includes("pilates") || n.includes("muscula") || n.includes("esport")) return "fitness";
  if (n.includes("restaur") || n.includes("comida") || n.includes("pizza") || n.includes("hambur") ||
      n.includes("padaria") || n.includes("confeit") || n.includes("delivery") || n.includes("café") ||
      n.includes("cafe") || n.includes("sushi") || n.includes("açaí")) return "restaurante";
  if (n.includes("estet") || n.includes("manicur") || n.includes("cílios") || n.includes("spa") ||
      n.includes("depila") || n.includes("micropigment") || n.includes("sobrancelh")) return "estetica";
  if (n.includes("loja") || n.includes("moda") || n.includes("roupa") || n.includes("ateliê") || n.includes("fashion")) return "fashion";
  if (n.includes("mecani") || n.includes("oficina") || n.includes("autom") || n.includes("pneu") || n.includes("funilaria")) return "mecanica";
  if (n.includes("imobil") || n.includes("corretor") || n.includes("imovel") || n.includes("imóvel") ||
      n.includes("apartam") || n.includes("aluguel") || n.includes("constru")) return "imobiliaria";
  if (n.includes("clínica") || n.includes("clinica") || n.includes("médic") || n.includes("saúde") ||
      n.includes("nutri") || n.includes("psicol") || n.includes("terapia") || n.includes("fisioter") ||
      n.includes("veterinár") || n.includes("farmácia") || n.includes("farmacia") || n.includes("medic")) return "saude";
  if (n.includes("fotograf")) return "fotografia";
  if (n.includes("escola") || n.includes("curso") || n.includes("educação") || n.includes("ensino")) return "educacao";
  if (n.includes("tecnolog") || n.includes("software") || n.includes("ti ") || n.includes("dev")) return "tecnologia";
  if (n.includes("consult") || n.includes("assessor") || n.includes("coach") || n.includes("mentor") ||
      n.includes("market") || n.includes("agência") || n.includes("agencia")) return "consultoria";
  return "default";
}

// Returns an array of LoremFlickr URLs using compound keywords
// lock values are spread to ensure different photos per slide and per regeneration
export function getNicheImageUrls(rawNiche: string, count: number, seed = 0): string[] {
  const key = detectNicheImageKey(rawNiche);
  const queries = NICHE_SLIDE_QUERIES[key];

  return Array.from({ length: count }, (_, i) => {
    const queryIdx = (seed * 3 + i) % queries.length;
    const query = queries[queryIdx];
    const lock = seed * 97 + i * 13 + queryIdx * 5 + 1;
    return `https://loremflickr.com/1080/1350/${query}?lock=${lock}`;
  });
}

// Returns the cover-specific keyword (most visually impactful for niche)
export function getNicheCoverImageUrl(rawNiche: string, seed = 0): string {
  const key = detectNicheImageKey(rawNiche);
  const queries = NICHE_SLIDE_QUERIES[key];
  const lock = seed * 97 + 1;
  return `https://loremflickr.com/1080/1350/${queries[0]}?lock=${lock}`;
}
