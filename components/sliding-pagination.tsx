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
  const maxPages = totalCount !== undefined && pageSize ? (totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize)) : undefined;

  // Hide pagination entirely when explicit empty dataset
  if (totalCount !== undefined && totalCount === 0) return null;
  if (maxPages === 0) return null;

  const internalHasNext = maxPages !== undefined ? page < maxPages : Boolean(hasNext);

  // If only one page (page 1 and no next), hide pagination.
  if (page === 1 && !internalHasNext && (maxPages === undefined || maxPages === 1)) return null;

  const half = Math.floor(windowSize / 2);
  let uniquePages: number[] = [];

  if (maxPages !== undefined) {
    // Build window respecting known maxPages
    for (let i = 0; i < windowSize; i++) {
      const pageNumber = page + i - half;
      if (pageNumber >= 1 && pageNumber <= maxPages) uniquePages.push(pageNumber);
    }
    uniquePages = Array.from(new Set(uniquePages)).sort((a, b) => a - b);
    if (page <= half) {
      uniquePages = [];
      for (let p = 1; p <= Math.min(windowSize, maxPages); p++) uniquePages.push(p);
    }
    if (page > maxPages - half) {
      uniquePages = [];
      const start = Math.max(1, maxPages - windowSize + 1);
      for (let p = start; p <= maxPages; p++) uniquePages.push(p);
    }
  } else {
    // Unknown max pages: show a centered window starting from 1 but avoid negative
    for (let i = 0; i < windowSize; i++) {
      const pageNumber = page + i - half;
      if (pageNumber >= 1) uniquePages.push(pageNumber);
    }
    uniquePages = Array.from(new Set(uniquePages)).sort((a, b) => a - b);
    // If we're at the very start (page 1) and no next page, we already early-returned above; if we have next we keep small window.
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
