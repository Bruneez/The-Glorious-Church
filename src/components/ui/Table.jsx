export default function Table({ 
  columns = [], 
  data = [], 
  onRowClick = null,
  emptyMessage = 'No data available',
  className = '',
  getRowKey = null,
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
                  className={`px-4 py-3.5 text-left font-semibold text-slate-300 uppercase tracking-wider align-middle ${column.className || ''}`}
                >
                  {typeof column.headerRender === 'function' ? column.headerRender() : column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const rowKey = typeof getRowKey === 'function' ? getRowKey(row, rowIndex) : rowIndex;
              const isInteractive = typeof onRowClick === 'function';

              const handleRowActivate = () => {
                if (isInteractive) onRowClick(row);
              };

              const handleRowKeyDown = (event) => {
                if (!isInteractive) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onRowClick(row);
                }
              };

              return (
              <tr
                key={rowKey}
                onClick={isInteractive ? handleRowActivate : undefined}
                onKeyDown={handleRowKeyDown}
                role={isInteractive ? 'button' : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                aria-label={isInteractive && row.fullName ? `View profile for ${row.fullName}` : undefined}
                className={`border-b border-slate-700/50 transition ${
                  isInteractive
                    ? 'cursor-pointer hover:bg-slate-700/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500/70'
                    : 'hover:bg-slate-700/30'
                }`}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
