import ServiceProgramRowActions from '@/components/features/service-program/ServiceProgramRowActions';
import {
  ProgramFieldBlock,
  ProgramFieldInput,
  ProgramFieldValue,
} from '@/components/features/service-program/ServiceProgramField';
import {
  SERVICE_PROGRAM_EMPTY_MESSAGE,
  SERVICE_PROGRAM_ROW_FIELDS,
  SERVICE_PROGRAM_VIEW_EMPTY_MESSAGE,
  getServiceProgramFieldCellClass,
} from '@/config/serviceProgramOptions';

function ServiceProgramMobileCards({
  rows = [],
  canManage = false,
  onRowChange,
  onMoveUp,
  onMoveDown,
  onDeleteRow,
  emptyMessage,
}) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-slate-700/70 bg-slate-800 p-8 text-center md:hidden">
        <p className="text-slate-500 text-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row, rowIndex) => (
        <article
          key={row.id}
          className="rounded-xl border border-slate-700/70 bg-slate-800 p-4 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICE_PROGRAM_ROW_FIELDS.map((field) => (
              <ProgramFieldBlock
                key={field.key}
                field={field}
                row={row}
                canManage={canManage}
                onRowChange={onRowChange}
              />
            ))}
          </div>
          {canManage ? (
            <div className="pt-2 border-t border-slate-700/60">
              <ServiceProgramRowActions
                rowIndex={rowIndex}
                totalRows={rows.length}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onDelete={onDeleteRow}
                compact
              />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function ServiceProgramDesktopTable({
  rows = [],
  canManage = false,
  onRowChange,
  onMoveUp,
  onMoveDown,
  onDeleteRow,
  emptyMessage,
}) {
  const visibleColumns = canManage
    ? [...SERVICE_PROGRAM_ROW_FIELDS, { key: 'actions', label: 'Actions' }]
    : SERVICE_PROGRAM_ROW_FIELDS;

  return (
    <div className="hidden md:block bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[960px]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3.5 text-left font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap ${
                    column.key === 'actions' ? 'text-right' : ''
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition align-top"
                >
                  {SERVICE_PROGRAM_ROW_FIELDS.map((field) => (
                    <td
                      key={field.key}
                      className={`px-4 py-2.5 text-slate-300 align-top ${getServiceProgramFieldCellClass(field)}`}
                    >
                      {canManage ? (
                        <ProgramFieldInput
                          value={row[field.key]}
                          placeholder={field.placeholder}
                          onChange={(value) => onRowChange?.(row.id, field.key, value)}
                        />
                      ) : (
                        <ProgramFieldValue value={row[field.key]} />
                      )}
                    </td>
                  ))}
                  {canManage ? (
                    <td className="px-4 py-2.5 text-right align-top whitespace-nowrap">
                      <ServiceProgramRowActions
                        rowIndex={rowIndex}
                        totalRows={rows.length}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                        onDelete={onDeleteRow}
                      />
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ServiceProgramTable({
  rows = [],
  canManage = false,
  onRowChange,
  onMoveUp,
  onMoveDown,
  onDeleteRow,
}) {
  const emptyMessage = canManage
    ? SERVICE_PROGRAM_EMPTY_MESSAGE
    : SERVICE_PROGRAM_VIEW_EMPTY_MESSAGE;

  return (
    <>
      <ServiceProgramDesktopTable
        rows={rows}
        canManage={canManage}
        onRowChange={onRowChange}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDeleteRow={onDeleteRow}
        emptyMessage={emptyMessage}
      />
      <ServiceProgramMobileCards
        rows={rows}
        canManage={canManage}
        onRowChange={onRowChange}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDeleteRow={onDeleteRow}
        emptyMessage={emptyMessage}
      />
    </>
  );
}
