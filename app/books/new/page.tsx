"use client";

// Shadcn UI placeholders (run: npx shadcn add form input select button card alert)
// @ts-ignore
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
// @ts-ignore
import { Input } from "@/components/ui/input";
// @ts-ignore
import { Button } from "@/components/ui/button";
// @ts-ignore
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// @ts-ignore
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// @ts-ignore
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBook, fetchAllAuthors } from "@/lib/data";
import { Author } from "@/lib/types";

const BookSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  content: z.string().min(1, "Content is required"),
  author_id: z.string().min(1, "Author is required"), // will convert to number
});

type BookValues = z.infer<typeof BookSchema>;

export default function NewBookPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [authorsError, setAuthorsError] = useState<string | null>(null);

  const form = useForm<BookValues>({
    resolver: zodResolver(BookSchema),
    defaultValues: { name: "", content: "", author_id: "" },
  });

  useEffect(() => {
    let active = true;
    async function loadAuthors() {
      try {
        setAuthorsLoading(true);
        const data = await fetchAllAuthors();
        if (!active) return;
        setAuthors(data);
      } catch (err: unknown) {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Failed to load authors.';
        setAuthorsError(message);
      } finally {
        if (active) setAuthorsLoading(false);
      }
    }
    loadAuthors();
    return () => { active = false; };
  }, []);

  const onSubmit = async (values: BookValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await createBook({ name: values.name, content: values.content, author_id: Number(values.author_id) });
      router.push('/books');
    } catch (err: any) {
      setError(err?.message || 'Failed to create book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Book</h1>
        <p className="text-sm text-muted-foreground">Add a new book to the catalog.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Book Info</CardTitle>
          <CardDescription>Fill out the form below.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Book name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Input placeholder="Short description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      {authorsLoading ? (
                        <div className="text-xs text-muted-foreground">Loading authors...</div>
                      ) : authorsError ? (
                        <div className="text-xs text-red-600">{authorsError}</div>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an author" />
                          </SelectTrigger>
                          <SelectContent>
                            {authors.map(a => (
                              <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.push('/books')}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

