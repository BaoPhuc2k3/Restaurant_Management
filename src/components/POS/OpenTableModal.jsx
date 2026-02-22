export default function OpenTableModal({ table, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-whitewhite bg-opacity-40 flex items-center justify-center">

      <div className="bg-white p-6 rounded shadow-lg w-96 text-center">

        <h2 className="text-xl font-bold mb-4">
          Mở {table.name} ?
        </h2>

        <p className="mb-6 text-gray-600">
          Bạn có muốn mở bàn này không?
        </p>

        <div className="flex justify-center space-x-4">

          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Không
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Mở bàn
          </button>

        </div>

      </div>

    </div>
  );
}
