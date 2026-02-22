// import { useNavigate } from "react-router-dom";
// import { isAuthenticated } from "../../utils/auth";

export default function Hero({onBooking}) {
    // const navigate = useNavigate();

    // const handleBooking = () => {
    //   if (!isAuthenticated()) {
    //     navigate("/login", {
    //       state: { from: "/booking/date" }
    //     });
    //   } else {
    //     navigate("/booking/date");
    //   }
    // };
  return (
    <section
      className="h-screen bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1552566626-52f8b828add9')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-3xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Exquisite Dining Experience
          </h1>

          <p className="text-gray-200 mb-8">
            Indulge in culinary perfection crafted by world-renowned chefs
          </p>

          <div className="flex justify-center gap-4">
            <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200">
              Explore Menu
            </button>

            <button onClick={onBooking} className="bg-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-orange-600">
              Reserve Table
            </button>
          </div>
        </div>
      </div>

      {/* Floating chat */}
      <button className="fixed bottom-6 right-6 bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg">
        💬
      </button>
    </section>
  );
}
