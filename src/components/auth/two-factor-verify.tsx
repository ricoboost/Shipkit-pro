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
import { Loader2, ShieldCheck, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

interface TwoFactorVerifyProps {
  email: string
  onVerified: () => void
  onCancel?: () => void
}

export function TwoFactorVerify({ email, onVerified, onCancel }: TwoFactorVerifyProps) {
  const t = useTranslations('auth')
  const [code, setCode] = useState('')
  const [isBackupMode, setIsBackupMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async () => {
    if (!code) {
      toast.error(isBackupMode ? 'Please enter a backup code' : 'Please enter a verification code')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: code.replace(/\s/g, '').replace(/-/g, ''),
          isBackupCode: isBackupMode,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Verification failed')
      }

      onVerified()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid code. Please try again.')
      setCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify()
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          {isBackupMode ? (
            <KeyRound className="h-6 w-6 text-primary" />
          ) : (
            <ShieldCheck className="h-6 w-6 text-primary" />
          )}
        </div>
        <CardTitle>
          {isBackupMode
            ? t('twoFactor.backupCodeTitle') || 'Enter Backup Code'
            : t('twoFactor.title') || 'Two-Factor Authentication'}
        </CardTitle>
        <CardDescription>
          {isBackupMode
            ? t('twoFactor.backupCodeDescription') ||
              'Enter one of your backup codes to sign in'
            : t('twoFactor.description') ||
              'Enter the 6-digit code from your authenticator app'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">
            {isBackupMode
              ? t('twoFactor.backupCodeLabel') || 'Backup Code'
              : t('twoFactor.codeLabel') || 'Verification Code'}
          </Label>
          <Input
            id="code"
            type="text"
            inputMode={isBackupMode ? 'text' : 'numeric'}
            pattern={isBackupMode ? undefined : '[0-9]*'}
            maxLength={isBackupMode ? 10 : 6}
            placeholder={isBackupMode ? 'XXXX-XXXX' : '000000'}
            value={code}
            onChange={(e) => setCode(isBackupMode ? e.target.value : e.target.value.replace(/\D/g, ''))}
            onKeyDown={handleKeyDown}
            className="text-center text-xl tracking-widest"
            autoFocus
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          onClick={handleVerify}
          disabled={isLoading || (!isBackupMode && code.length !== 6)}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('twoFactor.verify') || 'Verify'}
        </Button>

        <div className="flex w-full gap-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="flex-1">
              {t('common.cancel') || 'Cancel'}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              setIsBackupMode(!isBackupMode)
              setCode('')
            }}
            className="flex-1"
          >
            {isBackupMode
              ? t('twoFactor.useAuthenticator') || 'Use authenticator app'
              : t('twoFactor.useBackupCode') || 'Use backup code'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
