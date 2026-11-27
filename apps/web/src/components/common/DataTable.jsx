import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DataTable({
  columns,
  rows,
  rowKey,
  getSearchText,
  searchPlaceholder = 'Tìm kiếm…',
  pageSize = 5,
  toolbar,
  emptyMessage = 'Không có dữ liệu phù hợp.',
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi');
    if (!keyword) return rows;
    return rows.filter((row) => getSearchText(row).toLocaleLowerCase('vi').includes(keyword));
  }, [rows, query, getSearchText]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  function search(value) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="admin-table-wrap">
      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={16} aria-hidden="true" />
          <input value={query} onChange={(event) => search(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
        </label>
        {toolbar}
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => <th key={column.id} scope="col">{column.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length}>{emptyMessage}</td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => <td key={column.id}>{column.cell(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-pager">
        <p>{filtered.length === 0 ? '0 kết quả' : `${start + 1}–${start + visible.length} / ${filtered.length}`}</p>
        <div>
          <Button type="button" variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Trước</Button>
          <span>Trang {currentPage}/{pageCount}</span>
          <Button type="button" variant="outline" size="sm" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>Sau</Button>
        </div>
      </div>
    </div>
  );
}
