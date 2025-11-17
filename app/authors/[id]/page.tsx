"use client";

// Shadcn UI imports (run: npx shadcn add card form input button alert skeleton)
// @ts-expect-error
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// @ts-expect-error
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
// @ts-expect-error
import { Input } from "@/components/ui/input";
// @ts-expect-error
import { Button } from "@/components/ui/button";
// @ts-expect-error
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// @ts-expect-error
import { Skeleton } from "@/components/ui/skeleton";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchAuthor, updateAuthor, deleteAuthor } from "@/lib/data";
import { Author } from "@/lib/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const AuthorEditSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  details: z.string().optional(),
});

type AuthorEditValues = z.infer<typeof AuthorEditSchema>;

export default function AuthorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<AuthorEditValues>({
    resolver: zodResolver(AuthorEditSchema),
    defaultValues: { name: "", details: "" },
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAuthor(id);
        if (!active) return;
        setAuthor(data);
        form.reset({ name: data.name, details: data.details || "" });
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load author");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (!Number.isNaN(id)) load();
    return () => { active = false; };
  }, [id, form]);

  const onSubmit = async (values: AuthorEditValues) => {
    setError(null);
    setSaving(true);
    try {
      await updateAuthor(id, { name: values.name, details: values.details });
      router.push('/authors');
    } catch (err: any) {
      setError(err?.message || 'Failed to update author');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm('Delete this author?')) return;
    setError(null);
    setDeleting(true);
    try {
      await deleteAuthor(id);
      router.push('/authors');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete author');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl">
        <Skeleton className="h-8 w-48" />
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

  if (!author) {
    return <div className="text-sm text-muted-foreground">Author not found.</div>;
  }

  return (
    <div className="max-w-xl space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Author</h1>
          <p className="text-sm text-muted-foreground">Update details or delete.</p>
        </div>
        <Button variant="destructive" size="sm" onClick={onDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Author Info</CardTitle>
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
                      <Input placeholder="Author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Input placeholder="Short bio" {...field} />
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
              <Button type="button" variant="outline" onClick={() => router.push('/authors')}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

