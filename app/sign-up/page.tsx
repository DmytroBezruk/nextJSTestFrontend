// app/sign-up/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  const router = useRouter()

  async function handleSignup({ email, password }: { email: string; password: string }) {
    // Call your API or auth logic here
    console.log("Signing up!", { email, password })
    router.push('/') // Redirect after successful signup
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <SignupForm onSubmit={handleSignup} sideImage="/next.svg" />
      </div>
    </div>
  )
}
