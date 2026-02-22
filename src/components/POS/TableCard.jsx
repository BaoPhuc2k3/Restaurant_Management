export default function TableCard({ table, selected, onClick }) {
  return (
    <div
      onClick={() => onClick(table)}
      className={`p-4 rounded shadow cursor-pointer text-center
      ${selected ? "border-2 border-blue-500" : ""}
      ${table.status === "occupied"
          ? "bg-orange-500 text-white"
          : "bg-gray-100"}`}
    >
      <div className="font-semibold">{table.tableName}</div>
      <div className="text-sm">
        {table.status === "occupied" ? "Có khách" : "Trống"}
      </div>
    </div>
  );
}
