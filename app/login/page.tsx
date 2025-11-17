"use client"

import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import {login} from "@/lib/auth";

export default function Page() {
  const router = useRouter()

  async function handleLogin({ email, password }: { email: string; password: string }) {
    const response = await login(email, password);
    console.log("Logged in!", response)
    router.push('/');
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm onSubmit={handleLogin}/>
      </div>
    </div>
  )
}
