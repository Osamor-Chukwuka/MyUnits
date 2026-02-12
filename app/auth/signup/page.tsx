'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Zap } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { AuthActionState, signupAction } from '@/app/actions/auth-actions';
import { toast } from 'sonner';

const initialState: AuthActionState = {
  ok: false,
}

export default function SignupPage() {
  const [signupState, handleSignup, pending] = useActionState(signupAction, initialState);

  //use effect to show toast on signup success or error
  useEffect(() => {
    if (!signupState.message) return;

    if (signupState.ok) {
      toast.success(signupState.message);
    } else {
      toast.error(signupState.message);
    }
  }, [signupState])

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-background via-secondary to-background p-4 min-h-screen">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-primary" />
            <span className="font-bold text-foreground text-2xl">MeterPay</span>
          </div>
          <h1 className="mb-2 font-bold text-foreground text-3xl">Create Account</h1>
          <p className="text-muted-foreground">Join us to start managing your meters</p>
        </div>

        <Card className="p-8 border border-border">
          <form className="space-y-5" action={handleSignup}>
            <div className="space-y-2">
              <label className="block font-medium text-foreground text-sm">First Name</label>
              <Input
                type="text"
                placeholder="John"
                name="first_name"
                className="bg-input px-4 py-2 border border-border rounded-md"
                defaultValue={signupState.values?.first_name ?? ''}
              />
              {signupState.fieldErrors?.first_name && <p className="mt-1 text-red-500 text-sm">{signupState.fieldErrors.first_name}</p>}
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-foreground text-sm">Last Name</label>
              <Input
                type="text"
                placeholder="Doe"
                name="last_name"
                className="bg-input px-4 py-2 border border-border rounded-md"
                defaultValue={signupState.values?.last_name ?? ''}
              />
              {signupState.fieldErrors?.last_name && <p className="mt-1 text-red-500 text-sm">{signupState.fieldErrors.last_name}</p>}
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-foreground text-sm">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                name="email"
                className="bg-input px-4 py-2 border border-border rounded-md"
                defaultValue={signupState.values?.email ?? ''}
              />
              {signupState.fieldErrors?.email && <p className="mt-1 text-red-500 text-sm">{signupState.fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-foreground text-sm">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                name="password"
                className="bg-input px-4 py-2 border border-border rounded-md"
                defaultValue={signupState.values?.password ?? ''}
              />
              {signupState.fieldErrors?.password && <p className="mt-1 text-red-500 text-sm">{signupState.fieldErrors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-foreground text-sm">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                name="confirm_password"
                className="bg-input px-4 py-2 border border-border rounded-md"
                defaultValue={signupState.values?.confirm_password ?? ''}
              />
              {signupState.fieldErrors?.password && <p className="mt-1 text-red-500 text-sm">{signupState.fieldErrors.password}</p>}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="mt-1 rounded" />
              <span className="text-muted-foreground text-sm">
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

            {signupState.message && signupState.ok ?

              <p className="text-green-500 text-center">{signupState.message}</p>
              :
              <p className="text-red-500 text-center">{signupState.message}</p>
            }

            <Button disabled={pending} type="submit" className="gap-2 w-full">
              {pending ? 'Creating Account...' : 'Sign Up'}
              <Zap className={`w-4 h-4 ${pending ? 'animate-spin' : ''}`} />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-border border-t text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
