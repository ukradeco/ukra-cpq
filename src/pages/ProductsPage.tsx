import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext'; 

export default function ProductsPage() {
  const { data: products, isLoading, error } = useProducts();
  const { role } = useAuth(); // <-- الآن سيأتي الدور "admin" أو "employee"

  const getProductImage = (product: any): string => {
    const variantWithImage = product.variants.find(
      (v: any) => v.image_urls && v.image_urls.length > 0
    );
    if (variantWithImage) {
      return variantWithImage.image_urls[0];
    }
    return "https://via.placeholder.com/100?text=No+Image"; 
  };
  
  const getFirstVariantPrice = (product: any, type: 'cost' | 'sale') => {
    if (product.variants.length === 0) return 0;
    const price = type === 'cost' 
      ? product.variants[0].cost_price 
      : product.variants[0].sale_price;
    return price.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">إدارة المنتجات</h1>
        
        {/* --- التعديل هنا: "admin" بدلاً من "manager" --- */}
        {role === 'admin' && (
          <button 
            className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-hover"
            style={{ backgroundColor: '#8B4513' }}
          >
            + إضافة منتج جديد
          </button>
        )}
      </div>

      {isLoading && <p>جاري تحميل المنتجات...</p>}
      {error && <p className="text-red-600">حدث خطأ: {error.message}</p>}

      {products && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-right">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الصورة</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">المتغيرات</th>
                
                {/* --- التعديل هنا: "admin" بدلاً من "manager" --- */}
                {role === 'admin' && (
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    متوسط التكلفة (للمدير)
                  </th>
                )}
                
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  متوسط سعر البيع
                </th>
                
                {/* --- التعديل هنا: "admin" بدلاً من "manager" --- */}
                {role === 'admin' && (
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded" 
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {product.sub_categories?.main_categories?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {product.variants.length}
                    </span>
                  </td>
                  
                  {/* --- التعديل هنا: "admin" بدلاً من "manager" --- */}
                  {role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800 font-semibold">
                        {getFirstVariantPrice(product, 'cost')}
                      </div>
                    </td>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800">
                      {getFirstVariantPrice(product, 'sale')}
                    </div>
                  </td>
                  
                  {/* --- التعديل هنا: "admin" بدلاً من "manager" --- */}
                  {role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900 ml-4">تعديل</a>
                      <a href="#" className="text-red-600 hover:text-red-900">حذف</a>
                    </td>
                  )}
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}