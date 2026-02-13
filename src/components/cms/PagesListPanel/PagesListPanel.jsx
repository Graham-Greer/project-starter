import { Button } from "@/components/ui";

export default function PagesListPanel({
  styles,
  selectedSiteId,
  onAddPage,
  pageListPageSize,
  onPageListPageSizeChange,
  pageSizeOptions,
  isLoadingPageList,
  safePageListPage,
  maxPageListPage,
  onPrevPage,
  onNextPage,
  totalPageRows,
  pagedPageRows,
  selectedPageId,
  onEditPage,
  onClonePage,
  onDeletePage,
}) {
  return (
    <section id="pages-list" className={styles.panel}>
      <div className={styles.pageListHeader}>
        <div className={styles.pageListTitleGroup}>
          <h2 className={styles.panelTitle}>Pages</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={onAddPage}
            disabled={!selectedSiteId}
          >
            Add page
          </Button>
        </div>
        {selectedSiteId ? (
          <div className={styles.pageListControls}>
            <label className={styles.pageListSizeControl}>
              Rows
              <select
                className={styles.input}
                value={pageListPageSize}
                onChange={(event) => onPageListPageSizeChange(Number(event.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={`page-size-${size}`} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.pageListPager}>
              <Button
                size="sm"
                variant="secondary"
                onClick={onPrevPage}
                disabled={isLoadingPageList || safePageListPage <= 1}
              >
                Prev
              </Button>
              <span className={styles.status}>
                Page {safePageListPage} of {maxPageListPage}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={onNextPage}
                disabled={isLoadingPageList || safePageListPage >= maxPageListPage}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {!selectedSiteId ? <p className={styles.status}>Select a site to view pages.</p> : null}
      {selectedSiteId && isLoadingPageList ? <p className={styles.status}>Loading pages...</p> : null}
      {selectedSiteId && !isLoadingPageList && totalPageRows === 0 ? <p className={styles.status}>No pages found for this site.</p> : null}

      {selectedSiteId && !isLoadingPageList && totalPageRows > 0 ? (
        <div className={styles.pageListTable}>
          {pagedPageRows.map(({ page, depth }) => (
            <article key={`page-row-${page.id}`} className={styles.pageListRow}>
              <div className={styles.pageListTitleCell}>
                <span className={styles.pageListIndent} style={{ width: `${depth * 1.1}rem` }} aria-hidden="true" />
                <button
                  type="button"
                  className={`${styles.pageListTitleButton} ${selectedPageId === page.id ? styles.pageListTitleButtonActive : ""}`.trim()}
                  onClick={() => onEditPage(page.id)}
                >
                  {page.title}
                </button>
              </div>
              <div className={styles.pageListActions}>
                <Button size="sm" variant="secondary" onClick={() => onEditPage(page.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onClonePage(page.id)}>
                  Clone
                </Button>
                <Button size="sm" variant="secondary" tone="danger" onClick={() => onDeletePage(page)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
