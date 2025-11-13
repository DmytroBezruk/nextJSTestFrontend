"use client";

// Shadcn UI imports to be generated via npx shadcn add commands
// @ts-ignore -- will exist after `npx shadcn add card`
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
// @ts-ignore -- will exist after `npx shadcn add alert`
import {Alert, AlertTitle, AlertDescription} from "@/components/ui/alert";
// @ts-ignore -- will exist after `npx shadcn add skeleton`
import {Skeleton} from "@/components/ui/skeleton";

import Image from "next/image";
import {useEffect, useState} from "react";
import {fetchBooks} from "@/lib/data";
import {Book} from "@/lib/types";

export default function Home() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function load() {
            try {
                setLoading(true);
                const data = await fetchBooks();
                if (!active) return;
                setBooks(data);
            } catch (err: any) {
                if (!active) return;
                setError(err?.message || "Failed to load books.");
            } finally {
                if (active) setLoading(false);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, []);

    return (

        <div className="space-y-6 w-full">
            <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
            <p className="text-sm text-muted-foreground">Browse all
                available books.</p>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Unable to load</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div
                    className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton
                                className="h-40 w-full rounded-md"/>
                            <Skeleton className="h-4 w-3/4"/>
                            <Skeleton className="h-4 w-1/2"/>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {books.map((book) => (
                        <Card key={book.id}
                              className="overflow-hidden flex flex-col">
                            <div
                                className="relative h-40 w-full bg-gradient-to-br from-blue-50 to-blue-100">
                                <Image
                                    src="/window.svg" // placeholder image
                                    alt={book.name}
                                    fill
                                    className="object-contain p-4"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                            <CardHeader className="py-3">
                                <CardTitle
                                    className="text-base line-clamp-2">{book.name}</CardTitle>
                            </CardHeader>
                            <CardContent
                                className="pt-0 pb-4 text-sm text-muted-foreground">
                                <p className="line-clamp-1">{book.author?.name || "Unknown Author"}</p>
                            </CardContent>
                        </Card>
                    ))}
                    {!books.length && !error && (
                        <div
                            className="col-span-full text-sm text-muted-foreground">No
                            books found.</div>
                    )}
                </div>
            )}
        </div>
    );
}
