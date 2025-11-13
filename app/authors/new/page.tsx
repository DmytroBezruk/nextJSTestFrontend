"use client";

// Shadcn UI (run: npx shadcn add form input textarea button card alert)
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

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAuthor } from "@/lib/data";

const AuthorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  details: z.string().optional(),
});

type AuthorValues = z.infer<typeof AuthorSchema>;

export default function NewAuthorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AuthorValues>({
    resolver: zodResolver(AuthorSchema),
    defaultValues: { name: "", details: "" },
  });

  const onSubmit = async (values: AuthorValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await createAuthor({ name: values.name, details: values.details });
      router.push("/authors");
    } catch (err: any) {
      setError(err?.message || "Failed to create author");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Author</h1>
        <p className="text-sm text-muted-foreground">Add a new author to the catalog.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Author Info</CardTitle>
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
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

