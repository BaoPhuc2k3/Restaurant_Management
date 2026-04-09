import { FiUsers } from "react-icons/fi";

export default function TableCard({ table, selected, onClick }) {
  const isOccupied = table.status === "Occupied";

  return (
    <div
      onClick={() => onClick(table)}

      className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 flex flex-col items-center justify-center min-h-27.5 gap-2
      ${selected ? "border-blue-500 shadow-lg scale-105" : "border-transparent hover:shadow-md hover:-translate-y-1"}
      ${isOccupied 
        ? "bg-orange-500 text-white shadow-orange-200" 
        : "bg-white text-gray-800 shadow-gray-100"}`}  
    >
      
 
      <div className="font-bold text-sm text-center wrap-break-word w-full">
        {table.name}
      </div>
      

      <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full
        ${isOccupied ? "bg-orange-600/50 text-white" : "bg-gray-100 text-gray-500"}`}>
        <FiUsers /> {table.capacity}
      </div>
      
    </div>
  );
}