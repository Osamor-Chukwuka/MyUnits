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
    <div className="bg-background min-h-screen">

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="gap-6 grid md:grid-cols-2 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 border border-border">
            <p className="mb-2 text-muted-foreground text-sm">Total Amount Recharged</p>
            <p className="font-bold text-foreground text-4xl">₦{totalRecharged.toLocaleString()}</p>
            <p className="mt-2 text-muted-foreground text-sm">{totalRecharges} recharges total</p>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 border border-border">
            <p className="mb-2 text-muted-foreground text-sm">Active Meters</p>
            <p className="font-bold text-foreground text-4xl">{meters.length}</p>
            <p className="mt-2 text-muted-foreground text-sm">Meters registered</p>
          </Card>
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-bold text-foreground text-2xl">Your Meters</h2>
            <p className="mt-1 text-muted-foreground text-sm">Manage and recharge your prepaid meters</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Meter
          </Button>
        </div>

        {/* Meters List */}
        {meters.length === 0 ? (
          <Card className="p-12 border border-border border-dashed text-center">
            <Zap className="opacity-50 mx-auto mb-4 w-12 h-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-foreground text-lg">No Meters Yet</h3>
            <p className="mb-6 text-muted-foreground">Add your first meter to get started</p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Meter
            </Button>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-4">
            {meters.map((meter) => (
              <Card key={meter.id} className="flex-1 p-6 border border-border hover:border-primary/30 min-w-80 transition-colors">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex justify-center items-center bg-primary/10 rounded-lg w-10 h-10">
                      <Power className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg truncate">{meter.name}</h3>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 mb-6">
                    <div className="flex justify-between items-center py-2 border-border border-b">
                      <span className="text-muted-foreground text-sm">Last Token</span>
                      <span className="font-semibold text-foreground text-sm">ID: 1234...7890</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-border border-b">
                      <span className="text-muted-foreground text-sm">Token</span>
                      <span className="font-semibold text-foreground text-sm">₦{meter.totalRecharged.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground text-sm">Last Recharge</span>
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
                    <Button variant="outline" size="sm" className="bg-transparent text-destructive hover:text-destructive">
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
