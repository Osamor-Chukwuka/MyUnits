'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Zap } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { AuthActionState, loginAction } from '@/app/actions/auth-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const initialState: AuthActionState = {
  ok: false,
}

export default function LoginPage() {
  const [loginState, handleLogin, pending] = useActionState(loginAction, initialState);
  const router = useRouter();

  //use effect to show toast on login success or error
  useEffect(() => {
    if (!loginState.message) return;

    if (loginState.ok) {
      router.replace('/dashboard');
      toast.success(loginState.message);
    } else {
      toast.error(loginState.message);
    }
  }, [loginState, router])

  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-accent shadow-lg">
              <Zap className="w-6 h-6" />
            </span>
            <span className="font-bold text-foreground text-2xl">myUnits</span>
          </div>
          <h1 className="mb-2 font-bold text-foreground text-3xl">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to manage your meters</p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" action={handleLogin}>
            <div className="space-y-2">
              <label className="block font-medium text-foreground text-sm">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                name='email'
                className="min-h-11 rounded-xl border border-border bg-white/45 px-4 py-2"
                defaultValue={loginState.values?.email ?? ''}
              />
              {loginState.fieldErrors?.email && <p className="mt-1 text-red-500 text-sm">{loginState.fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-foreground text-sm">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                name='password'
                className="min-h-11 rounded-xl border border-border bg-white/45 px-4 py-2"
                defaultValue={loginState.values?.password ?? ''}
              />
              {loginState.fieldErrors?.password && <p className="mt-1 text-red-500 text-sm">{loginState.fieldErrors.password}</p>}
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            {loginState.message && loginState.ok ?

              <p className="text-green-500 text-center">{loginState.message}</p>
              :
              <p className="text-red-500 text-center">{loginState.message}</p>
            }

            <Button disabled={pending} type="submit" className="gap-2 w-full">
              {pending ? 'Logging in...' : 'Login'}
              <Zap className={`w-4 h-4 ${pending ? 'animate-spin' : ''}`} />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-border border-t text-center">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
