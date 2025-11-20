"use client";

// Shadcn UI (run: npx shadcn add form input textarea button card alert)
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAuthor } from "@/lib/data";
import { useAppDispatch } from '@/lib/hooks';
import { pushNotification } from '@/lib/store/notificationsSlice';

const AuthorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  details: z.string().optional(),
  image: z.custom<File | undefined>((val) => val === undefined || val instanceof File, { message: 'Invalid file' }).optional(),
});

type AuthorValues = z.infer<typeof AuthorSchema>;

export default function NewAuthorPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
      await createAuthor({ name: values.name, details: values.details, image: values.image || null });
      dispatch(pushNotification(`Author "${values.name}" created successfully`, 'success'));
      router.push("/authors");
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create author';
      setError(message);
      dispatch(pushNotification(message, 'error'));
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
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
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
              <Button type="button" variant="outline" onClick={() => router.push('/authors')}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
