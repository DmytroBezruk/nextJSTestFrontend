"use client";

// Shadcn UI imports (ensure you run: npx shadcn add card alert skeleton button)
// @ts-ignore
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// @ts-ignore
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// @ts-ignore
import { Skeleton } from "@/components/ui/skeleton";
// @ts-ignore
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAuthors } from "@/lib/data";
import { Author } from "@/lib/types";
import { User } from "lucide-react";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active: boolean = true;
    async function load(): Promise<void> {
      try {
        setLoading(true);
        const data: Author[] = await fetchAuthors();
        if (!active) return;
        setAuthors(data);
      } catch (err: unknown) {
        if (!active) return;
        const message: string = err instanceof Error ? err.message : 'Failed to load authors.';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Authors</h1>
          <p className="text-sm text-muted-foreground">Browse all registered authors.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/authors/new">Create Author</Link>
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i: number) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {authors.map((author: Author) => (
            <Link key={author.id} href={`/authors/${author.id}`} className="group">
              <Card className="overflow-hidden flex flex-col transition-shadow group-hover:shadow-sm">
                <div className="relative h-40 w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <User className="h-16 w-16 text-indigo-400 group-hover:scale-105 transition-transform" strokeWidth={1.2} />
                </div>
                <CardHeader className="py-3">
                  <CardTitle className="text-base line-clamp-2 group-hover:text-indigo-700 transition-colors">{author.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4 text-sm text-muted-foreground">
                  <p className="line-clamp-3 min-h-[3.5rem]">
                    {author.details || "No details provided."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!authors.length && !error && (
            <div className="col-span-full text-sm text-muted-foreground">No authors found.</div>
          )}
        </div>
      )}
    </div>
  );
}
