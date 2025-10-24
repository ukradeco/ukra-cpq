/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. إضافة خطوط نظيفة واحترافية (مطابقة لروح الكتالوج)
      fontFamily: {
        sans: ['system-ui', 'sans-serif'], // خط عصري ونظيف
      },

      // 2. إضافة ألوان UKRA الأساسية من الكتالوج
      colors: {
        'ukra-brown': '#8B4513',   // الأخشاب والغرف
        'ukra-purple': '#8A2BE2', // الأكسسوارات العامة
        'ukra-mint': '#98FB98',    // وسائل الراحة
        'ukra-blue': '#4682B4',    // إكسسوارات الحمام

        // 3. تعريف ألوان أساسية لواجهة المستخدم
        'primary': {
          DEFAULT: '#36454F', // لون أساسي غامق (للسيدبار مثلاً)
          hover: '#4F626E',
        },
        'secondary': {
          DEFAULT: '#8B4513', // اللون البني كـ "ثانوي"
          hover: '#A0522D',
        }
      },
    },
  },
  plugins: [],
}