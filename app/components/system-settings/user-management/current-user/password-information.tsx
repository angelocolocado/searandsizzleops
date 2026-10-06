import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react"
import { useForm } from "react-hook-form"
import { useFetcher } from "react-router"
import z from "zod"

import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { SectionHeading } from "./current-user"

const PasswordFormSchema = z.object({
  current_password: z.string().min(1, "Enter your current password."),
  password: z.string().min(8, "Your new password must be at least 8 characters."),
  password_confirmation: z.string().min(1, "Confirm your new password."),
}).refine((values) => values.password === values.password_confirmation, {
  message: "The new passwords do not match.",
  path: ["password_confirmation"],
})

type PasswordFormType = z.infer<typeof PasswordFormSchema>
type PasswordFieldName = keyof PasswordFormType

const passwordFields: {
  name: PasswordFieldName
  id: string
  label: string
  autoComplete: string
}[] = [
  {
    name: "current_password",
    id: "current-password",
    label: "Current password",
    autoComplete: "current-password",
  },
  {
    name: "password",
    id: "new-password",
    label: "New password",
    autoComplete: "new-password",
  },
  {
    name: "password_confirmation",
    id: "confirm-password",
    label: "Confirm new password",
    autoComplete: "new-password",
  },
]

export default function PasswordInformation() {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<PasswordFieldName, boolean>>({
    current_password: false,
    password: false,
    password_confirmation: false,
  })
  const fetcher = useFetcher<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordFormType>({
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
    resolver: zodResolver(PasswordFormSchema),
    mode: "onChange",
  })
  const responseMessage = typeof fetcher.data === "string" ? fetcher.data : null

  function onSubmit(values: PasswordFormType) {
    fetcher.submit(
      { ...values, intent: "update_password" },
      { method: "POST" },
    )
  }

  return (
    <Card aria-labelledby="password-heading">
      <SectionHeading
        icon={<KeyRound className="size-4" aria-hidden="true" />}
        title="Change password"
        description="Choose a strong password you do not use elsewhere."
        titleId="password-heading"
      />
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
          aria-describedby={responseMessage ? "password-form-error" : undefined}
        >
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            {passwordFields.map(({ name, id, label, autoComplete }) => {
              const error = errors[name]
              const descriptionId = name === "password" ? "new-password-description" : undefined
              const errorId = `${id}-error`

              return (
                <Field key={name} className={name === "current_password" ? "sm:col-span-2" : undefined}>
                  <FieldLabel htmlFor={id}>{label}</FieldLabel>
                  <div className="relative w-full">
                    <Input
                      id={id}
                      type={visiblePasswords[name] ? "text" : "password"}
                      {...register(name)}
                      autoComplete={autoComplete}
                      aria-invalid={Boolean(error)}
                      aria-describedby={[
                        descriptionId,
                        error ? errorId : undefined,
                      ].filter(Boolean).join(" ") || undefined}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`${visiblePasswords[name] ? "Hide" : "Show"} ${label.toLowerCase()}`}
                      aria-pressed={visiblePasswords[name]}
                      onClick={() => setVisiblePasswords((current) => ({
                        ...current,
                        [name]: !current[name],
                      }))}
                    >
                      {visiblePasswords[name]
                        ? <EyeOff className="size-4" aria-hidden="true" />
                        : <Eye className="size-4" aria-hidden="true" />}
                    </button>
                  </div>
                  {name === "password" && (
                    <FieldDescription id={descriptionId}>
                      Use at least 8 characters.
                    </FieldDescription>
                  )}
                  {error && <FieldError id={errorId}>{error.message}</FieldError>}
                </Field>
              )
            })}
          </FieldGroup>

          {responseMessage && (
            <FieldError id="password-form-error" role="alert" aria-live="assertive">
              {responseMessage}
            </FieldError>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={!isValid || fetcher.state !== "idle"}>
              <LockKeyhole aria-hidden="true" />
              {fetcher.state !== "idle" ? "Updating password..." : "Update password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
