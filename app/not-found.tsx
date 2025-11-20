import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// Metadata for the 404 page
export const metadata = {
  title: 'Page Not Found',
  robots: {
    index: false,
    follow: false,
  },
}

// Root-level not-found page. Automatically used for any unmatched route.
// This is a Server Component (no "use client" directive) for proper 404 status.
export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center gap-8 py-24 px-6 text-center max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-24 h-24">
          <Image src="/globe.svg" alt="Not found" fill className="object-contain opacity-80" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <p className="text-lg text-muted-foreground max-w-prose">
          Oops – the page you were looking for doesn&apos;t exist, was moved, or never published.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/authors">Browse Authors</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/books">Browse Books</Link>
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        If you believe this is an error, double‑check the URL or contact support.
      </div>
    </main>
  )
}
