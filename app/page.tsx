'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Smartphone } from 'lucide-react';
import Image from 'next/image';
import { FeatureCard } from '@/components/pages/landing/feature-card';
import { title } from 'process';

const features = {
  one: {
    title: "Recharge Your Meter Instantly",
    description: "Recharge your prepaid meter anytime, anywhere. Our seamless interface makes it easy to top up your balance in just a few taps. Track every recharge and receive instant confirmation with your token details.",
    imageSrc: "/feature-recharge.jpg",
    featureList: [
      "Quick recharge in seconds",
      "Multiple payment methods",
      "Instant token delivery"
    ],
    cta: "Start Recharging",
    order: 'order-2',
    icon: Zap,
  },

  two: {
    title: "Manage Multiple Meters",
    description: "Handle all your meters in one unified dashboard. Whether you have meters at home, business, or shop, manage them all with ease. Add, organize, and track multiple meters without any hassle.",
    imageSrc: "/feature-meters.jpg",
    featureList: [
      "Centralized control hub",
      "Easy meter organization",
      "Real-time usage tracking"
    ],
    cta: "Add Your Meters",
    order: 'order-2',
    icon: Smartphone,
  },

  three: {
    title: "Smart Appliance Cost Calculator",
    description: "Know exactly how much your appliances cost to run. Calculate electricity expenses for your AC, refrigerator, TV, and more. Make informed decisions about energy usage and save money on your bills.",
    imageSrc: "/feature-estimation.jpg",
    featureList: [
      "Instant cost calculations",
      "Popular appliance presets",
      "Custom appliance support"
    ],
    cta: "Try Calculator",
    order: 'order-2',
    icon: TrendingUp,
  },

  four: {
    title: "Comprehensive Token History",
    description: "Keep a complete record of all your recharges and tokens. View detailed transaction history with dates, amounts, tokens, and more. Never lose important payment information again.",
    imageSrc: "/feature-history.jpg",
    featureList: [
      "Complete transaction logs",
      "Easy token retrieval",
      "Downloadable records"
    ],
    cta: "View Your History",
    order: 'order-2',
    icon: Zap,
  },
}

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Navigation */}
      <nav className="top-0 z-50 sticky bg-background/80 backdrop-blur-sm border-border border-b">
        <div className="flex justify-between items-center mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
          <div className="flex items-center gap-2 animate-fade-in">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground text-xl">MeterPay</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="py-16 lg:py-20">
          <div className="items-center gap-12 grid lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <h1 className="mb-6 font-bold text-foreground text-5xl lg:text-6xl text-balance leading-tight">
                Smart Meter Recharges, Made Simple
              </h1>
              <p className="mb-8 max-w-2xl text-muted-foreground text-xl text-balance">
                Manage your prepaid meters easily. Track usage, estimate appliance costs, and recharge in minutes with our intelligent platform.
              </p>
              <div className="flex sm:flex-row flex-col gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="gap-2 hover:scale-105 transition-transform">
                    Get Started
                    <Zap className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="bg-transparent hover:scale-105 transition-transform">
                    Already Have an Account?
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center animate-delay-100 animate-fade-in-up">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-2xl animate-pulse" />
                <Image
                  src="/meter-hero.jpg"
                  alt="Digital prepaid electricity meter"
                  width={400}
                  height={400}
                  className="relative shadow-2xl rounded-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature 1: Recharge */}
        <FeatureCard body={features.one} />

        {/* Feature 2: Multiple Meters */}
        <FeatureCard body={features.two} />

        {/* Feature 3: Smart Estimation */}
        <FeatureCard body={features.three} />

        {/* Feature 4: Token History */}
        <FeatureCard body={features.four} />

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 mb-20 p-12 py-20 border border-border rounded-lg text-center animate-delay-500 animate-fade-in-up">
          <h2 className="mb-4 font-bold text-foreground text-3xl">Ready to Take Control?</h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Join thousands of users who are saving time and money with MeterPay.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2 hover:scale-105 transition-transform">
              Create Your Account
              <Zap className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card py-8 border-border border-t">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-muted-foreground text-center">
          <p>&copy; 2026 MeterPay. All rights reserved.</p>
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
