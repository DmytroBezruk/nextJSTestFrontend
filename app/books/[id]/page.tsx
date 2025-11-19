"use client";

// Shadcn UI placeholders (run: npx shadcn add card form input select button alert skeleton)
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchBook, updateBook, deleteBook, fetchAllAuthors } from "@/lib/data";
import { Book, Author } from "@/lib/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

const BookEditSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  content: z.string().min(1, "Content is required"),
  author_id: z.string().min(1, "Author is required"),
  image: z.custom<File | undefined>((val) => val === undefined || val instanceof File, { message: 'Invalid file' }).optional(),
});

type BookEditValues = z.infer<typeof BookEditSchema>;

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [book, setBook] = useState<Book | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [authorsError, setAuthorsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<BookEditValues>({
    resolver: zodResolver(BookEditSchema),
    defaultValues: { name: "", content: "", author_id: "" },
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchBook(id);
        if (!active) return;
        setBook(data);
        // Fetch authors separately so we can surface its errors independently
        try {
          const authorsData = await fetchAllAuthors();
          if (active) setAuthors(authorsData);
        } catch (aErr) {
          if (active) {
            const msg = aErr instanceof Error ? aErr.message : 'Failed to load authors';
            setAuthorsError(msg);
          }
        }
        form.reset({ name: data.name, content: data.content, author_id: String(data.author?.id || data.author_id) });
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Failed to load book';
        setError(message);
      } finally {
        if (active) setLoading(false);
        if (active) setAuthorsLoading(false);
      }
    }
    if (!Number.isNaN(id)) load();
    return () => { active = false; };
  }, [id, form]);

  const onSubmit = async (values: BookEditValues) => {
    setError(null);
    setSaving(true);
    try {
      await updateBook(id, { name: values.name, content: values.content, author_id: Number(values.author_id), image: values.image || null });
      router.push('/books');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update book';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm('Delete this book?')) return;
    setError(null);
    setDeleting(true);
    try {
      await deleteBook(id);
      router.push('/books');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete book';
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!book) {
    return <div className="text-sm text-muted-foreground">Book not found.</div>;
  }

  return (
    <div className="max-w-xl space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Book</h1>
          <p className="text-sm text-muted-foreground">Update details or delete.</p>
        </div>
        <Button variant="destructive" size="sm" onClick={onDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Book Info</CardTitle>
          <CardDescription>Edit the fields below.</CardDescription>
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
                      <Textarea placeholder="Short description" {...field} />
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
              {book.image_url && (
                <div className="rounded-md overflow-hidden border bg-muted p-1">
                  <Image src={book.image_url} alt={book.name} width={100} height={100} className="object-cover w-full h-full" />
                </div>
              )}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Replace Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file || undefined);
                        }}
                      />
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
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
