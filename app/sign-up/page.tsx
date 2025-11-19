// app/sign-up/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { SignupForm } from "@/components/signup-form"
import { register } from "@/lib/auth"
import { useState } from "react"

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string>("")

  async function handleSignup({ name, email, password }: { name: string; email: string; password: string }) {
    setError("")
    try {
      await register(name, email, password)
      // Redirect to dashboard (home page assumed as '/')
      router.push('/')
    } catch (e: any) {
      setError(e?.message || 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <SignupForm onSubmit={handleSignup} sideImage="/next.svg" serverError={error} />
      </div>
    </div>
  )
}
