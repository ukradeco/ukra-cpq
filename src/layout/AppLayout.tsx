import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();
  console.log('AppLayout - User:', user);

  const { signOut } = useAuth();

  const handleLogout = async () => {
    console.log('Logging out via AuthContext...');
    try {
      const res = await signOut();
      console.log('signOut result:', res);
    } catch (err) {
      console.error('Error during signOut:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100" style={{ direction: 'rtl' }}>

      {/* 1. الشريط الجانبي (Sidebar) - يستخدم اللون الأساسي */}
      <aside className="w-64 bg-primary text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          UKRA
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/" 
            className="block px-4 py-2 rounded bg-primary-hover"
          >
            لوحة التحكم
          </Link>
          <Link 
            to="/quotes" 
            className="block px-4 py-2 rounded hover:bg-primary-hover"
          >
            عروض الأسعار
          </Link>
          <Link 
            to="/products" 
            className="block px-4 py-2 rounded hover:bg-primary-hover"
          >
            إدارة المنتجات
          </Link>
          {/* سنضيف المزيد من الروابط هنا لاحقاً */}
        </nav>
      </aside>

      {/* 2. مساحة المحتوى الرئيسية */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* 3. الشريط العلوي (Topbar) */}
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <div>
            <span className="text-sm text-gray-600">
              مرحباً, {user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            تسجيل الخروج
          </button>
        </header>

        {/* 4. محتوى الصفحة (هنا ستظهر لوحة التحكم، المنتجات، إلخ) */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet /> {/* <-- react-router-dom سيضع الصفحات هنا */}
        </div>
      </main>
    </div>
  );
}