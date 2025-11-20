"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { useEffect, useState, useReducer } from "react";
import { fetchAnalytics } from "@/lib/data";
import { AnalyticsSummary } from "@/lib/types";

// -------------------- Reducer for thresholds --------------------
type Threshold = { value: number; color: string }; // color is hex code
type ThresholdState = { thresholds: Threshold[] };
type ThresholdAction =
  | { type: "ADD_THRESHOLD"; threshold: Threshold }
  | { type: "REMOVE_THRESHOLD"; index: number }
  | { type: "UPDATE_THRESHOLD"; index: number; threshold: Threshold };

function thresholdReducer(state: ThresholdState, action: ThresholdAction): ThresholdState {
  switch (action.type) {
    case "ADD_THRESHOLD":
      return { thresholds: [...state.thresholds, action.threshold] };
    case "REMOVE_THRESHOLD":
      return { thresholds: state.thresholds.filter((_, i) => i !== action.index) };
    case "UPDATE_THRESHOLD":
      return {
        thresholds: state.thresholds.map((t, i) => (i === action.index ? action.threshold : t)),
      };
    default:
      return state;
  }
}

// -------------------- Main Component --------------------
export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Thresholds reducer
  const [thresholdState, dispatchThreshold] = useReducer(thresholdReducer, {
    thresholds: [
      { value: 1, color: "#22c55e" }, // green
      { value: 2, color: "#3b82f6" }, // blue
      { value: 3, color: "#ffc300" }, // gold
    ],
  });

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
        const message = err instanceof Error ? err.message : "Failed to load analytics.";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const maxBooks = Math.max(1, ...(data?.buckets.map((b) => b.books) || [1]));
  const maxAuthors = Math.max(1, ...(data?.buckets.map((b) => b.authors) || [1]));

  // Determine color based on thresholds
  const getBarColor = (value: number) => {
    const sorted = [...thresholdState.thresholds].sort((a, b) => b.value - a.value);
    for (const t of sorted) {
      if (value >= t.value) return t.color;
    }
    return "#d1d5db"; // gray-300 default
  };

  return (
    <div className="space-y-8 w-full" role="main">
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
                  <span
                    className={`text-xs font-medium rounded px-1.5 py-0.5 ${
                      data.booksGrowthPct >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {data.booksGrowthPct >= 0 ? "+" : ""}
                    {data.booksGrowthPct.toFixed(0)}%
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Compared to previous 30 days.</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Authors (Last 30d)</CardTitle>
                <CardDescription className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">{data.newAuthorsLast30}</span>
                  <span
                    className={`text-xs font-medium rounded px-1.5 py-0.5 ${
                      data.authorsGrowthPct >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {data.authorsGrowthPct >= 0 ? "+" : ""}
                    {data.authorsGrowthPct.toFixed(0)}%
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Compared to previous 30 days.</CardContent>
            </Card>
          </div>

          {/* Threshold Controls */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Highlight Thresholds</CardTitle>
              <CardDescription>Add numeric thresholds with colors to highlight bars</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {thresholdState.thresholds.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="number"
                      value={t.value}
                      onChange={(e) =>
                        dispatchThreshold({
                          type: "UPDATE_THRESHOLD",
                          index: i,
                          threshold: { ...t, value: Number(e.target.value) },
                        })
                      }
                      className="border p-1 rounded w-20"
                    />
                    <input
                      type="color"
                      value={t.color}
                      onChange={(e) =>
                        dispatchThreshold({
                          type: "UPDATE_THRESHOLD",
                          index: i,
                          threshold: { ...t, color: e.target.value },
                        })
                      }
                      className="w-10 h-8 p-0"
                    />
                    <Button variant="destructive" size="sm" onClick={() => dispatchThreshold({ type: "REMOVE_THRESHOLD", index: i })}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  onClick={() =>
                    dispatchThreshold({ type: "ADD_THRESHOLD", threshold: { value: 1, color: "#facc15" } }) // yellow
                  }
                >
                  Add Threshold
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="justify-between">
              <CardHeader>
                <CardTitle>Books per Month</CardTitle>
                <CardDescription>Last 6 months of book creation volume.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-48 w-full">
                  {data.buckets.map((b) => (
                    <div key={b.label} className="flex flex-col items-center justify-end h-full flex-1">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{ height: `${(b.books / maxBooks) * 100}%`, backgroundColor: getBarColor(b.books) }}
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
                  {data.buckets.map((b) => (
                    <div key={b.label} className="flex flex-col items-center justify-end h-full flex-1">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{ height: `${(b.authors / maxAuthors) * 100}%`, backgroundColor: getBarColor(b.authors) }}
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
