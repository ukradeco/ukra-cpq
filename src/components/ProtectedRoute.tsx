import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  console.log('ProtectedRoute - Session:', session, 'Loading:', loading);

  // Show loading only when we are still loading AND there is no session yet.
  // This prevents blocking the app when a session exists but some background
  // profile fetch is still in progress.
  if (loading && !session) {
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