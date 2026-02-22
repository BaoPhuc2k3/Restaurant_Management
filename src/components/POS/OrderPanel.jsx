export default function OrderPanel({
  table,
  order,
  onIncrease,
  onDecrease,
  onRemove,
  onPayment
}) {

  if (!table) {
    return <div className="text-gray-500">Chọn bàn để bắt đầu order</div>;
  }

  const total = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="flex flex-col h-full">

      <h2 className="text-xl font-bold mb-4">{table.tableName}</h2>
      

      <div className="flex-1 space-y-3 overflow-y-auto">

        {order.map(item => (
          <div
            key={item.id}
            className="bg-gray-100 p-3 rounded shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-600">
                  {item.price.toLocaleString()}đ
                </div>
              </div>


              <div className="flex items-center space-x-2">

                <button
                  onClick={() => onDecrease(item.id)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  −
                </button>

                <span className="font-semibold">
                  {item.quantity}
                </span>

                <button
                  onClick={() => onIncrease(item.id)}
                  className="bg-green-500 text-white px-2 rounded"
                >
                  +
                </button>

                {/* Remove button */}
                <button
                  onClick={() => onRemove(item.id)}
                  className="ml-3 text-red-600 font-bold"
                >
                  🗑
                </button>

              </div>
            </div>

            <div className="text-right font-semibold mt-1">
              {(item.price * item.quantity).toLocaleString()}đ
            </div>
          </div>
        ))}

      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between font-semibold text-lg">
          <span>Khách phải trả:</span>
          <span className="text-red-500">
            {total.toLocaleString()}đ
          </span>
        </div>
        <button
  onClick={onPayment}
  className="w-full mt-4 bg-green-600 text-white py-2 rounded"
>
  THANH TOÁN
</button>

      </div>

    </div>
  );
}
