import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// استيراد الهيكل
import AppLayout from './layout/AppLayout'; 
    
// استيراد الصفحات
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage'; // <-- 1. استيراد الصفحة الجديدة
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { session, loading } = useAuth();
  console.log('App rendering - Session:', session, 'Loading:', loading);

  return (
    <BrowserRouter>
      <Routes>
        {/* المسار العام: صفحة تسجيل الدخول */}
        <Route 
          path="/login" 
          element={session ? <Navigate to="/" replace /> : <LoginPage />} 
        />

        {/* المسارات المحمية (كلها ستستخدم الهيكل الجديد) */}
        <Route element={<ProtectedRoute />}>
          
          {/* تطبيق الهيكل الرئيسي */}
          <Route element={<AppLayout />}>
            
            {/* الصفحات الداخلية ستظهر داخل الهيكل */}
            <Route path="/" element={<DashboardPage />} />
            
            {/* 2. إضافة المسار الجديد */}
            <Route path="/products" element={<ProductsPage />} />
            
            {/* <Route path="/quotes" element={<div>صفحة عروض الأسعار</div>} /> */}
          
          </Route>
        
        </Route>

        {/* أي مسار آخر غير معروف */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;