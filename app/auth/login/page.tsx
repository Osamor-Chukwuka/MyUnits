'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Zap } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-background via-secondary to-background p-4 min-h-screen">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-primary" />
            <span className="font-bold text-foreground text-2xl">MeterPay</span>
          </div>
          <h1 className="mb-2 font-bold text-foreground text-3xl">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to manage your meters</p>
        </div>

        <Card className="p-8 border border-border">
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="block font-medium text-foreground text-sm">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input px-4 py-2 border border-border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-foreground text-sm">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input px-4 py-2 border border-border rounded-md"
              />
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

            <Button type="submit" className="gap-2 w-full">
              Sign In
              <Zap className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-border border-t text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
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
