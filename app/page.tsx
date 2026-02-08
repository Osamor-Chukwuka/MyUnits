'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Smartphone } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl text-foreground">MeterPay</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
                Smart Meter Recharges, Made Simple
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl text-balance">
                Manage your prepaid meters easily. Track usage, estimate appliance costs, and recharge in minutes with our intelligent platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 hover:scale-105 transition-transform">
                    Get Started
                    <Zap className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="hover:scale-105 transition-transform bg-transparent">
                    Already Have an Account?
                  </Button>
                </Link>
              </div>
            </div>

            <div className="animate-fade-in-up animate-delay-100 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl animate-pulse" />
                <Image
                  src="/meter-hero.jpg"
                  alt="Digital prepaid electricity meter"
                  width={400}
                  height={400}
                  className="relative rounded-2xl shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature 1: Recharge */}
        <div className="py-20 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up animate-delay-200">
              <h2 className="text-4xl font-bold text-foreground mb-6">Recharge Your Meter Instantly</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Recharge your prepaid meter anytime, anywhere. Our seamless interface makes it easy to top up your balance in just a few taps. Track every recharge and receive instant confirmation with your token details.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">Quick recharge in seconds</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">Multiple payment methods</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">Instant token delivery</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Recharging
                  <Zap className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="animate-fade-in-up animate-delay-300 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-3xl" />
                <Image
                  src="/feature-recharge.jpg"
                  alt="Instant meter recharge interface"
                  width={400}
                  height={400}
                  className="relative rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Multiple Meters */}
        <div className="py-20 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up animate-delay-300 flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-3xl" />
                <Image
                  src="/feature-meters.jpg"
                  alt="Multiple meter management dashboard"
                  width={400}
                  height={400}
                  className="relative rounded-2xl shadow-xl"
                />
              </div>
            </div>
            <div className="animate-fade-in-up animate-delay-400 order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-foreground mb-6">Manage Multiple Meters</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Handle all your meters in one unified dashboard. Whether you have meters at home, business, or shop, manage them all with ease. Add, organize, and track multiple meters without any hassle.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">Centralized control hub</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">Easy meter organization</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">Real-time usage tracking</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Add Your Meters
                  <Smartphone className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature 3: Smart Estimation */}
        <div className="py-20 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up animate-delay-500">
              <h2 className="text-4xl font-bold text-foreground mb-6">Smart Appliance Cost Calculator</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Know exactly how much your appliances cost to run. Calculate electricity expenses for your AC, refrigerator, TV, and more. Make informed decisions about energy usage and save money on your bills.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">Instant cost calculations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">Popular appliance presets</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">Custom appliance support</span>
                </li>
              </ul>
              <Link href="/appliance-calculator">
                <Button size="lg" className="gap-2">
                  Try Calculator
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="animate-fade-in-up animate-delay-600 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-3xl" />
                <Image
                  src="/feature-estimation.jpg"
                  alt="Smart appliance cost calculator"
                  width={400}
                  height={400}
                  className="relative rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Token History */}
        <div className="py-20 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up animate-delay-600 flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-3xl" />
                <Image
                  src="/feature-history.jpg"
                  alt="Complete recharge history and token records"
                  width={400}
                  height={400}
                  className="relative rounded-2xl shadow-xl"
                />
              </div>
            </div>
            <div className="animate-fade-in-up animate-delay-700 order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-foreground mb-6">Comprehensive Token History</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Keep a complete record of all your recharges and tokens. View detailed transaction history with dates, amounts, tokens, and more. Never lose important payment information again.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">Complete transaction logs</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">Easy token retrieval</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">Downloadable records</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  View Your History
                  <Zap className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-primary/5 to-accent/5 border border-border rounded-lg p-12 text-center mb-20 animate-fade-in-up animate-delay-500">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Take Control?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of users who are saving time and money with MeterPay.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 hover:scale-105 transition-transform">
              Create Your Account
              <Zap className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2024 MeterPay. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-delay-100 {
          animation-delay: 0.1s;
        }

        .animate-delay-200 {
          animation-delay: 0.2s;
        }

        .animate-delay-300 {
          animation-delay: 0.3s;
        }

        .animate-delay-400 {
          animation-delay: 0.4s;
        }

        .animate-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
