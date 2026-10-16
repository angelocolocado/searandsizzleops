import { useState, type FormEvent, type ReactNode } from "react"
import {
  BadgeCheck,
  Check,
  Copy,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  ShieldPlus,
  UserRound,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import ProfileInformation from "./profile-information"
import PasswordInformation from "./password-information"
import { TwoFactorAuthenticationSection } from "./2fa-section"

export type CurrentUserType = {
  id: number
  name: string
  username: string
  email: string
  mode: "admin" | "cashier"
  email_verified_at: string | null
  two_factor_secret: string | null
  two_factor_recovery_codes?: string | null
  two_factor_confirmed_at: string | null
}

type ComponentProps = {
  user: CurrentUserType
}

export type Notice = {
  kind: "success" | "error"
  message: string
}

export function SectionHeading({
  icon,
  title,
  description,
  titleId,
}: {
  icon: ReactNode
  title: string
  description: string
  titleId: string
}) {
  return (
    <CardHeader className="border-b">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          {icon}
        </div>
        <div className="space-y-1">
          <CardTitle id={titleId}>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}

export function StatusNotice({ notice }: { notice: Notice | null }) {
  if (!notice) return null

  const isSuccess = notice.kind === "success"
  const Icon = isSuccess ? Check : ShieldOff

  return (
    <p
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
        isSuccess
          ? "border-emerald-600/20 bg-emerald-600/5 text-emerald-700 dark:text-emerald-400"
          : "border-destructive/20 bg-destructive/5 text-destructive"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {notice.message}
    </p>
  )
}

export default function CurrentUserUI({ user }: ComponentProps) {

  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    username: user.username,
  })


  return (
    <section aria-labelledby="account-settings-heading" className="space-y-5">
      <div>
        <h2 id="account-settings-heading" className="text-lg font-semibold tracking-tight">Account settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your profile details and manage account security.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileInformation email={profile.email} mode={user.mode} name={profile.name} username={profile.username} />

        <PasswordInformation />

        <TwoFactorAuthenticationSection user={user} />
      </div>
    </section>
  )
}
