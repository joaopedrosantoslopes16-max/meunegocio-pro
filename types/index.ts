export type PurchaseStatus =
  | "pending"
  | "approved"
  | "active"
  | "past_due"
  | "cancelled"
  | "refunded"
  | "chargeback"
  | "failed";

export type SubscriptionStatus =
  | "active"
  | "pending"
  | "cancelled"
  | "refunded"
  | "chargeback"
  | "past_due";

export type PlanName = "essencial" | "pro";

export type KitStatus = "generating" | "ready" | "blocked";

export type ReleaseStage = 0 | 1 | 2 | 3;

export type PostCategory = "venda" | "autoridade" | "relacionamento";

export type TemplateType =
  | "whatsapp_cta"
  | "main_service"
  | "promotion"
  | "authority"
  | "location";

export type AccessAction =
  | "view_kit"
  | "download_post"
  | "download_all"
  | "copy_caption"
  | "copy_whatsapp_message"
  | "copy_site_link"
  | "open_site"
  | "generate_kit"
  | "generate_today_post"
  | "copy_campaign"
  | "copy_recovery_message";

export type VisualStyle =
  | "moderno"
  | "elegante"
  | "clean"
  | "chamativo"
  | "minimalista";

export type TodayPostGoal =
  | "vender"
  | "dica"
  | "chamar_whatsapp"
  | "promocao"
  | "agenda_aberta"
  | "pedir_avaliacao"
  | "stories"
  | "recuperar_clientes";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  email: string;
  buyer_name: string;
  product_id: string;
  product_name: string;
  transaction_id: string;
  platform: string;
  status: PurchaseStatus;
  amount: number;
  currency: string;
  purchased_at: string;
  updated_at: string;
  raw_payload?: Record<string, unknown>;
}

export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  niche: string;
  city: string;
  whatsapp: string;
  instagram: string;
  facebook?: string | null;
  linktree?: string | null;
  booking_url?: string | null;
  address: string;
  main_service: string;
  services: string[];
  primary_color: string;
  secondary_color: string;
  visual_style: VisualStyle;
  font_style?: string | null;
  slug: string;
  cover_image_url: string | null;
  logo_url: string | null;
  professional_photo_url: string | null;
  gallery_images_json: string[];
  custom_links_json: { label: string; url: string; type: string; is_active?: boolean }[];
  benefits_json: string[];
  testimonials_json: { text: string; author: string; stars?: number }[];
  cover_image_position_y?: number | null;
  professional_photo_position_y?: number | null;
  short_description: string | null;
  opening_hours_json: Record<string, string>;
  google_maps_url: string | null;
  services_json: string[];
  created_at: string;
  updated_at: string;
}

export interface Post {
  number: number;
  template_type: TemplateType;
  category: PostCategory;
  title: string;
  subtitle: string;
  caption: string;
  cta: string;
  is_unlocked: boolean;
}

export interface Kit {
  id: string;
  user_id: string;
  business_id: string;
  purchase_id: string | null;
  status: KitStatus;
  release_stage: ReleaseStage;
  purchase_approved_at: string | null;
  day_0_unlocked: boolean;
  day_3_unlocked: boolean;
  day_7_unlocked: boolean;
  site_slug: string;
  site_url: string;
  posts_json: Post[];
  captions_json: string[];
  whatsapp_messages_json: string[];
  instagram_bio: string;
  kit_month: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEntry {
  week: number;
  day: "Segunda" | "Quarta" | "Sexta";
  post_type: string;
  topic: string;
  template_type: TemplateType;
  caption_snippet: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  emoji: string;
  post_title: string;
  post_subtitle: string;
  caption: string;
  whatsapp_message: string;
  cta: string;
}

export interface RecoveryMessage {
  id: string;
  situation: string;
  emoji: string;
  message: string;
}

export interface TodayPost {
  goal: TodayPostGoal;
  post_title: string;
  post_subtitle: string;
  post_cta: string;
  template_type: TemplateType;
  caption: string;
  whatsapp_message: string;
}

export interface Lead {
  id: string;
  business_id: string;
  kit_id: string | null;
  name: string;
  whatsapp: string;
  interest: string;
  created_at: string;
}

export interface AccessLog {
  id: string;
  user_id: string;
  kit_id: string;
  purchase_id: string | null;
  action: AccessAction;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string | null;
  email: string;
  plan_name: PlanName;
  plan_price: number;
  status: SubscriptionStatus;
  kirvano_subscription_id: string | null;
  kirvano_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  last_payment_at: string | null;
  next_billing_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyContent {
  id: string;
  user_id: string;
  subscription_id: string | null;
  business_id: string;
  month: number;
  year: number;
  plan_name: PlanName;
  posts_limit: number;
  captions_limit: number;
  messages_limit: number;
  posts_json: Post[];
  captions_json: string[];
  messages_json: string[];
  campaigns_json: Campaign[];
  calendar_json: CalendarEntry[];
  generated_at: string | null;
  created_at: string;
}

export type ExtraPackageType = "instagram_extra" | "stories" | "reativacao";
export type ExtraPackageStatus = "active" | "pending" | "cancelled" | "refunded" | "chargeback";

export interface ExtraPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  type: ExtraPackageType;
  posts_quantity: number;
  captions_quantity: number;
  stories_quantity: number;
  messages_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserExtraPackage {
  id: string;
  user_id: string | null;
  email: string;
  purchase_id: string | null;
  package_id: string;
  package_name: string;
  package_slug: string;
  status: ExtraPackageStatus;
  transaction_id: string | null;
  posts_added: number;
  captions_added: number;
  stories_added: number;
  messages_added: number;
  purchased_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  content_json?: Record<string, unknown>; // conteúdo gerado do pacote
}

export interface NicheConfig {
  label: string;
  cta: string;
  tone: string;
  services: string[];
  description: string;
  calendarTopics: {
    dica: string;
    servico: string;
    chamada: string;
    educativo: string;
    promocao: string;
    relacionamento: string;
    autoridade: string;
    bastidores: string;
    oferta: string;
    lembrete: string;
    prova: string;
    chamadaFinal: string;
  };
}

export type ContentFormat = "reels" | "carrossel" | "story" | "post" | "whatsapp";
export type ImageType = "cover" | "logo" | "professional" | "post" | "story" | "general";

export interface Narrative {
  title: string;
  angle: string;
  description: string;
}

export interface ReelsScript {
  title: string;
  scenes: { scene: number; description: string; fala: string }[];
  screen_text: string;
  caption: string;
  cta: string;
  whatsapp_message: string;
}

export interface CarouselContent {
  theme: string;
  slides: { slide: number; text: string }[];
  caption: string;
  whatsapp_message: string;
}

export interface StorySequence {
  stories: { story: number; text: string; type?: string }[];
  cta: string;
  whatsapp_message: string;
}

export interface ContentGeneration {
  id: string;
  user_id: string;
  business_id: string;
  topic: string;
  format: ContentFormat;
  narrative_json: Narrative[] | null;
  headlines_json: string[] | null;
  script_json: ReelsScript | null;
  carousel_json: CarouselContent | null;
  stories_json: StorySequence | null;
  caption: string | null;
  whatsapp_message: string | null;
  selected_narrative: string | null;
  selected_headline: string | null;
  created_at: string;
}

export interface ImageGallery {
  id: string;
  user_id: string;
  business_id: string;
  image_url: string;
  storage_path: string;
  image_type: ImageType;
  is_favorite: boolean;
  used_for: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
}

export interface GeneratedPost {
  id: string;
  user_id: string;
  business_id: string;
  template_type: string;
  title: string;
  subtitle: string;
  cta: string;
  caption: string | null;
  whatsapp_message: string | null;
  background_image_url: string | null;
  primary_color: string;
  overlay_opacity: number;
  font_style: string;
  goal: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThemePreference {
  user_id: string;
  theme: "light" | "dark";
  updated_at: string;
}

export interface BusinessFormData {
  business_name: string;
  niche: string;
  city: string;
  whatsapp: string;
  instagram: string;
  address: string;
  main_service: string;
  services: string;
  primary_color: string;
  tagline?: string;
}

export interface PreviewData {
  business_name: string;
  niche: string;
  city: string;
  whatsapp: string;
  instagram: string;
  main_service: string;
  primary_color: string;
  cta: string;
  sample_post_title: string;
  sample_post_subtitle: string;
  sample_caption: string;
  sample_whatsapp_message: string;
  instagram_bio: string;
}
