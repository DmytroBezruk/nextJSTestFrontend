"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { logout, getAccessToken } from "@/lib/auth";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthed = typeof window !== 'undefined' && !!getAccessToken();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const hideActions = pathname === "/login"; // hide nav actions on login page per requirement

  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex h-14 items-center gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-blue-700">Dashboard</Link>
          <Link href="/authors" className="text-sm text-neutral-700 hover:text-blue-700">Authors</Link>
          <Link href="/books" className="text-sm text-neutral-700 hover:text-blue-700">Books</Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!hideActions && isAuthed && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
