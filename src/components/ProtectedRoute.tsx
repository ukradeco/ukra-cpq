import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  console.log('ProtectedRoute - Session:', session, 'Loading:', loading);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-xl">جاري تحميل بيانات المصادقة...</div>
    </div>;
  }

  // إذا كان المستخدم مسجلاً (لديه جلسة)، اسمح له بالمرور
  if (session) {
    return <Outlet />; // <Outlet /> هي الصفحة التي يحاول الوصول إليها
  }

  // إذا لم يكن مسجلاً، أعد توجيهه لصفحة تسجيل الدخول
  return <Navigate to="/login" replace />;
}