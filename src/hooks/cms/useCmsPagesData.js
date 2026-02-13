import { useState } from "react";

export function useCmsPagesData() {
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [sitePagesMap, setSitePagesMap] = useState({});
  const [pageListPage, setPageListPage] = useState(1);
  const [pageListPageSize, setPageListPageSize] = useState(20);
  const [isLoadingPageList, setIsLoadingPageList] = useState(false);
  const [pagedPageRows, setPagedPageRows] = useState([]);
  const [pageListPagination, setPageListPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
  });

  return {
    isLoadingSites,
    setIsLoadingSites,
    sitePagesMap,
    setSitePagesMap,
    pageListPage,
    setPageListPage,
    pageListPageSize,
    setPageListPageSize,
    isLoadingPageList,
    setIsLoadingPageList,
    pagedPageRows,
    setPagedPageRows,
    pageListPagination,
    setPageListPagination,
  };
}
