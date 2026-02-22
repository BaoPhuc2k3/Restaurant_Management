export default function Sidebar() {
  return (
    <div className="flex flex-col items-center py-6 space-y-6">
      <div className="text-xl font-bold">PL RES</div>

      <button className="flex flex-col items-center text-sm hover:text-yellow-300">
        🛒
        <span>Bán hàng</span>
      </button>

      <button className="flex flex-col items-center text-sm">
        👤
        <span>Khách hàng</span>
      </button>

      <button className="flex flex-col items-center text-sm">
        ☕
        <span>Thực đơn</span>
      </button>

      <button className="flex flex-col items-center text-sm">
        📊
        <span>Báo cáo</span>
      </button>
    </div>
  );
}
