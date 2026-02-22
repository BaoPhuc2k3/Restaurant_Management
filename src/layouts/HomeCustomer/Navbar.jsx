import { FiSearch, FiShoppingCart, FiBell, FiUser } from "react-icons/fi";

export default function Navbar() {
  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-white">
        
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl">
          <img src="/logo.png" alt="logo" className="w-8 h-8" />
          JABIRY
        </div>

        {/* Menu */}
        <nav className="hidden md:flex gap-6 text-sm">
          <a href="#" className="hover:text-orange-400">Home</a>
          <a href="#" className="hover:text-orange-400">About</a>
          <a href="#" className="hover:text-orange-400">Menus</a>
          <a href="#" className="hover:text-orange-400">History Order</a>
          <a href="#" className="hover:text-orange-400">Reservations</a>
          <a href="#" className="hover:text-orange-400">Voucher</a>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search for dishes..."
              className="bg-black/40 border border-white/20 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
          </div>

          <FiShoppingCart />
          <FiBell />

          <button className="bg-orange-500 px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-600">
            Booking now
          </button>

          <FiUser />
        </div>
      </div>
    </header>
  );
}
