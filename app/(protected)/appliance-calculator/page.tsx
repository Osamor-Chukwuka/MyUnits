'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Zap, ChevronLeft, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface Appliance {
  name: string;
  presets: { label: string; watts: number }[];
}

const appliances: Record<string, Appliance> = {
  ac: {
    name: 'Air Conditioner',
    presets: [
      { label: '1.0 HP', watts: 746 },
      { label: '1.5 HP', watts: 1119 },
      { label: '2.0 HP', watts: 1492 },
    ],
  },
  fridge: {
    name: 'Refrigerator',
    presets: [
      { label: 'Single Door', watts: 150 },
      { label: 'Double Door', watts: 250 },
      { label: 'Side by Side', watts: 400 },
    ],
  },
  tv: {
    name: 'Television',
    presets: [
      { label: '32"', watts: 70 },
      { label: '43"', watts: 100 },
      { label: '55"', watts: 150 },
    ],
  },
  freezer: {
    name: 'Freezer',
    presets: [
      { label: 'Small', watts: 200 },
      { label: 'Medium', watts: 350 },
      { label: 'Large', watts: 500 },
    ],
  },
  washing: {
    name: 'Washing Machine',
    presets: [
      { label: '6kg', watts: 500 },
      { label: '8kg', watts: 700 },
      { label: '10kg', watts: 900 },
    ],
  },
  microwave: {
    name: 'Microwave Oven',
    presets: [
      { label: '20L', watts: 800 },
      { label: '30L', watts: 1000 },
      { label: '40L', watts: 1200 },
    ],
  },
};

const POWER_RATE_PER_KWH = 68; // Example rate in Naira per kWh

export default function ApplianceCalculatorPage() {
  const [selectedAppliance, setSelectedAppliance] = useState<string>('');
  const [powerRating, setPowerRating] = useState<string>('');
  const [usageHours, setUsageHours] = useState<string>('24');
  const [result, setResult] = useState<{
    perMinute: number;
    perHour: number;
    perDay: number;
    perMonth: number;
    costPerHour: number;
    costPerDay: number;
    costPerMonth: number;
  } | null>(null);

  const calculateCost = () => {
    if (!powerRating || !usageHours) return;

    const watts = Number(powerRating);
    const hours = Number(usageHours);

    // Calculate units (kWh)
    const unitsPerMinute = watts / 60000; // watts to kWh per minute
    const unitsPerHour = watts / 1000; // watts to kWh per hour
    const unitsPerDay = unitsPerHour * hours;
    const unitsPerMonth = unitsPerDay * 30;

    // Calculate costs
    const costPerHour = unitsPerHour * POWER_RATE_PER_KWH;
    const costPerDay = unitsPerDay * POWER_RATE_PER_KWH;
    const costPerMonth = unitsPerMonth * POWER_RATE_PER_KWH;

    setResult({
      perMinute: unitsPerMinute,
      perHour: unitsPerHour,
      perDay: unitsPerDay,
      perMonth: unitsPerMonth,
      costPerHour,
      costPerDay,
      costPerMonth,
    });
  };

  const handlePresetSelect = (watts: number) => {
    setPowerRating(String(watts));
  };

  return (
    <div className="bg-background min-h-screen">

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Calculator Card */}
        <Card className="mb-8 p-8 border border-border">
          <div className="space-y-8">
            {/* Step 1: Select Appliance */}
            <div>
              <h2 className="flex items-center gap-2 mb-4 font-semibold text-foreground text-lg">
                <Lightbulb className="w-5 h-5 text-primary" />
                Step 1: Select Appliance Type
              </h2>
              <div className="gap-3 grid grid-cols-2 md:grid-cols-3">
                {Object.entries(appliances).map(([key, appliance]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedAppliance(key)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedAppliance === key
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-secondary/30'
                    }`}
                  >
                    <p className="font-medium text-foreground text-sm">{appliance.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Power Rating */}
            {selectedAppliance && (
              <div>
                <h2 className="flex items-center gap-2 mb-4 font-semibold text-foreground text-lg">
                  <Zap className="w-5 h-5 text-primary" />
                  Step 2: Power Rating (Watts)
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block font-medium text-foreground text-sm">Common Presets</label>
                    <div className="gap-2 grid grid-cols-2 md:grid-cols-3">
                      {appliances[selectedAppliance].presets.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => handlePresetSelect(preset.watts)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            powerRating === String(preset.watts)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50 text-foreground'
                          }`}
                        >
                          {preset.label}
                          <p className="opacity-70 mt-1 text-xs">{preset.watts}W</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium text-foreground text-sm">Or Enter Custom Value</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter watts"
                        value={powerRating}
                        onChange={(e) => setPowerRating(e.target.value)}
                        className="flex-1"
                      />
                      <span className="flex items-center text-muted-foreground">Watts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Usage Hours */}
            {selectedAppliance && powerRating && (
              <div>
                <h2 className="mb-4 font-semibold text-foreground text-lg">Step 3: Daily Usage Hours</h2>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Enter hours"
                    value={usageHours}
                    onChange={(e) => setUsageHours(e.target.value)}
                    min="0"
                    max="24"
                    className="max-w-xs"
                  />
                  <p className="text-muted-foreground text-sm">How many hours per day is this appliance used?</p>
                </div>
              </div>
            )}

            {/* Calculate Button */}
            {selectedAppliance && powerRating && usageHours && (
              <Button
                onClick={calculateCost}
                size="lg"
                className="gap-2 w-full md:w-auto"
              >
                <Zap className="w-4 h-4" />
                Calculate Cost
              </Button>
            )}
          </div>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <h2 className="font-bold text-foreground text-2xl">Estimation Results</h2>

            {/* Units Usage */}
            <div className="gap-6 grid md:grid-cols-2">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 border border-border">
                <h3 className="flex items-center gap-2 mb-4 font-semibold text-foreground">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Units Usage (kWh)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-border border-b">
                    <span className="text-muted-foreground">Per Minute</span>
                    <span className="font-bold text-foreground">{result.perMinute.toFixed(4)} kWh</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-border border-b">
                    <span className="text-muted-foreground">Per Hour</span>
                    <span className="font-bold text-foreground">{result.perHour.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-border border-b">
                    <span className="text-muted-foreground">Per Day</span>
                    <span className="font-bold text-foreground">{result.perDay.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Per Month (30 days)</span>
                    <span className="font-bold text-foreground">{result.perMonth.toFixed(2)} kWh</span>
                  </div>
                </div>
              </Card>

              {/* Cost Estimation */}
              <Card className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 border border-border">
                <h3 className="flex items-center gap-2 mb-4 font-semibold text-foreground">
                  <Zap className="w-5 h-5 text-accent" />
                  Estimated Cost (@ ₦{POWER_RATE_PER_KWH}/kWh)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-border border-b">
                    <span className="text-muted-foreground">Per Hour</span>
                    <span className="font-bold text-foreground">₦{result.costPerHour.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-border border-b">
                    <span className="text-muted-foreground">Per Day</span>
                    <span className="font-bold text-foreground">₦{result.costPerDay.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-lg">
                    <span className="font-medium text-muted-foreground">Per Month</span>
                    <span className="font-bold text-foreground">₦{result.costPerMonth.toFixed(0)}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Info Card */}
            <Card className="bg-secondary/30 p-6 border border-border">
              <p className="text-muted-foreground text-sm">
                <span className="font-semibold text-foreground">Note:</span> This calculation is based on a standard rate
                of ₦{POWER_RATE_PER_KWH} per kWh. Actual costs may vary depending on your distribution company and
                tariff plan.
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
