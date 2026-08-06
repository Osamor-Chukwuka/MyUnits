'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';
import { AuthActionState, signupAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SuccessModal from '@/components/ui/success-modal';

const initialState: AuthActionState = {
  ok: false,
};

export default function SignupPage() {
  const [signupState, handleSignup, pending] = useActionState(signupAction, initialState);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Keep success feedback and validation feedback on different paths so
  // failed validation never opens the signup success modal.
  useEffect(() => {
    if (!signupState.message) return;

    if (signupState.ok) {
      toast.success(signupState.message);
      queueMicrotask(() => setShowSuccessModal(true));
    } else {
      toast.error(signupState.message);
      queueMicrotask(() => setShowSuccessModal(false));
    }
  }, [signupState]);

  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-accent shadow-lg">
              <Zap className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold text-foreground">myUnits</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground">Join us to start managing your meters</p>
        </div>

        {!showSuccessModal ? (
          <Card className="p-8 md:p-10">
            <form className="space-y-6" action={handleSignup}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">First Name</label>
                  <Input
                    type="text"
                    placeholder="John"
                    name="first_name"
                    required
                    className="min-h-11 rounded-xl border border-border bg-white/45 px-4 py-2"
                    defaultValue={signupState.values?.first_name ?? ''}
                  />
                  {signupState.fieldErrors?.first_name && (
                    <p className="mt-1 text-sm text-red-500">{signupState.fieldErrors.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Last Name</label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    name="last_name"
                    required
                    className="min-h-11 rounded-xl border border-border bg-white/45 px-4 py-2"
                    defaultValue={signupState.values?.last_name ?? ''}
                  />
                  {signupState.fieldErrors?.last_name && (
                    <p className="mt-1 text-sm text-red-500">{signupState.fieldErrors.last_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    name="email"
                    required
                    className="min-h-11 rounded-xl border border-border bg-white/45 px-4 py-2"
                    defaultValue={signupState.values?.email ?? ''}
                  />
                  {signupState.fieldErrors?.email && (
                    <p className="mt-1 text-sm text-red-500">{signupState.fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="08012345678"
                    name="phone_number"
                    required
                    className="min-h-11 rounded-xl border border-border bg-white/45 px-4 py-2"
                    defaultValue={signupState.values?.phone_number ?? ''}
                  />
                  <p className="text-xs text-muted-foreground">We use this to complete your electricity recharge.</p>
                  {signupState.fieldErrors?.phone_number && (
                    <p className="mt-1 text-sm text-red-500">{signupState.fieldErrors.phone_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Password</label>
                  <Input
                    type="password"
                    placeholder="........"
                    name="password"
                    required
                    className="min-h-11 rounded-xl border border-border bg-white/45 px-4 py-2"
                    defaultValue={signupState.values?.password ?? ''}
                  />
                  {signupState.fieldErrors?.password && (
                    <p className="mt-1 text-sm text-red-500">{signupState.fieldErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="........"
                    name="confirm_password"
                    required
                    className="min-h-11 rounded-xl border border-border bg-white/45 px-4 py-2"
                    defaultValue={signupState.values?.confirm_password ?? ''}
                  />
                  {signupState.fieldErrors?.password && (
                    <p className="mt-1 text-sm text-red-500">{signupState.fieldErrors.password}</p>
                  )}
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2 md:max-w-2xl">
                <input type="checkbox" className="mt-1 rounded" />
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {signupState.message &&
                (signupState.ok ? (
                  <p className="text-center text-green-500">{signupState.message}</p>
                ) : (
                  <p className="text-center text-red-500">{signupState.message}</p>
                ))}

              <Button disabled={pending} type="submit" className="w-full gap-2 md:max-w-sm">
                {pending ? 'Creating Account...' : 'Sign Up'}
                <Zap className={`h-4 w-4 ${pending ? 'animate-spin' : ''}`} />
              </Button>
            </form>

            <div className="mt-6 border-border border-t pt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        ) : (
          <SuccessModal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
        )}
      </div>
    </div>
  );
}
