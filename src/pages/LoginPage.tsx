import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';

import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. تعريف مخطط التحقق (Schema) باستخدام Zod
const loginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

// 2. تعريف نوع البيانات بناءً على المخطط
type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema), // 3. ربط Zod مع React Hook Form
  });
  const { signIn } = useAuth();

  // 4. دالة تسجيل الدخول عند إرسال النموذج
  const handleLogin: SubmitHandler<LoginFormInputs> = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);

      // 5. استخدام AuthContext لتسجيل الدخول (يحدث تحديث الحالة محلياً)
      if (!signIn) throw new Error('signIn not available');
      const { error } = await signIn(email, password);
      if (error) throw error;
      
    } catch (error: any) {
      setError(error.message || "فشل تسجيل الدخول. يرجى التأكد من بياناتك.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          تسجيل الدخول - نظام UKRA
        </h2>
        
        {/* 6. ربط النموذج بالدالة */}
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 text-right"
            >
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              {...register("email")} // 7. ربط الحقل
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 text-right">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 text-right"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              {...register("password")} // 8. ربط الحقل
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 text-right">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '...جاري التحميل' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}