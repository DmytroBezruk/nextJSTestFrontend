import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Link from "next/link";

type LoginFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit?: (data: { email: string; password: string }) => void | Promise<void>
  sideImage?: string // optional custom image
}

export function LoginForm({
  className,
  onSubmit,
  sideImage = "/placeholder.svg",
  ...props
}: LoginFormProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    if (onSubmit) {
      setLoading(true)
      Promise.resolve(onSubmit({ email, password })).finally(() =>
        setLoading(false)
      )
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          {/* FORM SECTION */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" required />
              </Field>

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging in…" : "Login"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* IMAGE SECTION */}
          <div className="relative hidden md:block bg-muted">
            <img
              src={sideImage}
              alt="Side illustration"
              className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
