'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Cable,
  Clock3,
  Gauge,
  Lightbulb,
  PlugZap,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  WalletCards,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Tape', href: '#tape' },
  { label: 'Desk', href: '#desk' },
  { label: 'Records', href: '#records' },
];

const receiptTape = [
  ['Home meter', 'NGN 18,400', 'Token ready'],
  ['Office meter', 'NGN 27,000', 'Paid'],
  ['Manual entry', 'AEDC', 'Delivered'],
  ['Appliance estimate', '79.9 kWh', 'Planned'],
];

const deskRows = [
  { label: 'Provider', value: 'AEDC', icon: PlugZap },
  { label: 'Meter type', value: 'Prepaid', icon: Gauge },
  { label: 'Payment', value: 'Paystack', icon: WalletCards },
];

const dialItems = [
  { name: 'Air conditioner', cost: 'NGN 8,200', width: '82%' },
  { name: 'Refrigerator', cost: 'NGN 3,900', width: '46%' },
  { name: 'Lighting', cost: 'NGN 1,450', width: '24%' },
];

const recordItems = [
  {
    title: 'Payment trail',
    description: 'Payment state, provider response, token and amount live in one durable receipt.',
    icon: ReceiptText,
  },
  {
    title: 'Meter memory',
    description: 'Saved meters behave like named places, while manual recharges still stay traceable.',
    icon: Smartphone,
  },
  {
    title: 'Recovery path',
    description: 'Pending outcomes remain visible and re-checkable instead of disappearing after checkout.',
    icon: ShieldCheck,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0b12] text-[#f6efe0]">
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between border border-white/12 bg-[#0a0b12]/54 px-3 text-white shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:px-5 glass">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="myUnits home">
            <span className="grid size-10 shrink-0 place-items-center border border-[#ffcf6a]/45 bg-[#ffcf6a] text-[#11100d] shadow-[0_0_30px_rgba(255,207,106,0.22)]">
              <Zap className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold leading-none">myUnits</span>
              <span className="mt-1 hidden text-xs text-white/55 sm:block">Prepaid power ledger</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-sm text-white/60 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="h-10 rounded-[8px] px-3 text-white hover:bg-white/10 hover:text-white sm:px-4"
            >
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-[8px] bg-[#ffcf6a] px-3 text-[#11100d] shadow-[0_0_28px_rgba(255,207,106,0.2)] hover:bg-[#ffdc8f] sm:px-5"
            >
              <Link href="/auth/signup">Start</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="stage-hero relative min-h-[100dvh] overflow-hidden">
          <Image
            src="/meter-hero.jpg"
            alt="Digital prepaid electricity meter"
            fill
            priority
            sizes="100vw"
            className="stage-meter object-cover"
          />
          <div className="stage-blackout absolute inset-0" />
          <div className="stage-light absolute inset-0" />
          <div className="stage-texture absolute inset-0" />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
            <div className="stage-bulb">
              <div className="stage-wire" />
              <div className="stage-cap">
                <Cable className="size-4 text-[#d9d0be]" />
              </div>
              <div className="stage-globe">
                <div className="globe-glass" />
                <div className="globe-core" />
                <div className="globe-filament" />
              </div>
              <div className="stage-beam" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-[7.4rem] z-10 hidden justify-center lg:flex">
            <p className="brand-ghost">myUnits</p>
          </div>

          <div className="relative z-30 mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-end px-4 pb-6 pt-36 sm:px-6 lg:px-8">
            <div className="hero-caption mx-auto max-w-5xl text-center">
              <p className="hero-reveal mx-auto inline-flex items-center gap-2 border border-white/16 bg-white/8 px-3 py-2 text-sm text-white/72 backdrop-blur-xl glass">
                <Lightbulb className="size-4 text-[#ffcf6a]" />
                When the bulb comes on, the receipt is already waiting.
              </p>

              <h1 className="hero-reveal hero-reveal-1 mt-6 text-[clamp(3.25rem,9vw,9rem)] font-semibold leading-[0.9] tracking-normal text-white">
                Power you can trace.
              </h1>
              <p className="hero-reveal hero-reveal-2 mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/74 sm:text-xl">
                myUnits turns meter recharge into a visible trail: pay, receive a token, check status,
                and keep proof without hunting through messages.
              </p>

              <div className="hero-reveal hero-reveal-3 mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-[8px] bg-[#ffcf6a] px-6 text-base text-[#11100d] shadow-[0_0_42px_rgba(255,207,106,0.22)] hover:bg-[#ffdc8f]"
                >
                  <Link href="/auth/signup">
                    Create account
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-[8px] border-white/20 bg-white/8 px-6 text-base text-white backdrop-blur-xl hover:bg-white/14 hover:text-white"
                >
                  <Link href="#tape">Watch the trail</Link>
                </Button>
              </div>
            </div>

            <div className="hero-reveal hero-reveal-4 mt-12 grid border border-white/12 bg-white/8 backdrop-blur-2xl glass sm:grid-cols-4">
              {receiptTape.map(([meter, amount, status]) => (
                <div key={meter} className="min-w-0 border-b border-white/10 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="text-xs uppercase text-white/42">{meter}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{amount}</p>
                  <p className="mt-1 text-sm text-[#7fe1d2]">{status}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="tape" className="relative overflow-hidden bg-[#e9ddcb] py-10 text-[#15120f]">
          <div className="tape-shadow absolute inset-x-0 top-0 h-12" />
          <div className="receipt-rail whitespace-nowrap border-y border-[#15120f]/12 bg-[#f8f0df] py-5">
            <div className="receipt-track inline-flex gap-4 px-4">
              {[...receiptTape, ...receiptTape].map(([meter, amount, status], index) => (
                <div key={`${meter}-${index}`} className="receipt-chip">
                  <span>{meter}</span>
                  <strong>{amount}</strong>
                  <em>{status}</em>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="desk" className="relative overflow-hidden bg-[#f5ecdf] px-4 py-20 text-[#15120f] sm:px-6 sm:py-24 lg:px-8">
          <div className="desk-grid absolute inset-0" />
          <div className="relative mx-auto max-w-7xl">
            <div className="desk-heading">
              <p className="text-sm font-semibold uppercase text-[#9b5139]">Operating desk</p>
              <h2 className="mt-4 max-w-5xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">
                Not a feature grid. A desk where the meter, payment, and proof sit together.
              </h2>
            </div>

            <div className="desk-surface mt-12">
              <div className="desk-photo">
                <Image
                  src="/meter-hero.jpg"
                  alt="Prepaid electricity meter mounted on a wall"
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(13,10,8,0.62))]" />
                <div className="absolute bottom-5 left-5 right-5 border border-white/24 bg-white/16 p-4 text-white backdrop-blur-xl glass">
                  <p className="text-xs uppercase text-white/58">Primary meter</p>
                  <p className="mt-1 text-2xl font-semibold">Home Apartment</p>
                </div>
              </div>

              <div className="desk-console">
                <div className="desk-panel main-panel">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase text-[#6d6258]">Recharge cockpit</p>
                      <h3 className="mt-2 text-3xl font-semibold">NGN 18,400</h3>
                    </div>
                    <span className="grid size-11 place-items-center bg-[#15120f] text-[#ffcf6a]">
                      <PlugZap className="size-5" />
                    </span>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {deskRows.map((row) => (
                      <div key={row.label} className="desk-cell">
                        <row.icon className="size-5 text-[#9b5139]" />
                        <p className="mt-4 text-sm text-[#6d6258]">{row.label}</p>
                        <p className="mt-1 font-semibold">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="desk-panel token-panel">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6d6258]">Token</span>
                    <span className="text-[#137e71]">Ready</span>
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-normal">2636 2054 4059</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0c0d15] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="appliance-dial">
              <div className="dial-ring">
                <div className="dial-core">
                  <CircleGaugeIcon />
                  <p className="mt-4 text-sm uppercase text-white/48">Projected spend</p>
                  <p className="mt-2 text-4xl font-semibold">NGN 13,550</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase text-[#7fe1d2]">Usage sense</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                Before you recharge, see what is likely draining the balance.
              </h2>
              <div className="mt-8 space-y-4">
                {dialItems.map((item) => (
                  <div key={item.name} className="usage-row">
                    <div className="flex items-center justify-between gap-4">
                      <span>{item.name}</span>
                      <strong>{item.cost}</strong>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden bg-white/10">
                      <div className="h-full bg-[#ffcf6a]" style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="records" className="relative overflow-hidden bg-[#f8f0df] px-4 py-20 text-[#15120f] sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-[#9b5139]">Records</p>
                <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">
                  Receipts should hang around after the payment screen closes.
                </h2>
              </div>
              <Button asChild className="h-12 rounded-[8px] bg-[#15120f] px-6 text-white hover:bg-[#241f1a]">
                <Link href="/auth/signup">
                  Save my first meter
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="record-line mt-14">
              {recordItems.map((item, index) => (
                <article key={item.title} className="record-slip">
                  <div className="pin" />
                  <div className="grid size-11 place-items-center bg-[#15120f] text-[#ffcf6a]">
                    <item.icon className="size-5" />
                  </div>
                  <p className="mt-8 text-xs uppercase text-[#6d6258]">0{index + 1}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-[#62584f]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#ffcf6a] px-4 py-16 text-[#15120f] sm:px-6 sm:py-20 lg:px-8">
          <div className="cta-lines absolute inset-0" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-[#7d5130]">Start here</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                Recharge once. Keep the trail every time after.
              </h2>
            </div>
            <Button asChild size="lg" className="h-12 rounded-[8px] bg-[#15120f] px-6 text-base text-white hover:bg-[#241f1a]">
              <Link href="/auth/signup">
                Open myUnits
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0b12] px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-white/56 sm:flex-row sm:items-center sm:justify-between">
          <p>(c) 2026 myUnits. Built for prepaid meter users.</p>
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-[#ffcf6a]" />
            <span>Clear recharge, durable records.</span>
          </div>
        </div>
      </footer>

      <style>{`
        .glass,
        .receipt-chip,
        .desk-photo,
        .desk-panel,
        .desk-cell,
        .usage-row,
        .record-slip {
          border-radius: 8px;
        }

        .stage-hero {
          background: #010102;
        }

        .stage-meter {
          opacity: 0;
          filter: saturate(0.86) contrast(1.1);
          animation: photoReveal 4200ms ease-out 5900ms both;
        }

        .stage-blackout {
          background: rgba(0, 0, 0, 1);
          animation: blackoutFade 4400ms cubic-bezier(.2,.8,.2,1) 5700ms both;
        }

        .stage-light {
          background:
            radial-gradient(ellipse at 50% 38%, rgba(255,207,106,0.68), rgba(255,207,106,0.25) 23%, transparent 60%),
            radial-gradient(circle at 82% 70%, rgba(127,225,210,0.2), transparent 24%),
            radial-gradient(circle at 18% 72%, rgba(155,81,57,0.18), transparent 24%),
            linear-gradient(90deg, rgba(1,1,2,0.72), transparent 50%, rgba(1,1,2,0.56));
          opacity: 0;
          animation: roomGlow 3900ms cubic-bezier(.2,.8,.2,1) 6100ms both;
        }

        .stage-texture {
          background-image:
            linear-gradient(rgba(255,207,106,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(127,225,210,0.06) 1px, transparent 1px);
          background-size: 86px 86px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 78%);
          opacity: 0;
          animation: roomGlow 2600ms ease-out 7000ms both;
        }

        .stage-bulb {
          position: relative;
          width: min(31rem, 88vw);
          height: 48rem;
          transform-origin: top center;
          animation: bulbDrop 5700ms cubic-bezier(.16,.72,.18,1) both;
        }

        .stage-wire {
          position: absolute;
          left: 50%;
          top: 0;
          width: 2px;
          height: 20.5rem;
          background: linear-gradient(#050506, #7e7667);
          transform: translateX(-50%);
        }

        .stage-cap {
          position: absolute;
          left: 50%;
          top: 19.85rem;
          display: grid;
          width: 4.8rem;
          height: 2.45rem;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.16);
          background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04));
          box-shadow: 0 18px 50px rgba(0,0,0,0.32);
          transform: translateX(-50%);
          backdrop-filter: blur(12px);
          border-radius: 8px;
        }

        .stage-globe {
          position: absolute;
          left: 50%;
          top: 21.45rem;
          width: 9rem;
          height: 10.5rem;
          transform: translateX(-50%);
        }

        .globe-glass {
          position: absolute;
          inset: 0.45rem 0.75rem 1.35rem;
          border: 1px solid rgba(255,255,255,0.28);
          background:
            radial-gradient(circle at 42% 25%, rgba(255,255,255,0.32), transparent 17%),
            linear-gradient(145deg, rgba(255,255,255,0.13), rgba(255,255,255,0.025));
          box-shadow: inset 0 0 24px rgba(255,255,255,0.08), 0 0 0 rgba(255,207,106,0);
          clip-path: path('M 10 42 C 10 17 27 2 61 2 C 95 2 112 17 112 42 C 112 69 94 79 83 91 C 77 98 77 107 45 107 C 45 97 45 98 39 91 C 27 78 10 69 10 42 Z');
          animation: glassWake 3500ms ease-out 5700ms both;
        }

        .globe-core {
          position: absolute;
          left: 50%;
          top: 4.25rem;
          width: 3rem;
          height: 3rem;
          border-radius: 999px;
          background: #ffcf6a;
          filter: blur(13px);
          opacity: 0;
          transform: translateX(-50%);
          animation: coreWake 3650ms cubic-bezier(.2,.8,.2,1) 5950ms both;
        }

        .globe-filament {
          position: absolute;
          left: 50%;
          top: 4.85rem;
          width: 3.35rem;
          height: 1.45rem;
          border: 3px solid #ffcf6a;
          border-top: 0;
          opacity: 0;
          transform: translateX(-50%);
          filter: drop-shadow(0 0 14px rgba(255,207,106,0.72));
          border-radius: 0 0 999px 999px;
          animation: filamentWake 3550ms ease-out 6050ms both;
        }

        .stage-beam {
          position: absolute;
          left: 50%;
          top: 26.2rem;
          width: min(56rem, 106vw);
          height: 43rem;
          background: radial-gradient(ellipse at top, rgba(255,207,106,0.34), rgba(255,207,106,0.13) 28%, transparent 68%);
          filter: blur(24px);
          opacity: 0;
          transform: translateX(-50%) scaleY(0.68);
          animation: beamWake 3800ms ease-out 6250ms both;
        }

        .brand-ghost {
          font-size: min(18vw, 15rem);
          font-weight: 700;
          line-height: 0.8;
          color: rgba(255,255,255,0.04);
          letter-spacing: 0;
        }

        .hero-reveal {
          opacity: 0;
          animation: revealUp 940ms cubic-bezier(.2,.8,.2,1) both;
          animation-delay: 7500ms;
        }

        .hero-reveal-1 {
          animation-delay: 7650ms;
        }

        .hero-reveal-2 {
          animation-delay: 7800ms;
        }

        .hero-reveal-3 {
          animation-delay: 7950ms;
        }

        .hero-reveal-4 {
          animation-delay: 8100ms;
        }

        .glass {
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
        }

        .tape-shadow {
          background: linear-gradient(180deg, rgba(0,0,0,0.18), transparent);
        }

        .receipt-track {
          animation: receiptMove 28s linear infinite;
        }

        .receipt-chip {
          display: inline-grid;
          min-width: 17rem;
          grid-template-columns: 1fr;
          border: 1px solid rgba(21,18,15,0.12);
          background: white;
          padding: 1rem;
          box-shadow: 0 16px 40px rgba(21,18,15,0.08);
        }

        .receipt-chip span {
          font-size: 0.75rem;
          color: #74695e;
          text-transform: uppercase;
        }

        .receipt-chip strong {
          margin-top: 0.35rem;
          font-size: 1.35rem;
        }

        .receipt-chip em {
          margin-top: 0.2rem;
          color: #137e71;
          font-style: normal;
        }

        .desk-grid {
          background-image:
            linear-gradient(rgba(155,81,57,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(19,126,113,0.08) 1px, transparent 1px);
          background-size: 76px 76px;
          mask-image: linear-gradient(90deg, rgba(0,0,0,0.52), transparent 78%);
        }

        .desk-surface {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(20rem, 1.05fr);
          gap: 1.25rem;
          align-items: stretch;
        }

        .desk-photo {
          position: relative;
          min-height: 38rem;
          overflow: hidden;
          border: 1px solid rgba(21,18,15,0.12);
          background: rgba(255,255,255,0.58);
          box-shadow: 0 28px 90px rgba(21,18,15,0.12);
          transform: rotate(-1.2deg);
        }

        .desk-console {
          display: grid;
          gap: 1rem;
          align-content: center;
          transform: rotate(1deg);
        }

        .desk-panel {
          border: 1px solid rgba(21,18,15,0.11);
          background: rgba(255,255,255,0.7);
          box-shadow: 0 24px 80px rgba(21,18,15,0.09);
          padding: 1.35rem;
          backdrop-filter: blur(18px);
        }

        .token-panel {
          margin-left: clamp(0rem, 8vw, 5rem);
        }

        .desk-cell {
          background: #ede2d0;
          padding: 1rem;
        }

        .appliance-dial {
          display: grid;
          min-height: 28rem;
          place-items: center;
        }

        .dial-ring {
          display: grid;
          width: min(26rem, 82vw);
          aspect-ratio: 1;
          place-items: center;
          border-radius: 999px;
          background:
            conic-gradient(from 210deg, #ffcf6a 0 62%, rgba(255,255,255,0.1) 62% 100%),
            radial-gradient(circle, rgba(127,225,210,0.16), transparent 62%);
          box-shadow: 0 28px 100px rgba(0,0,0,0.34);
        }

        .dial-core {
          display: grid;
          width: 68%;
          aspect-ratio: 1;
          place-items: center;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.08);
          text-align: center;
          backdrop-filter: blur(18px);
        }

        .usage-row {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.07);
          padding: 1rem;
          backdrop-filter: blur(18px);
        }

        .record-line {
          position: relative;
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .record-line::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 1.15rem;
          height: 1px;
          background: rgba(21,18,15,0.16);
        }

        .record-slip {
          position: relative;
          min-height: 19rem;
          border: 1px solid rgba(21,18,15,0.12);
          background: rgba(255,255,255,0.74);
          padding: 1.25rem;
          box-shadow: 0 24px 80px rgba(21,18,15,0.08);
          backdrop-filter: blur(18px);
        }

        .record-slip:nth-child(2) {
          margin-top: 3rem;
        }

        .record-slip:nth-child(3) {
          margin-top: 1.5rem;
        }

        .pin {
          position: absolute;
          left: 1.3rem;
          top: -0.35rem;
          width: 0.7rem;
          height: 0.7rem;
          border-radius: 999px;
          background: #9b5139;
          box-shadow: 0 0 0 0.35rem rgba(155,81,57,0.12);
        }

        .cta-lines {
          background-image:
            linear-gradient(rgba(21,18,15,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(21,18,15,0.12) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: linear-gradient(90deg, rgba(0,0,0,0.56), transparent 72%);
        }

        @keyframes bulbDrop {
          0% {
            transform: translateY(-36rem) rotate(-11deg);
          }
          52% {
            transform: translateY(12vh) rotate(7deg);
          }
          72% {
            transform: translateY(9vh) rotate(-3deg);
          }
          100% {
            transform: translateY(11vh) rotate(0deg);
          }
        }

        @keyframes blackoutFade {
          0%,
          18% {
            opacity: 1;
          }
          44% {
            opacity: 0.93;
          }
          66% {
            opacity: 0.68;
          }
          100% {
            opacity: 0.3;
          }
        }

        @keyframes roomGlow {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes photoReveal {
          from {
            opacity: 0;
            transform: scale(1.035);
          }
          to {
            opacity: 0.38;
            transform: scale(1);
          }
        }

        @keyframes glassWake {
          from {
            box-shadow: inset 0 0 24px rgba(255,255,255,0.08), 0 0 0 rgba(255,207,106,0);
          }
          to {
            box-shadow: inset 0 0 28px rgba(255,255,255,0.12), 0 0 42px rgba(255,207,106,0.34);
          }
        }

        @keyframes coreWake {
          0% {
            opacity: 0;
          }
          38% {
            opacity: 0.2;
          }
          56% {
            opacity: 0.08;
          }
          100% {
            opacity: 0.78;
          }
        }

        @keyframes filamentWake {
          0%,
          40% {
            opacity: 0;
          }
          54% {
            opacity: 0.2;
          }
          64% {
            opacity: 0.08;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes beamWake {
          from {
            opacity: 0;
            transform: translateX(-50%) scaleY(0.68);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scaleY(1);
          }
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translate3d(0, 18px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes receiptMove {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 1024px) {
          .desk-surface,
          .record-line {
            grid-template-columns: 1fr;
          }

          .desk-photo,
          .desk-console,
          .token-panel {
            transform: none;
            margin-left: 0;
          }

          .desk-photo {
            min-height: 29rem;
          }

          .record-line::before {
            display: none;
          }

          .record-slip,
          .record-slip:nth-child(2),
          .record-slip:nth-child(3) {
            margin-top: 0;
          }
        }

        @media (max-width: 640px) {
          .stage-bulb {
            width: min(24rem, 90vw);
          }

          .stage-wire {
            height: 16.8rem;
          }

          .stage-cap {
            top: 16.15rem;
          }

          .stage-globe {
            top: 17.75rem;
          }

          .stage-beam {
            top: 22.4rem;
          }

          .desk-photo {
            min-height: 23rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stage-meter,
          .stage-blackout,
          .stage-light,
          .stage-texture,
          .stage-bulb,
          .globe-glass,
          .globe-core,
          .globe-filament,
          .stage-beam,
          .hero-reveal,
          .receipt-track {
            animation: none !important;
          }

          .stage-meter {
            opacity: 0.38;
          }

          .stage-blackout {
            opacity: 0.3;
          }

          .stage-light,
          .stage-texture,
          .globe-core,
          .globe-filament,
          .stage-beam,
          .hero-reveal {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function CircleGaugeIcon() {
  return (
    <div className="relative grid size-20 place-items-center rounded-full border border-white/18">
      <div className="absolute inset-3 rounded-full border border-[#ffcf6a]/50" />
      <div className="h-8 w-1 origin-bottom rotate-45 bg-[#ffcf6a]" />
    </div>
  );
}
