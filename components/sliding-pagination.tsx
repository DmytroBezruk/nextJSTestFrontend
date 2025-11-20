"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface SlidingPaginationProps {
  page: number;
  onChange: (nextPage: number) => void;
  hasNext?: boolean;
  totalCount?: number;
  pageSize?: number;
  loading?: boolean;
  className?: string;
}

export function SlidingPagination({
  page,
  onChange,
  hasNext,
  totalCount,
  pageSize,
  loading = false,
  className = "justify-center",
}: SlidingPaginationProps) {
  // Calculate total pages if we know totalCount
  const maxPages =
    totalCount !== undefined && pageSize ? Math.max(1, Math.ceil(totalCount / pageSize)) : undefined;

  // Determine if there is a next page
  const internalHasNext = maxPages !== undefined ? page < maxPages : Boolean(hasNext);

  // Hide pagination if there’s only 1 page and no next page
  if (page === 1 && !internalHasNext && (maxPages === undefined || maxPages === 1)) return null;

  // Build list of pages to show
  const pages: number[] = [];
  if (maxPages) {
    for (let i = 1; i <= maxPages; i++) pages.push(i);
  } else {
    pages.push(page); // unknown total, just show current page
    if (internalHasNext) pages.push(page + 1);
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

        {pages.map((p, idx) => (
          <PaginationItem key={p}>
            {idx > 0 && maxPages && p > pages[idx - 1] + 1 && <PaginationEllipsis />}
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
