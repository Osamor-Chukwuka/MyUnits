'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Eye, Gauge, Plus, Power, Trash2, WalletCards, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { deleteMeter, getTotalRecharged, getUserMeters } from '@/app/actions/meter-actions';
import AddMeterModal from '@/components/pages/dashboard/add-meter-modal';
import DeleteMeterModal from '@/components/pages/dashboard/delete-meter-modal';
import RechargeModal from '@/components/recharge-modal/recharge-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MeterInterface } from '@/types/meter-types';
import { ActiveMetersSkeleton, TotalsSkeleton } from './skeletons/TotalsSkeleton';
import MetersSkeleton from './skeletons/MetersSkeleton';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalRecharged, setTotalRecharged] = useState(0);
  const [totalRecharges, setTotalRecharges] = useState(0);
  const [meters, setMeters] = useState<MeterInterface[]>([]);
  const [meterCount, setMeterCount] = useState(0);
  const [loadingTotals, setLoadingTotals] = useState(true);
  const [loadingMeters, setLoadingMeters] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<MeterInterface | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeMeter, setRechargeMeter] = useState<MeterInterface | null>(null);

  const fetchTotalRecharged = async () => {
    setLoadingTotals(true);
    try {
      const { totalAmount, totalCount } = await getTotalRecharged();
      setTotalRecharged(totalAmount);
      setTotalRecharges(totalCount);
    } catch (error) {
      toast.error('Failed to fetch total paid amount');
      console.error('Error fetching total paid amount:', error);
    } finally {
      setLoadingTotals(false);
    }
  };

  const fetchUserMeters = async () => {
    setLoadingMeters(true);
    try {
      const { meters, count } = await getUserMeters();
      setMeters(meters);
      setMeterCount(count);
    } catch (error) {
      toast.error('Failed to fetch meters');
      console.error('Error fetching meters:', error);
    } finally {
      setLoadingMeters(false);
    }
  };

  const handleDelete = async (meter: MeterInterface) => {
    setDeleting(true);
    try {
      await deleteMeter(meter.id);
      toast.success('Meter deleted successfully');
      fetchUserMeters();
      setIsDeleteModalOpen(false);
      setSelectedMeter(null);
    } catch (error) {
      toast.error('Failed to delete meter');
      console.error('Error deleting meter:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleRefreshMeterList = () => {
    fetchUserMeters();
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchTotalRecharged();
    fetchUserMeters();
  }, []);

  return (
    <div className="min-h-screen">
      <main className="app-container">
        <section className="app-hero-panel mb-8">
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Meter home</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                Manage every meter from one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-primary-foreground/70 sm:text-base">
                Pay or top up, save meter details, and keep useful history close.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="gap-2 border-white/20 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                onClick={() => {
                  setRechargeMeter(null);
                  setIsRechargeModalOpen(true);
                }}
              >
                <Zap className="w-4 h-4" />
                Pay or top up
              </Button>
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-[#f7cb72]" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Meter
              </Button>
            </div>
          </div>
        </section>

        <div className="mb-8 grid gap-5 md:grid-cols-2">
          {loadingTotals ? (
            <TotalsSkeleton />
          ) : (
            <Card className="relative overflow-hidden p-6">
              <div className="absolute right-5 top-5 grid size-12 place-items-center rounded-2xl bg-primary text-accent shadow-lg">
                <WalletCards className="size-5" />
              </div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Total paid</p>
              <p className="text-4xl font-bold text-foreground">NGN {totalRecharged.toLocaleString()}</p>
              <p className="mt-2 text-sm text-muted-foreground">{totalRecharges} payments recorded</p>
            </Card>
          )}

          {loadingMeters ? (
            <ActiveMetersSkeleton />
          ) : (
            <Card className="relative overflow-hidden p-6">
              <div className="absolute right-5 top-5 grid size-12 place-items-center rounded-2xl bg-accent text-primary shadow-lg">
                <Gauge className="size-5" />
              </div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Saved meters</p>
              <p className="text-4xl font-bold text-foreground">{meterCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">Prepaid and postpaid</p>
            </Card>
          )}
        </div>

        <div className="mb-6 flex flex-col justify-between gap-4 pt-4 sm:flex-row sm:items-end">
          <div>
            <p className="app-kicker">Saved places</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Your Meters</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pay, top up, and review each meter.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setRechargeMeter(null);
                setIsRechargeModalOpen(true);
              }}
            >
              <Zap className="w-4 h-4" />
              Pay now
            </Button>
            <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Meter
            </Button>
          </div>
        </div>

        {loadingMeters ? (
          <MetersSkeleton />
        ) : meters.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent/40 text-primary">
              <Zap className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No meters yet</h3>
            <p className="mb-6 text-muted-foreground">Add your first meter to start tracking payments.</p>
            <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Your First Meter
            </Button>
          </Card>
        ) : (
          <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
            {meters.map((meter) => (
              <Card key={meter.id} className="group flex p-6 transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_26px_80px_rgba(16,42,42,0.13)]">
                <div className="flex h-full w-full flex-col">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent shadow-md">
                      <Power className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold text-foreground">{meter.name}</h3>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{meter.type}</p>
                    </div>
                  </div>

                  <div className="mb-6 flex-1 space-y-3">
                    <div className="flex items-center justify-between border-b border-border py-2">
                      <span className="text-sm text-muted-foreground">Customer</span>
                      <span className="text-sm font-semibold">{meter.customer_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border py-2">
                      <span className="text-sm text-muted-foreground">Meter number</span>
                      <span className="text-sm font-semibold">{meter.meter_number}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Saved as</span>
                      <span className="text-sm font-semibold text-foreground">{meter.name}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Link href={`/meter/${meter.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      aria-label={`Pay or top up ${meter.name}`}
                      onClick={() => {
                        setRechargeMeter(meter);
                        setIsRechargeModalOpen(true);
                      }}
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-destructive hover:text-destructive"
                      aria-label={`Delete ${meter.name}`}
                      onClick={() => {
                        setSelectedMeter(meter);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AddMeterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} refreshMeterList={handleRefreshMeterList} />

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => {
          setIsRechargeModalOpen(false);
          setRechargeMeter(null);
        }}
        onRechargeSuccess={async () => {
          await Promise.all([fetchTotalRecharged(), fetchUserMeters()]);
        }}
        meter={rechargeMeter}
        meters={meters}
      />

      <DeleteMeterModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setIsDeleteModalOpen(false);
            setSelectedMeter(null);
          }
        }}
        onConfirm={() => {
          if (selectedMeter && !deleting) handleDelete(selectedMeter);
        }}
        meterName={selectedMeter?.name}
        loading={deleting}
      />
    </div>
  );
}
