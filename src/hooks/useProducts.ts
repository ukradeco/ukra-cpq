import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { ProductWithDetails } from '../types/database.types';

// اسم المفتاح لـ React Query
const PRODUCTS_QUERY_KEY = 'products';

// دالة لجلب البيانات
const fetchProducts = async (): Promise<ProductWithDetails[]> => {
  console.log('[useProducts] fetchProducts - start');
  // هذا هو الاستعلام المعقد الذي يجمع كل الجداول
  try {
    console.log('[useProducts] calling supabase simple test select (id,name)');
    // First try a simple select to detect RLS/permission/network issues quickly
    const simplePromise = supabase.from('products').select('id,name').limit(5);
    const simpleTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase simple products query timed out')), 15000));
    const simpleResult = (await Promise.race([simplePromise, simpleTimeout]) as any) || {};
    console.log('[useProducts] simple select result:', simpleResult?.data?.length ?? 0, simpleResult?.error ?? null);

    if (simpleResult?.error) {
      console.error('[useProducts] simple select error:', simpleResult.error);
      // If simple select fails, likely RLS or permission issue — return empty array so UI doesn't hang
      return [] as ProductWithDetails[];
    }

    if (Array.isArray(simpleResult.data) && simpleResult.data.length > 0) {
      console.log('[useProducts] simple select succeeded, returning lightweight product list');
      // Map to minimal structure expected
      return (simpleResult.data as any).map((p: any) => ({ id: p.id, name: p.name })) as unknown as ProductWithDetails[];
    }

    // If simple select returned no rows, still attempt the full select (in case nested selects behave differently)
    console.log('[useProducts] simple select returned 0 rows, attempting full nested select');
    const fetchPromise = supabase
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

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase products query timed out')), 10000));
    const { data, error } = await Promise.race([fetchPromise, timeout]) as any;

    if (error) {
      console.error('[useProducts] Error fetching products (full):', error);
      return [] as ProductWithDetails[];
    }

    console.log('[useProducts] fetchProducts - result count:', Array.isArray(data) ? data.length : 0);
    return (data ?? []) as unknown as ProductWithDetails[];
  } catch (err: any) {
    console.error('[useProducts] fetchProducts - caught error:', err);
    // Return empty list so UI can render and we don't stay in loading forever
    return [] as ProductWithDetails[];
  }
};

// الـ "هوك" المخصص الذي سنستخدمه في صفحاتنا
export function useProducts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY], // مفتاح التخزين المؤقت
    queryFn: fetchProducts,         // الدالة التي ستجلب البيانات
    retry: false,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}