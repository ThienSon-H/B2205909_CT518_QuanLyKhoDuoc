import React from 'react';

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="pagination-container">
      <button
        className="btn btn-sm btn-outline-primary-custom"
        disabled={page <= 1}
        onClick={() => onPageChange(1)}
        title="Trang đầu"
      >
        «
      </button>
      <button
        className="btn btn-sm btn-outline-primary-custom"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        title="Trang trước"
      >
        ‹
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button className="btn btn-sm btn-outline-primary-custom" onClick={() => onPageChange(1)}>1</button>
          {visiblePages[0] > 2 && <span className="pagination-ellipsis">…</span>}
        </>
      )}

      {visiblePages.map(p => (
        <button
          key={p}
          className={`btn btn-sm ${p === page ? 'btn-primary-custom' : 'btn-outline-primary-custom'}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="pagination-ellipsis">…</span>}
          <button className="btn btn-sm btn-outline-primary-custom" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className="btn btn-sm btn-outline-primary-custom"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        title="Trang sau"
      >
        ›
      </button>
      <button
        className="btn btn-sm btn-outline-primary-custom"
        disabled={page >= totalPages}
        onClick={() => onPageChange(totalPages)}
        title="Trang cuối"
      >
        »
      </button>
    </div>
  );
}

export default Pagination;