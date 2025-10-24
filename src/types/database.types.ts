// هذه هي الجداول كما هي في قاعدة البيانات
export interface WoodType {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
  main_category_id: string;
}

export interface MainCategory {
  id: string;
  name: string;
  color_hex: string | null;
}

export interface Variant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  cost_price: number;
  sale_price: number;
  dimensions: any; // jsonb
  color: string | null;
  style: string | null;
  wood_type_id: string | null;
  image_urls: string[] | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sub_category_id: string | null;
  default_margin_pct: number | null;
}

// هذه هي الأنواع "المُجمعة" (Joined) التي سنستخدمها في الواجهة
export interface VariantWithWood extends Variant {
  wood_types: WoodType | null; 
}

export interface ProductWithDetails extends Product {
  sub_categories: {
    name: string;
    main_categories: {
      name: string;
    } | null;
  } | null;
  variants: VariantWithWood[]; 
}

// --- هذا هو التعريف الذي كان مفقوداً ---
// (تعريف الأدوار بناءً على قاعدة بياناتك)
export type AppRole = "admin" | "employee"; 

export interface Profile {
  id: string;
  full_name: string | null;
  role: AppRole; // <-- الآن هذا التعريف صحيح
  updated_at: string | null;
}