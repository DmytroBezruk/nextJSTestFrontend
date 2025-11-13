"use client";

// Shadcn UI imports (add via npx shadcn add card alert skeleton)
// @ts-ignore -- will exist after `npx shadcn add card`
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// @ts-ignore -- will exist after `npx shadcn add alert`
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// @ts-ignore -- will exist after `npx shadcn add skeleton`
import { Skeleton } from "@/components/ui/skeleton";

import { useEffect, useState } from "react";
import { fetchAuthors } from "@/lib/data";
import { Author } from "@/lib/types";
import { User } from "lucide-react";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAuthors();
        if (!active) return;
        setAuthors(data);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load authors.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-3xl font-semibold tracking-tight">Authors</h1>
      <p className="text-sm text-muted-foreground">Browse all registered authors.</p>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {authors.map(author => (
            <Card key={author.id} className="overflow-hidden flex flex-col">
              <div className="relative h-40 w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
                <User className="h-16 w-16 text-indigo-400" strokeWidth={1.2} />
              </div>
              <CardHeader className="py-3">
                <CardTitle className="text-base line-clamp-2">{author.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4 text-sm text-muted-foreground">
                <p className="line-clamp-3 min-h-[3.5rem]">
                  {author.details || "No details provided."}
                </p>
              </CardContent>
            </Card>
          ))}
          {!authors.length && !error && (
            <div className="col-span-full text-sm text-muted-foreground">No authors found.</div>
          )}
        </div>
      )}
    </div>
  );
}
