export default function Table({ 
  columns = [], 
  data = [], 
  onRowClick = null,
  emptyMessage = 'No data available',
  className = ''
}) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-slate-800 rounded-xl border border-slate-700/70 p-8 text-center ${className}`}>
        <p className="text-slate-500 text-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left font-semibold text-slate-300 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-slate-300 ${column.cellClassName || ''}`}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
