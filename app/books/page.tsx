"use client";

// Shadcn UI imports
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SlidingPagination } from "@/components/sliding-pagination";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchBooks } from "@/lib/data";
import { Book, PaginatedBookList } from "@/lib/types";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pager, setPager] = useState<PaginatedBookList | null>(null);
  const [pageSize, setPageSize] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load(): Promise<void> {
      try {
        setLoading(true);
        const data = await fetchBooks(page);
        if (!active) return;
        setBooks(data.results);
        setPager(data);
        if (page === 1 && pageSize === null && data.results.length > 0) {
          setPageSize(data.results.length);
        }
      } catch (err: unknown) {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Failed to load books.';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [page, pageSize]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Books</h1>
          <p className="text-sm text-muted-foreground">Manage all books in the catalog.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/books/new">Create Book</Link>
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i: number) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book: Book) => (
            <Link key={book.id} href={`/books/${book.id}`} className="group">
              <Card className="overflow-hidden flex flex-col transition-shadow group-hover:shadow-sm">
                <div className="relative h-40 w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  {book.image_url ? (
                    <Image
                      src={book.image_url}
                      alt={book.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <Image
                      src="/window.svg"
                      alt={book.name}
                      width={80}
                      height={80}
                      className="opacity-80 group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <CardHeader className="py-3">
                  <CardTitle className="text-base line-clamp-2 group-hover:text-blue-700 transition-colors">{book.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4 text-sm text-muted-foreground">
                  <p className="line-clamp-1">{book.author?.name || 'Unknown Author'}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!books.length && !error && (
            <div className="col-span-full text-sm text-muted-foreground">No books found.</div>
          )}
        </div>
      )}
      <SlidingPagination
        page={page}
        totalCount={pager?.count}
        pageSize={pageSize || books.length || 0}
        loading={loading}
        onChange={setPage}
        windowSize={5}
        className="justify-center"
      />
    </div>
  );
}
