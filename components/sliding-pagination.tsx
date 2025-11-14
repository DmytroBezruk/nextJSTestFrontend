"use client";
import React from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination";

interface SlidingPaginationProps {
  page: number;
  hasNext: boolean;
  loading?: boolean;
  onChange: (nextPage: number) => void;
  windowSize?: number; // number of page items to display (default 5 like current implementation)
  className?: string;
}

export function SlidingPagination({
  page,
  hasNext,
  loading = false,
  onChange,
  windowSize = 5,
  className = "justify-end",
}: SlidingPaginationProps) {
  // Build the sliding window around current page (centered with +/-2 when windowSize=5)
  const half = Math.floor(windowSize / 2);
  const pages: number[] = [];
  for (let i = 0; i < windowSize; i++) {
    const pageNumber = page + i - half;
    if (pageNumber >= 1) pages.push(pageNumber);
  }
  // Remove duplicates and sort (in case of trimming at start)
  const uniquePages = Array.from(new Set(pages)).sort((a, b) => a - b);

  return (
    <Pagination className={className} role="navigation" aria-label="pagination">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1 || loading}
            className={page === 1 || loading ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (page > 1 && !loading) onChange(page - 1);
            }}
          />
        </PaginationItem>
        {uniquePages.map(p => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              onClick={(e) => {
                e.preventDefault();
                if (!loading) onChange(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        {!hasNext && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={!hasNext || loading}
            className={!hasNext || loading ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (hasNext && !loading) onChange(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

