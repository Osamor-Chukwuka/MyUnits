'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, ChevronLeft, Calendar, Zap as ZapIcon } from 'lucide-react';
import { useState } from 'react';

interface Recharge {
  id: string;
  date: string;
  amount: number;
  units: number;
  token: string;
}

export default function MeterDetailPage({ params }: { params: { id: string } }) {
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Mock data
  const meterData = {
    id: params.id,
    name: 'Home Meter',
    meterNumber: '123456789',
    disco: 'EKEDC',
    totalRecharged: 50000,
    rechargeCount: 5,
  };

  const recharges: Recharge[] = [
    {
      id: '1',
      date: '2024-01-15',
      amount: 5000,
      units: 50,
      token: '1234567890',
    },
    {
      id: '2',
      date: '2024-01-08',
      amount: 10000,
      units: 100,
      token: '9876543210',
    },
    {
      id: '3',
      date: '2024-01-01',
      amount: 8000,
      units: 80,
      token: '5555555555',
    },
    {
      id: '4',
      date: '2023-12-25',
      amount: 15000,
      units: 150,
      token: '1111111111',
    },
    {
      id: '5',
      date: '2023-12-18',
      amount: 12000,
      units: 120,
      token: '2222222222',
    },
  ];

  const months = [
    { value: 'all', label: 'All Time' },
    { value: 'january', label: 'January 2024' },
    { value: 'december', label: 'December 2023' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{meterData.name}</h1>
            <p className="text-sm text-muted-foreground">Meter #{meterData.meterNumber}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats at Top */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border border-border bg-gradient-to-br from-primary/5 to-primary/10">
            <p className="text-muted-foreground text-sm mb-2">Total Recharged</p>
            <p className="text-3xl font-bold text-foreground">₦{meterData.totalRecharged.toLocaleString()}</p>
          </Card>

          <Card className="p-6 border border-border bg-gradient-to-br from-accent/5 to-accent/10">
            <p className="text-muted-foreground text-sm mb-2">Total Recharges</p>
            <p className="text-3xl font-bold text-foreground">{meterData.rechargeCount}</p>
          </Card>

          <Card className="p-6 border border-border">
            <p className="text-muted-foreground text-sm mb-2">Distribution Company</p>
            <p className="text-2xl font-bold text-foreground">{meterData.disco}</p>
          </Card>
        </div>

        {/* Monthly & Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Monthly Analytics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">January 2024</span>
                <span className="font-semibold text-foreground">₦23,000</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">December 2023</span>
                <span className="font-semibold text-foreground">₦27,000</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Average Recharge</span>
                <span className="font-semibold text-foreground">₦{Math.round(meterData.totalRecharged / meterData.rechargeCount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Last Recharge</span>
                <span className="font-semibold text-foreground">Jan 15, 2024</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recharge History Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Recharge History</h2>
            <p className="text-muted-foreground text-sm mt-1">View all your recharges and tokens</p>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 rounded-md border border-border bg-background text-foreground text-sm"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <Button className="gap-2">
              <Zap className="w-4 h-4" />
              Recharge Meter
            </Button>
          </div>
        </div>

        {/* Recharge History Table at Bottom */}
        <Card className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recharges.map((recharge) => (
                  <tr key={recharge.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(recharge.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      ₦{recharge.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground flex items-center gap-2">
                      <ZapIcon className="w-4 h-4 text-primary" />
                      {recharge.units}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{recharge.token}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm">
                        Copy Token
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
