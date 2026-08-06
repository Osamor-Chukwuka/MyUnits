import ApplianceCalculatorClient from '@/components/pages/appliance-calculator/appliance-calculator-client';

export default function ApplianceCalculatorPage() {
  return (
    <div className="min-h-screen">
      <main className="app-container max-w-6xl">
        <section className="app-hero-panel mb-8">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Appliance units</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                See how many units an appliance may use.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-primary-foreground/70 sm:text-base">
                Enter the wattage and how long you use it. If you do not know the wattage, we can help estimate it first.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm text-primary-foreground/60">Simple formula</p>
              <p className="mt-2 font-mono text-2xl font-bold text-accent">Watts / 1000</p>
              <p className="mt-2 text-sm leading-5 text-primary-foreground/65">
                1 electricity unit is 1 kWh, so a 1,500W iron uses about 1.5 units per hour.
              </p>
            </div>
          </div>
        </section>

        <ApplianceCalculatorClient />
      </main>
    </div>
  );
}
