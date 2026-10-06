import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { BadgeCheck, Check, ShieldCheck, UserRound } from "lucide-react"
import { useForm } from "react-hook-form"
import z from "zod"

import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { SectionHeading, StatusNotice } from "./current-user"
import { useSubmit } from "react-router"

type ComponentProps = {
  name: string
  email: string
  username: string
  mode: "admin" | "cashier"
}

const ProfileFormSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(255, "Name must be 255 characters or fewer."),
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address."),
  username: z.string().trim().min(1, "Enter a username.").max(50, "Username must be 50 characters or fewer."),
})

type ProfileFormType = z.infer<typeof ProfileFormSchema>

export default function ProfileInformation({ email, mode, name, username }: ComponentProps) {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<ProfileFormType>({
    defaultValues: { email, name, username },
    resolver: zodResolver(ProfileFormSchema),
    mode: "onChange",
  })

  const submit = useSubmit()

  const roleLabel = mode === "admin" ? "Administrator" : "Cashier"

  function onSubmit(values: ProfileFormType) {
    submit({
        ...values,
        intent: "update_profile_information"
    }, {
        method: "POST"
    })
  }

  return (
    <Card aria-labelledby="profile-heading">
      <SectionHeading
        icon={<UserRound className="size-4" aria-hidden="true" />}
        title="Profile information"
        description="Your personal and account details."
        titleId="profile-heading"
      />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="profile-name">Name</FieldLabel>
              <Input
                id="profile-name"
                {...register("name")}
                placeholder="Your name"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "profile-name-error" : undefined}
              />
              {errors.name && (
                <FieldError id="profile-name-error">{errors.name.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input
                id="profile-email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "profile-email-error" : undefined}
              />
              {errors.email && (
                <FieldError id="profile-email-error">{errors.email.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-username">Username</FieldLabel>
              <Input
                id="profile-username"
                {...register("username")}
                placeholder="Username"
                autoComplete="username"
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? "profile-username-error" : undefined}
              />
              {errors.username && (
                <FieldError id="profile-username-error">{errors.username.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          <Field>
            <FieldTitle>Role / mode</FieldTitle>
            <div
              role="status"
              aria-label={`Account role: ${roleLabel}`}
              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <span className="truncate text-sm font-medium">{roleLabel}</span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                {mode}
              </span>
            </div>
            <FieldDescription>
              This role is assigned by an administrator and cannot be changed here.
            </FieldDescription>
          </Field>

          <div className="flex justify-end">
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              <Check aria-hidden="true" /> Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
