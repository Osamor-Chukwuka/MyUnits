'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Plus, Power, Trash2, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddMeterModal from '@/components/pages/dashboard/add-meter-modal';
import { TotalsSkeleton, ActiveMetersSkeleton } from './skeletons/TotalsSkeleton';
import MetersSkeleton from './skeletons/MetersSkeleton';
import { deleteMeter, getTotalRecharged, getUserMeters } from '@/app/actions/meter-actions';
import { toast } from 'sonner';
import { MeterInterface } from '@/types/meter-types';

import DeleteMeterModal from '@/components/pages/dashboard/delete-meter-modal';
import RechargeModal from '@/components/recharge-modal/recharge-modal';


export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalRecharged, setTotalRecharged] = useState(0);
  const [totalRecharges, setTotalRecharges] = useState(0);
  const [meters, setMeters] = useState<MeterInterface[]>([]);
  const [meterCount, setMeterCount] = useState(0);
  const [loadingTotals, setLoadingTotals] = useState(true);
  const [loadingMeters, setLoadingMeters] = useState(true);
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<MeterInterface | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Recharge modal state
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeMeter, setRechargeMeter] = useState<MeterInterface | null>(null);

  // handle delete meter
  const handleDelete = async (meter: MeterInterface) => {
    setDeleting(true);
    try {
      await deleteMeter(meter.id);
      toast.success('Meter deleted successfully');
      fetchUserMeters(); //fetch updated meter list after deletion
      setIsDeleteModalOpen(false);
      setSelectedMeter(null);
    } catch (error) {
      toast.error('Failed to delete meter');
      console.error('Error deleting meter:', error);
    } finally {
      setDeleting(false);
    }
  };

  //fetch total recharged amount and count for all meters
  const fetchTotalRecharged = async () => {
    setLoadingTotals(true);
    try {
      const { totalAmount, totalCount } = await getTotalRecharged();
      setTotalRecharged(totalAmount);
      setTotalRecharges(totalCount);
    } catch (error) {
      toast.error('Failed to fetch total recharged amount');
      console.error('Error fetching total recharged amount:', error);
    } finally {
      setLoadingTotals(false);
    }
  };

  //fetch user meters
  const fetchUserMeters = async () => {
    setLoadingMeters(true);
    try {
      //call get meters action here and set the meters state with the result
      const { meters, count } = await getUserMeters();
      setMeters(meters);
      setMeterCount(count);
    } catch (error) {
      toast.error('Failed to fetch meters');
      console.error('Error fetching meters:', error);
    } finally {
      setLoadingMeters(false);
    }
  }

  const handleRefreshMeterList = () => {
    //just call the fetch meter function here to get the updated the list 
    fetchUserMeters();
    //close modal
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchTotalRecharged();
    fetchUserMeters();
  }, []);

  return (
    <div className="bg-background min-h-screen">

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="gap-6 grid md:grid-cols-2 mb-8">
          {loadingTotals ? (
            <TotalsSkeleton />
          ) : (
            <Card className="p-6 border border-border">
              <p className="mb-2 text-muted-foreground text-sm">Total Amount Recharged</p>
              <p className="font-bold text-foreground text-4xl">₦{totalRecharged.toLocaleString()}</p>
              <p className="mt-2 text-muted-foreground text-base">{totalRecharges} recharges total</p>
            </Card>
          )}

          {loadingMeters ? (
            <ActiveMetersSkeleton />
          ) : (
            <Card className="bg-linear-to-br from-accent/5 to-accent/10 p-6 border border-border">
              <p className="mb-2 text-muted-foreground text-sm">Active Meters</p>
              <p className="font-bold text-foreground text-4xl">{meterCount}</p>
              <p className="mt-2 text-muted-foreground text-sm">Meters registered</p>
            </Card>
          )}
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-6 pt-9">
          <div>
            <h2 className="font-bold text-foreground text-2xl">Your Meters</h2>
            <p className="mt-1 text-muted-foreground text-sm">Manage and recharge your prepaid meters</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => { setRechargeMeter(null); setIsRechargeModalOpen(true); }}>
              <Zap className="w-4 h-4" />
              Recharge Now
            </Button>
            <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Meter
            </Button>
          </div>
        </div>

        {/* Meters List */}
        {loadingMeters ? (
          <MetersSkeleton />
        ) : meters.length === 0 ? (
          <Card className="p-12 border border-border border-dashed text-center">
            <Zap className="opacity-50 mx-auto mb-4 w-12 h-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-foreground text-lg">No Meters Yet</h3>
            <p className="mb-6 text-muted-foreground">Add your first meter to get started</p>
            <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Your First Meter
            </Button>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-4 w-full">
            {meters.map((meter) => (
              <Card key={meter.id} className="flex p-6 border border-border hover:border-primary/30 min-w-9/28 transition-colors">
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
                      <span className="text-muted-foreground text-sm">Customer Name</span>
                      <span className="font-semibold text-sm">{meter.customer_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-border border-b">
                      <span className="text-muted-foreground text-sm">Meter Number</span>
                      <span className="font-semibold text-sm">{meter.meter_number}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-border border-b">
                      <span className="text-muted-foreground text-sm">Disco</span>
                      <span className="font-semibold text-foreground text-sm">{meter.disco}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground text-sm">Type</span>
                      <span className="font-semibold text-foreground text-sm">{meter.type}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Link href={`/meter/${meter.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent w-full">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => { setRechargeMeter(meter); setIsRechargeModalOpen(true); }}
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-destructive hover:text-destructive"
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

      {/* Add Meter Modal */}
      <AddMeterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} refreshMeterList={handleRefreshMeterList} />

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => { setIsRechargeModalOpen(false); setRechargeMeter(null); }}
        meter={rechargeMeter}
        meters={meters}
      />

      {/* Delete Meter Modal */}
      <DeleteMeterModal
        isOpen={isDeleteModalOpen}
        onClose={() => { if (!deleting) { setIsDeleteModalOpen(false); setSelectedMeter(null); } }}
        onConfirm={() => {
          if (selectedMeter && !deleting) handleDelete(selectedMeter);
        }}
        meterName={selectedMeter?.name}
        loading={deleting}
      />
    </div>
  );
}
