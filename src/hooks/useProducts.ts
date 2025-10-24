import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { ProductWithDetails } from '../types/database.types';

// اسم المفتاح لـ React Query
const PRODUCTS_QUERY_KEY = 'products';

// دالة لجلب البيانات
const fetchProducts = async (): Promise<ProductWithDetails[]> => {
  // هذا هو الاستعلام المعقد الذي يجمع كل الجداول
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      default_margin_pct,
      
      sub_categories (
        name,
        main_categories (
          name
        )
      ),
      
      variants (
        *,
        wood_types (
          name
        )
      )
    `)
    .order('name'); // ترتيب أبجدي

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }

  // Supabase قد لا يُرجع البيانات بالشكل الصحيح لـ TypeScript
  // لذلك نقوم بعمل "cast" آمن لها
  return data as unknown as ProductWithDetails[];
};

// الـ "هوك" المخصص الذي سنستخدمه في صفحاتنا
export function useProducts() {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY], // مفتاح التخزين المؤقت
    queryFn: fetchProducts,         // الدالة التي ستجلب البيانات
  });
}