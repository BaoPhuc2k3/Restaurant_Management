export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 1. Khai báo keyframes (Các khung hình của chuyển động)
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      // 2. Đặt tên class animation để dùng trong HTML
      animation: {
        'fade-in-down': 'fadeInDown 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
