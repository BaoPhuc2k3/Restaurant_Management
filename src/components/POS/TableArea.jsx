import TableCard from "./TableCard";

export default function TableArea({
  tables,
  selectedTable,
  onSelectTable
}) {

  return (
    <div className="grid grid-cols-3 gap-3">
      {tables.map(table => (
        <TableCard
          key={table.id}
          table={table}
          selected={selectedTable?.id === table.id}
          onClick={onSelectTable}
        />
      ))}
    </div>
  );
}
