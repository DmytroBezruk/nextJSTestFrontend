"use client";
import React from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination";

interface SlidingPaginationProps {
  page: number;
  onChange: (nextPage: number) => void;
  // optional direct hasNext fallback when totalCount/pageSize not provided
  hasNext?: boolean;
  totalCount?: number; // total items count
  pageSize?: number;   // canonical page size (taken from first page)
  loading?: boolean;
  windowSize?: number; // number of page items to display
  className?: string;
}

export function SlidingPagination({
  page,
  onChange,
  hasNext,
  totalCount,
  pageSize,
  loading = false,
  windowSize = 5,
  className = "justify-center",
}: SlidingPaginationProps) {
  // Derive maximum pages if we know totalCount & pageSize
  const maxPages = totalCount !== undefined && pageSize ? Math.max(1, Math.ceil(totalCount / pageSize)) : undefined;
  const internalHasNext = maxPages ? page < maxPages : Boolean(hasNext);

  const half = Math.floor(windowSize / 2);
  const pages: number[] = [];
  for (let i = 0; i < windowSize; i++) {
    const pageNumber = page + i - half;
    if (pageNumber >= 1) pages.push(pageNumber);
  }
  let uniquePages = Array.from(new Set(pages)).sort((a, b) => a - b);
  if (maxPages) uniquePages = uniquePages.filter(p => p <= maxPages);

  // If we're near the start, ensure window begins at 1
  if (maxPages && page <= half) {
    uniquePages = [];
    for (let p = 1; p <= Math.min(windowSize, maxPages); p++) uniquePages.push(p);
  }
  // If near the end, adjust window to end at maxPages
  if (maxPages && page > maxPages - half) {
    uniquePages = [];
    const start = Math.max(1, maxPages - windowSize + 1);
    for (let p = start; p <= maxPages; p++) uniquePages.push(p);
  }

  const disablePrev = page === 1 || loading;
  const disableNext = !internalHasNext || loading;

  return (
    <Pagination className={className} role="navigation" aria-label="Pagination navigation">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={disablePrev}
            className={disablePrev ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (!disablePrev) onChange(page - 1);
            }}
          />
        </PaginationItem>
        {uniquePages.map(p => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              aria-label={`Go to page ${p}`}
              onClick={(e) => {
                e.preventDefault();
                if (!loading && p !== page) onChange(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        {internalHasNext && maxPages && page < maxPages - half && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={disableNext}
            className={disableNext ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (!disableNext) onChange(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
