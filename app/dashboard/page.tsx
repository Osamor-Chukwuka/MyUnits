'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Plus, Power, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

interface Meter {
  id: string;
  name: string;
  meterNumber: string;
  disco: string;
  totalRecharged: number;
  rechargeCount: number;
}

export default function Dashboard() {
  const [meters, setMeters] = useState<Meter[]>([
    {
      id: '1',
      name: 'Home Meter',
      meterNumber: '123456789',
      disco: 'EKEDC',
      totalRecharged: 50000,
      rechargeCount: 5,
    },
    {
      id: '2',
      name: 'Office Meter',
      meterNumber: '987654321',
      disco: 'IKEDC',
      totalRecharged: 75000,
      rechargeCount: 8,
    },
  ]);

  const totalRecharged = meters.reduce((sum, m) => sum + m.totalRecharged, 0);
  const totalRecharges = meters.reduce((sum, m) => sum + m.rechargeCount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">MeterPay</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/appliance-calculator">
              <Button variant="outline" size="sm">
                Cost Calculator
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border border-border bg-gradient-to-br from-primary/5 to-primary/10">
            <p className="text-muted-foreground text-sm mb-2">Total Amount Recharged</p>
            <p className="text-4xl font-bold text-foreground">₦{totalRecharged.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">{totalRecharges} recharges total</p>
          </Card>

          <Card className="p-6 border border-border bg-gradient-to-br from-accent/5 to-accent/10">
            <p className="text-muted-foreground text-sm mb-2">Active Meters</p>
            <p className="text-4xl font-bold text-foreground">{meters.length}</p>
            <p className="text-sm text-muted-foreground mt-2">Meters registered</p>
          </Card>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Meters</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage and recharge your prepaid meters</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Meter
          </Button>
        </div>

        {/* Meters List */}
        {meters.length === 0 ? (
          <Card className="p-12 border border-border border-dashed text-center">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Meters Yet</h3>
            <p className="text-muted-foreground mb-6">Add your first meter to get started</p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Meter
            </Button>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-4">
            {meters.map((meter) => (
              <Card key={meter.id} className="p-6 border border-border hover:border-primary/30 transition-colors flex-1 min-w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Power className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg truncate">{meter.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Last Token</span>
                      <span className="font-semibold text-foreground text-sm">ID: 1234...7890</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Token</span>
                      <span className="font-semibold text-foreground text-sm">₦{meter.totalRecharged.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Last Recharge</span>
                      <span className="font-semibold text-foreground text-sm">Jan 15, 2024</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Link href={`/meter/${meter.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent w-full">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Zap className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
