'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface TwoFactorSetupProps {
  onSetupComplete?: () => void
}

interface SetupData {
  secret: string
  qrCodeDataUrl: string
  backupCodes: string[]
}

export function TwoFactorSetup({ onSetupComplete }: TwoFactorSetupProps) {
  const t = useTranslations('settings')
  const [step, setStep] = useState<'initial' | 'setup' | 'verify' | 'backup'>('initial')
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)
  const [showBackupDialog, setShowBackupDialog] = useState(false)

  const handleStartSetup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to initialize 2FA setup')
      }

      const data = await response.json()
      setSetupData(data)
      setStep('setup')
    } catch (error) {
      toast.error('Failed to start 2FA setup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      })

      if (!response.ok) {
        throw new Error('Invalid verification code')
      }

      setStep('backup')
      setShowBackupDialog(true)
    } catch (error) {
      toast.error('Invalid code. Please try again.')
      setVerificationCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'))
      setCopiedCodes(true)
      toast.success('Backup codes copied to clipboard')
      setTimeout(() => setCopiedCodes(false), 3000)
    }
  }

  const handleComplete = () => {
    setShowBackupDialog(false)
    toast.success('Two-factor authentication enabled successfully!')
    onSetupComplete?.()
  }

  if (step === 'initial') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {t('security.twoFactor.title') || 'Two-Factor Authentication'}
          </CardTitle>
          <CardDescription>
            {t('security.twoFactor.description') || 'Add an extra layer of security to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('security.twoFactor.setupInfo') ||
              'When enabled, you\'ll need to enter a code from your authenticator app whenever you sign in.'}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartSetup} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('security.twoFactor.enable') || 'Enable 2FA'}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (step === 'setup' && setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('security.twoFactor.scanQR') || 'Scan QR Code'}</CardTitle>
          <CardDescription>
            {t('security.twoFactor.scanInstructions') ||
              'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <img
              src={setupData.qrCodeDataUrl}
              alt="2FA QR Code"
              className="rounded-lg border"
              width={200}
              height={200}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              {t('security.twoFactor.manualEntry') || 'Or enter this code manually:'}
            </Label>
            <code className="block rounded bg-muted px-3 py-2 text-sm font-mono">
              {setupData.secret}
            </code>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setStep('verify')} className="w-full">
            {t('security.twoFactor.continue') || 'Continue'}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (step === 'verify') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('security.twoFactor.verifyCode') || 'Verify Code'}</CardTitle>
          <CardDescription>
            {t('security.twoFactor.verifyInstructions') ||
              'Enter the 6-digit code from your authenticator app to complete setup'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{t('security.twoFactor.code') || 'Verification Code'}</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest"
              autoFocus
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('setup')}>
            {t('common.back') || 'Back'}
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length !== 6}
            className="flex-1"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('security.twoFactor.verify') || 'Verify & Enable'}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            {t('security.twoFactor.enabled') || '2FA Enabled'}
          </CardTitle>
          <CardDescription>
            {t('security.twoFactor.enabledDescription') ||
              'Your account is now protected with two-factor authentication'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {t('security.twoFactor.saveBackupCodes') || 'Save Your Backup Codes'}
            </DialogTitle>
            <DialogDescription>
              {t('security.twoFactor.backupCodesWarning') ||
                'Store these codes safely. You can use them to access your account if you lose your authenticator device.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div className="rounded-lg border bg-muted p-4">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {setupData?.backupCodes.map((code, index) => (
                  <div key={index} className="rounded bg-background px-2 py-1">
                    {code.slice(0, 4)}-{code.slice(4)}
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyBackupCodes}
              className="w-full"
            >
              {copiedCodes ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t('common.copied') || 'Copied'}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('security.twoFactor.copyBackupCodes') || 'Copy Backup Codes'}
                </>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={handleComplete} className="w-full">
              {t('security.twoFactor.savedCodes') || "I've saved my backup codes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
