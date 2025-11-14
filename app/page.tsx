"use client";

// Shadcn UI placeholders (run these: npx shadcn add card alert skeleton)
// @ts-expect-error generated later via shadcn add card
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// @ts-expect-error generated later via shadcn add alert
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// @ts-expect-error generated later via shadcn add skeleton
import { Skeleton } from "@/components/ui/skeleton";

import { useEffect, useState } from "react";
import { fetchAnalytics } from "@/lib/data";
import { AnalyticsSummary } from "@/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const summary = await fetchAnalytics();
        if (!active) return;
        setData(summary);
      } catch (err: unknown) {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Failed to load analytics.';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const maxBooks = Math.max(1, ...(data?.buckets.map(b => b.books) || [1]));
  const maxAuthors = Math.max(1, ...(data?.buckets.map(b => b.authors) || [1]));

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
      ) : data ? (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <CardDescription className="text-3xl font-semibold tracking-tight">{data.totalBooks}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">All books currently in the system.</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
                <CardDescription className="text-3xl font-semibold tracking-tight">{data.totalAuthors}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Unique authors represented.</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Books (Last 30d)</CardTitle>
                <CardDescription className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">{data.newBooksLast30}</span>
                  <span className={`text-xs font-medium rounded px-1.5 py-0.5 ${data.booksGrowthPct >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{data.booksGrowthPct >= 0 ? '+' : ''}{data.booksGrowthPct.toFixed(0)}%</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Compared to previous 30 days.</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Authors (Last 30d)</CardTitle>
                <CardDescription className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">{data.newAuthorsLast30}</span>
                  <span className={`text-xs font-medium rounded px-1.5 py-0.5 ${data.authorsGrowthPct >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{data.authorsGrowthPct >= 0 ? '+' : ''}{data.authorsGrowthPct.toFixed(0)}%</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Compared to previous 30 days.</CardContent>
            </Card>
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="justify-between">
              <CardHeader>
                <CardTitle>Books per Month</CardTitle>
                <CardDescription>Last 6 months of book creation volume.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-48 w-full">
                  {data.buckets.map(b => (
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
            <Card className="justify-between">
              <CardHeader>
                <CardTitle>Authors per Month</CardTitle>
                <CardDescription>Last 6 months of author creation volume.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-48 w-full">
                  {data.buckets.map(b => (
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
      ) : (
        <div className="text-sm text-muted-foreground">No analytics data available.</div>
      )}
    </div>
  );
}
