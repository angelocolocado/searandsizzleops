import { useState, type FormEvent, type ReactNode } from "react"
import {
  BadgeCheck,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
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

type Notice = {
  kind: "success" | "error"
  message: string
}

const initialRecoveryCodes = [
  "18420573",
  "62941708",
  "30586194",
  "74823951",
  "91264037",
  "45607382",
  "83719526",
  "27054861",
]

const qrCodePlaceholder = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" role="img" aria-label="Placeholder QR code">
    <rect width="120" height="120" rx="8" fill="#fff"/>
    <path fill="#334155" d="M12 12h32v32H12zm8 8v16h16V20zm56-8h32v32H76zm8 8v16h16V20zM12 76h32v32H12zm8 8v16h16V84zM52 12h8v8h-8zm0 16h8v8h-8zm8 8h8v8h-8zm-8 16h8v8h-8zm16 0h8v8h-8zm16 0h8v8h-8zm16 0h8v8h-8zm-48 16h8v8h-8zm16 0h8v8h-8zm16 0h8v8h-8zm16 0h8v8h-8zm-40 8h8v8h-8zm16 0h8v8h-8zm16 8h8v8h-8zm16 0h8v8h-8zm-48 8h8v8h-8zm16 8h8v8h-8zm16-8h8v8h-8zm16 8h8v8h-8z"/>
  </svg>
`

function createRecoveryCodes() {
  return Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 100_000_000).toString().padStart(8, "0")
  )
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

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  visible: boolean
  onToggleVisibility: () => void
  autoComplete: string
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="h-10 pr-11"
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={onToggleVisibility}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}

export default function CurrentUserUI({ user }: ComponentProps) {

  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    username: user.username,
  })
  const [profileNotice, setProfileNotice] = useState<Notice | null>(null)
  const [passwordNotice, setPasswordNotice] = useState<Notice | null>(null)
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirmation: "",
  })
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    next: false,
    confirmation: false,
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(user.two_factor_confirmed_at))
  const [showSetup, setShowSetup] = useState(false)
  const [otp, setOtp] = useState("")
  const [twoFactorNotice, setTwoFactorNotice] = useState<Notice | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState(initialRecoveryCodes)
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [copyNotice, setCopyNotice] = useState<Notice | null>(null)


  function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (passwords.next !== passwords.confirmation) {
      setPasswordNotice({ kind: "error", message: "The new passwords do not match." })
      return
    }
    if (passwords.next.length < 8) {
      setPasswordNotice({ kind: "error", message: "Your new password must be at least 8 characters." })
      return
    }

    setPasswords({ current: "", next: "", confirmation: "" })
    setPasswordNotice({ kind: "success", message: "Your password has been updated." })
  }

  function confirmTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      setTwoFactorNotice({ kind: "error", message: "Enter the 6-digit code from your authenticator app." })
      return
    }

    setTwoFactorEnabled(true)
    setShowSetup(false)
    setOtp("")
    setTwoFactorNotice({ kind: "success", message: "Two-factor authentication is now enabled." })
  }

  async function copyText(text: string, message: string) {
    if (!navigator.clipboard?.writeText) {
      setCopyNotice({ kind: "error", message: "Clipboard access is unavailable in this browser." })
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopyNotice({ kind: "success", message })
    } catch {
      setCopyNotice({ kind: "error", message: "Could not copy to the clipboard. Please try again." })
    }
  }

  function togglePasswordVisibility(field: keyof typeof passwordVisibility) {
    setPasswordVisibility((current) => ({ ...current, [field]: !current[field] }))
  }

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

        <Card aria-labelledby="password-heading">
          <SectionHeading
            icon={<KeyRound className="size-4" aria-hidden="true" />}
            title="Change password"
            description="Choose a strong password you do not use elsewhere."
            titleId="password-heading"
          />
          <CardContent>
            <form onSubmit={updatePassword} className="space-y-4">
              <PasswordField
                id="current-password"
                label="Current password"
                value={passwords.current}
                onChange={(current) => setPasswords({ ...passwords, current })}
                visible={passwordVisibility.current}
                onToggleVisibility={() => togglePasswordVisibility("current")}
                autoComplete="current-password"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  id="new-password"
                  label="New password"
                  value={passwords.next}
                  onChange={(next) => setPasswords({ ...passwords, next })}
                  visible={passwordVisibility.next}
                  onToggleVisibility={() => togglePasswordVisibility("next")}
                  autoComplete="new-password"
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  value={passwords.confirmation}
                  onChange={(confirmation) => setPasswords({ ...passwords, confirmation })}
                  visible={passwordVisibility.confirmation}
                  onToggleVisibility={() => togglePasswordVisibility("confirmation")}
                  autoComplete="new-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">Use at least 8 characters for your new password.</p>
              <StatusNotice notice={passwordNotice} />
              <div className="flex justify-end">
                <Button type="submit"><LockKeyhole aria-hidden="true" /> Update password</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" aria-labelledby="two-factor-heading">
          <SectionHeading
            icon={<ShieldCheck className="size-4" aria-hidden="true" />}
            title="Two-factor authentication"
            description="Add another layer of security to your account."
            titleId="two-factor-heading"
          />
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    twoFactorEnabled
                      ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${twoFactorEnabled ? "bg-emerald-600" : "bg-muted-foreground"}`} />
                  2FA {twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
                <p className="text-sm text-muted-foreground">
                  {twoFactorEnabled
                    ? "Your account requires an authenticator code when signing in."
                    : "Protect your account with a code from an authenticator app."}
                </p>
              </div>
              {twoFactorEnabled ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setTwoFactorEnabled(false)
                    setShowRecoveryCodes(false)
                    setShowSetup(false)
                    setTwoFactorNotice({ kind: "success", message: "Two-factor authentication has been disabled." })
                  }}
                >
                  <ShieldOff aria-hidden="true" /> Disable 2FA
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setShowSetup((visible) => !visible)
                    setTwoFactorNotice(null)
                    setCopyNotice(null)
                  }}
                >
                  <ShieldPlus aria-hidden="true" /> {showSetup ? "Cancel setup" : "Enable 2FA"}
                </Button>
              )}
            </div>

            <StatusNotice notice={twoFactorNotice} />

            {!twoFactorEnabled && showSetup && (
              <div className="space-y-5 rounded-xl border bg-muted/20 p-4 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Set up your authenticator app</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Scan this code with your authenticator app, or enter the setup key manually.
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div
                    className="mx-auto flex size-36 items-center justify-center rounded-lg border bg-white p-3"
                    dangerouslySetInnerHTML={{ __html: qrCodePlaceholder }}
                  />
                  <div className="space-y-2">
                    <label htmlFor="manual-setup-key" className="text-sm font-medium">Manual setup key</label>
                    <div className="flex gap-2">
                      <Input
                        id="manual-setup-key"
                        readOnly
                        value={user.two_factor_secret ?? "SEAR-SIZZLE-DEMO-2FA-KEY"}
                        className="h-10 font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Copy manual setup key"
                        onClick={() => void copyText(user.two_factor_secret ?? "SEAR-SIZZLE-DEMO-2FA-KEY", "Setup key copied.")}
                      >
                        <Copy aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
                <form onSubmit={confirmTwoFactor} className="max-w-md space-y-3">
                  <div className="space-y-2">
                    <label htmlFor="authenticator-code" className="text-sm font-medium">6-digit verification code</label>
                    <Input
                      id="authenticator-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      autoComplete="one-time-code"
                      className="h-10 font-mono tracking-[0.3em]"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={otp.length !== 6}>
                    <ShieldCheck aria-hidden="true" /> Confirm &amp; activate 2FA
                  </Button>
                </form>
                <StatusNotice notice={copyNotice} />
              </div>
            )}

            {twoFactorEnabled && (
              <div className="space-y-4 border-t pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Recovery codes</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Keep these codes somewhere safe. Each code can only be used once.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowRecoveryCodes((visible) => !visible)
                        setCopyNotice(null)
                      }}
                    >
                      {showRecoveryCodes ? "Hide recovery codes" : "View recovery codes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRecoveryCodes(createRecoveryCodes())
                        setShowRecoveryCodes(true)
                        setCopyNotice({ kind: "success", message: "New recovery codes generated." })
                      }}
                    >
                      <RefreshCw aria-hidden="true" /> Regenerate codes
                    </Button>
                  </div>
                </div>

                {showRecoveryCodes && (
                  <div className="space-y-3">
                    <div className="grid gap-2 rounded-lg border bg-muted/30 p-3 font-mono text-sm sm:grid-cols-2 lg:grid-cols-4">
                      {recoveryCodes.map((code, index) => (
                        <code key={`${code}-${index}`} className="rounded-md bg-background px-3 py-2 text-center">{code}</code>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">Regenerating codes replaces your previous set.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void copyText(recoveryCodes.join("\n"), "Recovery codes copied.")}
                      >
                        <Copy aria-hidden="true" /> Copy codes
                      </Button>
                    </div>
                    <StatusNotice notice={copyNotice} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
