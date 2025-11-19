// components/signup-form.tsx
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

type SignupFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit?: (data: { email: string; password: string }) => void | Promise<void>
  sideImage?: string // optional custom image
}

export function SignupForm({
  className,
  onSubmit,
  sideImage = "/placeholder.svg",
  ...props
}: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem("confirm-password") as HTMLInputElement).value

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (onSubmit) {
      setLoading(true)
      Promise.resolve(onSubmit({ email, password })).finally(() => setLoading(false))
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
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-balance text-sm">
                  Enter your email and password
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
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <Input id="confirm-password" type="password" required />
              </Field>

              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account…" : "Sign Up"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Already have an account?{" "}
                <a href="/login" className="underline-offset-4 hover:underline">
                  Sign in
                </a>
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
