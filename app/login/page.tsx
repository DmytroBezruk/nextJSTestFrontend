'use client';

// shadcn component imports (will exist after you run the suggested `npx shadcn add` commands)
// @ts-ignore -- generated later via `npx shadcn add card`
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
// @ts-ignore -- generated later via `npx shadcn add form`
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
// @ts-ignore -- generated later via `npx shadcn add input`
import { Input } from '@/components/ui/input';
// @ts-ignore -- generated later via `npx shadcn add alert`
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// @ts-ignore -- generated later via `npx shadcn add button` (optional if you replace existing custom button)
import { Button } from '@/components/ui/button';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { login } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
      {/* Card container */}
      <Card className="w-full max-w-sm border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Access your dashboard</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Login error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Logging in…' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
