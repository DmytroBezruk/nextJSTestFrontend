"use client";

// Shadcn UI placeholders (run these: npx shadcn add card alert skeleton)
// @ts-ignore
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// @ts-ignore
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// @ts-ignore
import { Skeleton } from "@/components/ui/skeleton";

import { useEffect, useState, useMemo } from "react";
import { fetchBooks, fetchAuthors } from "@/lib/data";
import { Book, Author } from "@/lib/types";

interface MonthBucket { label: string; books: number; authors: number; }

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [booksData, authorsData] = await Promise.all([fetchBooks(), fetchAuthors()]);
        if (!active) return;
        setBooks(booksData);
        setAuthors(authorsData);
      } catch (err: unknown) {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data.';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  // Stats calculations
  const stats = useMemo(() => {
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    const daysAgo = (d: number) => new Date(now.getTime() - d * msInDay);
    const last30 = daysAgo(30);
    const prev30Start = daysAgo(60);

    const safeParseDate = (iso: string) => {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? null : d;
    };

    const newBooksLast30 = books.filter(b => {
      const d = safeParseDate(b.created_at);
      return d && d >= last30;
    }).length;
    const newBooksPrev30 = books.filter(b => {
      const d = safeParseDate(b.created_at);
      return d && d >= prev30Start && d < last30;
    }).length;

    const newAuthorsLast30 = authors.filter(a => {
      const d = safeParseDate(a.created_at);
      return d && d >= last30;
    }).length;
    const newAuthorsPrev30 = authors.filter(a => {
      const d = safeParseDate(a.created_at);
      return d && d >= prev30Start && d < last30;
    }).length;

    const pctChange = (current: number, prev: number) => {
      if (prev === 0) return current === 0 ? 0 : 100;
      return ((current - prev) / prev) * 100;
    };

    // Build last 6 month buckets (including current month)
    const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });
    const buckets: MonthBucket[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthFormatter.format(d);
      const booksCount = books.filter(b => {
        const bd = safeParseDate(b.created_at);
        return bd && bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      }).length;
      const authorsCount = authors.filter(a => {
        const ad = safeParseDate(a.created_at);
        return ad && ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      }).length;
      buckets.push({ label, books: booksCount, authors: authorsCount });
    }

    return {
      totalBooks: books.length,
      totalAuthors: authors.length,
      newBooksLast30,
      newAuthorsLast30,
      booksGrowthPct: pctChange(newBooksLast30, newBooksPrev30),
      authorsGrowthPct: pctChange(newAuthorsLast30, newAuthorsPrev30),
      buckets,
    };
  }, [books, authors]);

  const maxBooks = Math.max(1, ...stats.buckets.map(b => b.books));
  const maxAuthors = Math.max(1, ...stats.buckets.map(b => b.authors));

  return (
    <div className="space-y-8" role="main">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your catalog performance.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Data Load Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
          <div className="col-span-full grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-72 w-full rounded-md" />
            <Skeleton className="h-72 w-full rounded-md" />
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <CardDescription className="text-3xl font-semibold tracking-tight">{stats.totalBooks}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">All books currently in the system.</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
                <CardDescription className="text-3xl font-semibold tracking-tight">{stats.totalAuthors}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Unique authors represented.</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Books (Last 30d)</CardTitle>
                <CardDescription className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">{stats.newBooksLast30}</span>
                  <span className={`text-xs font-medium rounded px-1.5 py-0.5 ${stats.booksGrowthPct >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{stats.booksGrowthPct >= 0 ? '+' : ''}{stats.booksGrowthPct.toFixed(0)}%</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Compared to previous 30 days.</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Authors (Last 30d)</CardTitle>
                <CardDescription className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">{stats.newAuthorsLast30}</span>
                  <span className={`text-xs font-medium rounded px-1.5 py-0.5 ${stats.authorsGrowthPct >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{stats.authorsGrowthPct >= 0 ? '+' : ''}{stats.authorsGrowthPct.toFixed(0)}%</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Compared to previous 30 days.</CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className={'justify-between'}>
              <CardHeader>
                <CardTitle>Books per Month</CardTitle>
                <CardDescription>Last 6 months of book creation volume.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-48 w-full">
                  {stats.buckets.map(b => (
                    <div key={b.label} className="flex flex-col items-center justify-end h-full flex-1">
                      <div
                        className="w-full rounded-t bg-blue-500 transition-all"
                        style={{ height: `${(b.books / maxBooks) * 100}%` }}
                        aria-label={`Books in ${b.label}: ${b.books}`}
                      />
                      <span className="mt-1 text-[10px] text-muted-foreground font-medium">{b.label}</span>
                      <span className="text-[11px] font-semibold mt-0.5">{b.books}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className={'justify-between'}>
              <CardHeader>
                <CardTitle>Authors per Month</CardTitle>
                <CardDescription>Last 6 months of author creation volume.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-48 w-full">
                  {stats.buckets.map(b => (
                    <div key={b.label} className="flex flex-col items-center justify-end h-full flex-1">
                      <div
                        className="w-full rounded-t bg-indigo-500 transition-all"
                        style={{ height: `${(b.authors / maxAuthors) * 100}%` }}
                        aria-label={`Authors in ${b.label}: ${b.authors}`}
                      />
                      <span className="mt-1 text-[10px] text-muted-foreground font-medium">{b.label}</span>
                      <span className="text-[11px] font-semibold mt-0.5">{b.authors}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
