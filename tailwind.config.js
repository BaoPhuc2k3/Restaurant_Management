import plugin from 'tailwindcss/plugin'; // 🔥 1. Thêm dòng import này ở trên cùng

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 1. Khai báo keyframes (Các khung hình của chuyển động) giữ nguyên
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      // 2. Đặt tên class animation để dùng trong HTML giữ nguyên
      animation: {
        'fade-in-down': 'fadeInDown 0.3s ease-out forwards',
      }
    },
  },
  plugins: [
    // 🔥 2. Thêm plugin cấu hình khổ giấy in vào mảng plugins này
    plugin(function ({ addBase }) {
      addBase({
        '@media print': {
          /* 1. Khổ giấy in không cần important */
          '@page': {
            size: '80mm auto',
            margin: '0mm',
          },
          /* 2. Dùng !important để chém bay màu mọi class từ trang POS */
          'body *': {
            visibility: 'hidden !important',
          },
          /* 3. Dùng !important để ép tờ hóa đơn phải hiện hình */
          '#receipt-content, #receipt-content *': {
            visibility: 'visible !important',
          },
          /* 4. Dùng !important để kéo tờ hóa đơn lên góc trái */
          '#receipt-content': {
            position: 'absolute !important',
            left: '0 !important',
            top: '0 !important',
            width: '80mm !important',
            margin: '0 !important',
            padding: '10px !important',
            background: 'white !important',
          }
        },
      });
    }),
  ],
}