import { useState, type FormEvent } from "react"
import axios from "axios"
import { Copy, LockKeyhole, ShieldCheck, ShieldOff, ShieldPlus } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "~/components/ui/input-otp"
import {
  confirmTwoFactorAuthentication,
  confirmCurrentPassword,
  disableTwoFactorAuthentication,
  enableTwoFactorAuthentication,
  getTwoFactorRecoveryCodes,
  getTwoFactorSetupData,
  type TwoFactorSetupData,
} from "~/lib/two-factor"
import { SectionHeading, StatusNotice, type CurrentUserType, type Notice } from "./current-user"

type ComponentProps = {
  user: CurrentUserType
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

function sanitizeQrCodeSvg(svg: string): string | null {
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml")
  const root = parsed.documentElement

  if (
    root.localName !== "svg" ||
    root.namespaceURI !== "http://www.w3.org/2000/svg" ||
    parsed.querySelector("parsererror")
  ) {
    return null
  }

  const allowedElements = new Set(["svg", "g", "path", "rect", "circle", "line", "polygon", "polyline"])
  const allowedAttributes = new Set([
    "xmlns",
    "viewbox",
    "width",
    "height",
    "preserveaspectratio",
    "fill",
    "stroke",
    "stroke-width",
    "transform",
    "d",
    "x",
    "y",
    "cx",
    "cy",
    "r",
    "x1",
    "x2",
    "y1",
    "y2",
    "points",
    "role",
    "aria-label",
  ])
  const safeTransform = /^(?:(?:matrix|translate|scale|rotate|skewX|skewY)\(\s*[-+0-9.eE,\s]+\)\s*)+$/i

  for (const element of Array.from(root.querySelectorAll("*"))) {
    if (!allowedElements.has(element.localName)) {
      element.remove()
      continue
    }

    for (const attribute of Array.from(element.attributes)) {
      if (
        !allowedAttributes.has(attribute.name.toLowerCase()) ||
        (attribute.name.toLowerCase() === "transform" && !safeTransform.test(attribute.value))
      ) {
        element.removeAttribute(attribute.name)
      }
    }
  }

  for (const attribute of Array.from(root.attributes)) {
    if (
      !allowedAttributes.has(attribute.name.toLowerCase()) ||
      (attribute.name.toLowerCase() === "transform" && !safeTransform.test(attribute.value))
    ) {
      root.removeAttribute(attribute.name)
    }
  }

  root.setAttribute("width", "100%")
  root.setAttribute("height", "100%")
  root.setAttribute("preserveAspectRatio", "xMidYMid meet")

  const viewBox = root.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number)
  if (viewBox?.length === 4 && viewBox.every(Number.isFinite) && viewBox[2] > 0 && viewBox[3] > 0) {
    const measurementSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    for (const attribute of Array.from(root.attributes)) {
      measurementSvg.setAttribute(attribute.name, attribute.value)
    }
    for (const child of Array.from(root.childNodes)) {
      measurementSvg.append(document.importNode(child, true))
    }
    measurementSvg.setAttribute("width", "192")
    measurementSvg.setAttribute("height", "192")
    Object.assign(measurementSvg.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      visibility: "hidden",
    })
    document.body.append(measurementSvg)

    try {
      const svgBounds = measurementSvg.getBoundingClientRect()
      const graphics = Array.from(
        measurementSvg.querySelectorAll("path, circle, line, polygon, polyline, rect")
      ).filter((element) => {
        if (element.localName !== "rect") return true
        const bounds = element.getBoundingClientRect()
        return bounds.width < svgBounds.width * 0.9 || bounds.height < svgBounds.height * 0.9
      })
      const bounds = graphics.reduce<DOMRect | null>((combined, element) => {
        const current = element.getBoundingClientRect()
        if (current.width === 0 || current.height === 0) return combined
        if (!combined) return current

        const left = Math.min(combined.left, current.left)
        const top = Math.min(combined.top, current.top)
        const right = Math.max(combined.right, current.right)
        const bottom = Math.max(combined.bottom, current.bottom)
        return new DOMRect(left, top, right - left, bottom - top)
      }, null)

      if (bounds && svgBounds.width > 0 && svgBounds.height > 0) {
        const scaleX = viewBox[2] / svgBounds.width
        const scaleY = viewBox[3] / svgBounds.height
        const contentWidth = bounds.width * scaleX
        const contentHeight = bounds.height * scaleY

        if (contentWidth < viewBox[2] * 0.8 || contentHeight < viewBox[3] * 0.8) {
          const side = Math.max(contentWidth, contentHeight) * 1.32
          const centerX = viewBox[0] + (bounds.left + bounds.width / 2 - svgBounds.left) * scaleX
          const centerY = viewBox[1] + (bounds.top + bounds.height / 2 - svgBounds.top) * scaleY
          root.setAttribute(
            "viewBox",
            `${centerX - side / 2} ${centerY - side / 2} ${side} ${side}`
          )
        }
      }
    } finally {
      measurementSvg.remove()
    }
  }

  return new XMLSerializer().serializeToString(root)
}

export function TwoFactorAuthenticationSection({ user }: ComponentProps) {
  const isInitiallyEnabled = Boolean(user.two_factor_confirmed_at)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(isInitiallyEnabled)
  const [setupStarted, setSetupStarted] = useState(
    Boolean(user.two_factor_secret && !isInitiallyEnabled)
  )
  const [showSetup, setShowSetup] = useState(false)
  const [passwordConfirmed, setPasswordConfirmed] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null)
  const [otp, setOtp] = useState("")
  const [twoFactorNotice, setTwoFactorNotice] = useState<Notice | null>(null)
  const [isLoadingSetup, setIsLoadingSetup] = useState(false)
  const [isConfirmingPassword, setIsConfirmingPassword] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [copyNotice, setCopyNotice] = useState<Notice | null>(null)

  async function loadSetupData() {
    setIsLoadingSetup(true)
    setTwoFactorNotice(null)

    try {
      const data = await getTwoFactorSetupData()
      const safeQrCode = sanitizeQrCodeSvg(data.qrCodeSvg)
      if (!safeQrCode) {
        throw new Error("The server returned an invalid QR code.")
      }

      setSetupData({ ...data, qrCodeSvg: safeQrCode })
    } catch (error) {
      setTwoFactorNotice({
        kind: "error",
        message: getErrorMessage(error, "Could not load 2FA setup details. Please try again."),
      })
    } finally {
      setIsLoadingSetup(false)
    }
  }

  async function startSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentPassword) {
      setTwoFactorNotice({ kind: "error", message: "Enter your current password to continue." })
      return
    }

    setIsConfirmingPassword(true)
    setIsLoadingSetup(true)
    setCopyNotice(null)
    setTwoFactorNotice(null)

    try {
      await confirmCurrentPassword(currentPassword)
      if (!setupStarted) {
        await enableTwoFactorAuthentication()
        setSetupStarted(true)
      }
      setPasswordConfirmed(true)
      await loadSetupData()
    } catch (error) {
      setTwoFactorNotice({
        kind: "error",
        message: getErrorMessage(error, "Could not confirm your password or start 2FA setup."),
      })
      setIsLoadingSetup(false)
    } finally {
      setCurrentPassword("")
      setIsConfirmingPassword(false)
    }
  }

  async function confirmTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      setTwoFactorNotice({
        kind: "error",
        message: "Enter the 6-digit code from your authenticator app.",
      })
      return
    }

    setIsConfirming(true)
    setTwoFactorNotice(null)
    setCopyNotice(null)

    try {
      await confirmTwoFactorAuthentication(otp)
      setTwoFactorEnabled(true)
      setShowSetup(false)
      setPasswordConfirmed(false)
      setOtp("")
      setTwoFactorNotice({ kind: "success", message: "Two-factor authentication is now enabled." })
      await loadRecoveryCodes()
    } catch (error) {
      setTwoFactorNotice({
        kind: "error",
        message: getErrorMessage(error, "Could not confirm the code. Please try again."),
      })
    } finally {
      setIsConfirming(false)
    }
  }

  async function loadRecoveryCodes() {
    setIsLoadingCodes(true)
    setCopyNotice(null)

    try {
      const codes = await getTwoFactorRecoveryCodes()
      setRecoveryCodes(codes)
      setShowRecoveryCodes(true)
    } catch (error) {
      setTwoFactorNotice({
        kind: "error",
        message: getErrorMessage(error, "2FA is enabled, but recovery codes could not be loaded."),
      })
    } finally {
      setIsLoadingCodes(false)
    }
  }

  async function disableTwoFactor() {
    setIsDisabling(true)
    setTwoFactorNotice(null)
    setCopyNotice(null)

    try {
      await disableTwoFactorAuthentication()
      setTwoFactorEnabled(false)
      setSetupStarted(false)
      setPasswordConfirmed(false)
      setSetupData(null)
      setShowSetup(false)
      setRecoveryCodes(null)
      setShowRecoveryCodes(false)
      setTwoFactorNotice({ kind: "success", message: "Two-factor authentication has been disabled." })
    } catch (error) {
      setTwoFactorNotice({
        kind: "error",
        message: getErrorMessage(error, "Could not disable 2FA. Please try again."),
      })
    } finally {
      setIsDisabling(false)
    }
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

  return (
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
              <span
                className={`size-1.5 rounded-full ${
                  twoFactorEnabled ? "bg-emerald-600" : "bg-muted-foreground"
                }`}
              />
              2FA {twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
            <p className="text-sm text-muted-foreground">
              {twoFactorEnabled
                ? "Your account requires an authenticator code when signing in."
                : "Protect your account with a code from an authenticator app."}
            </p>
          </div>
          {twoFactorEnabled ? (
            <Button type="button" variant="destructive" onClick={() => void disableTwoFactor()} disabled={isDisabling}>
              <ShieldOff aria-hidden="true" />
              {isDisabling ? "Disabling..." : "Disable 2FA"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setShowSetup(true)
                setTwoFactorNotice(null)
                setCopyNotice(null)
              }}
              disabled={isLoadingSetup || isConfirmingPassword}
            >
              <ShieldPlus aria-hidden="true" />
              {setupStarted ? "Continue setup" : "Enable 2FA"}
            </Button>
          )}
        </div>

        {!showSetup && <StatusNotice notice={twoFactorNotice} />}

        {!twoFactorEnabled && (
          <Dialog
            open={showSetup}
            onOpenChange={(open) => {
              if (!open && (isLoadingSetup || isConfirmingPassword || isConfirming)) return

              setShowSetup(open)
              if (!open) {
                setPasswordConfirmed(false)
                setCurrentPassword("")
                setSetupData(null)
                setOtp("")
                setTwoFactorNotice(null)
                setCopyNotice(null)
              }
            }}
          >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {passwordConfirmed ? "Set up your authenticator app" : "Confirm your password"}
                </DialogTitle>
                <DialogDescription>
                  {passwordConfirmed
                    ? "Scan this code with your authenticator app, or enter the setup key manually."
                    : "For your security, confirm your current password before setting up two-factor authentication."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {!passwordConfirmed && (
                  <form onSubmit={(event) => void startSetup(event)} className="space-y-3">
                    <div className="space-y-2">
                      <label htmlFor="two-factor-current-password" className="text-sm font-medium">
                        Current password
                      </label>
                      <Input
                        id="two-factor-current-password"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        className="h-10"
                        required
                        disabled={isConfirmingPassword || isLoadingSetup}
                      />
                    </div>
                    <Button type="submit" disabled={!currentPassword || isConfirmingPassword || isLoadingSetup}>
                      <LockKeyhole aria-hidden="true" />
                      {isConfirmingPassword || isLoadingSetup
                        ? "Confirming password..."
                        : "Confirm password and continue"}
                    </Button>
                  </form>
                )}

                {isLoadingSetup && passwordConfirmed && !setupData && (
                  <p className="text-sm text-muted-foreground">Loading setup details...</p>
                )}

                {setupData && (
                  <>
                    <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                      <div
                        className="mx-auto flex size-56 items-center justify-center rounded-lg border bg-white p-2 [&>svg]:block [&>svg]:size-full"
                        role="img"
                        aria-label="Authenticator setup QR code"
                        dangerouslySetInnerHTML={{ __html: setupData.qrCodeSvg }}
                      />
                      <div className="space-y-2">
                        <label htmlFor="manual-setup-key" className="text-sm font-medium">Manual setup key</label>
                        <div className="flex gap-2">
                          <Input
                            id="manual-setup-key"
                            readOnly
                            value={setupData.secretKey}
                            className="h-10 font-mono text-xs"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Copy manual setup key"
                            onClick={() => void copyText(setupData.secretKey, "Setup key copied.")}
                          >
                            <Copy aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={(event) => void confirmTwoFactor(event)} className="space-y-3">
                      <div className="space-y-2">
                        <label htmlFor="authenticator-code" className="text-sm font-medium">
                          6-digit verification code
                        </label>
                        <InputOTP
                          id="authenticator-code"
                          maxLength={6}
                          inputMode="numeric"
                          value={otp}
                          onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
                          autoComplete="one-time-code"
                          aria-label="6-digit verification code"
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} className="size-10" />
                            <InputOTPSlot index={1} className="size-10" />
                            <InputOTPSlot index={2} className="size-10" />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} className="size-10" />
                            <InputOTPSlot index={4} className="size-10" />
                            <InputOTPSlot index={5} className="size-10" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button type="submit" disabled={otp.length !== 6 || isConfirming}>
                        <ShieldCheck aria-hidden="true" />
                        {isConfirming ? "Confirming..." : "Confirm & activate 2FA"}
                      </Button>
                    </form>
                  </>
                )}

                {setupStarted && passwordConfirmed && !setupData && !isLoadingSetup && (
                  <Button type="button" variant="outline" onClick={() => void loadSetupData()}>
                    Retry loading setup details
                  </Button>
                )}

                <StatusNotice notice={twoFactorNotice} />
                <StatusNotice notice={copyNotice} />
              </div>

              <DialogFooter>
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isLoadingSetup || isConfirmingPassword || isConfirming}
                    />
                  }
                >
                  Cancel
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                    if (showRecoveryCodes) {
                      setShowRecoveryCodes(false)
                    } else if (recoveryCodes) {
                      setShowRecoveryCodes(true)
                    } else {
                      void loadRecoveryCodes()
                    }
                  }}
                  disabled={isLoadingCodes}
                >
                  {isLoadingCodes ? "Loading codes..." : showRecoveryCodes ? "Hide recovery codes" : "View recovery codes"}
                </Button>
                {showRecoveryCodes && recoveryCodes && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void copyText(recoveryCodes.join("\n"), "Recovery codes copied.")}
                  >
                    <Copy aria-hidden="true" /> Copy all
                  </Button>
                )}
              </div>
            </div>

            {showRecoveryCodes && recoveryCodes && (
              <div className="grid gap-2 rounded-lg border bg-muted/30 p-3 font-mono text-sm sm:grid-cols-2 lg:grid-cols-4">
                {recoveryCodes.map((code, index) => (
                  <code key={`${code}-${index}`} className="rounded-md bg-background px-3 py-2 text-center">
                    {code}
                  </code>
                ))}
              </div>
            )}
            <StatusNotice notice={copyNotice} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
