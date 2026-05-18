'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { MeterTotalFees } from '@/types/meter-types';

export interface RechargeConfirmationTarget {
  name?: string;
  meterNumber: string;
  disco: string;
  meterType: string;
  customerName?: string;
}

interface RechargeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRechargeComplete?: () => void;
  rechargeTarget: RechargeConfirmationTarget | null;
  meterTotalFees?: MeterTotalFees | null;
}

export default function RechargeConfirmationModal(props: RechargeConfirmationModalProps) {
  const { isOpen, onClose, onRechargeComplete, rechargeTarget, meterTotalFees } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setIsSubmitting(false);
    setErrorMessage('');
  }, [isOpen]);


  const handleConfirmRecharge = async () => {
    if (!rechargeTarget) {
      setErrorMessage('Meter details are missing. Please start again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      //call paystack
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onClose();
      onRechargeComplete?.();
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Recharge failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  //call paystack
  const callPaystack = async () => {
    
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Confirm Recharge</DialogTitle>
          <DialogDescription>
            Review the recharge details before we continue.
          </DialogDescription>
        </DialogHeader>

        {rechargeTarget && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Total Amount</p>
              <p className="mt-1 font-bold text-foreground text-3xl">₦{meterTotalFees?.totalAmount.toLocaleString()}</p>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
              {rechargeTarget.name && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Meter Name</span>
                  <span className="font-semibold text-foreground text-sm">{rechargeTarget.name}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Meter Number</span>
                <span className="font-semibold text-foreground text-sm">{rechargeTarget.meterNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Distribution Company</span>
                <span className="font-semibold text-foreground text-sm">{rechargeTarget.disco}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Meter Type</span>
                <span className="font-semibold text-foreground text-sm capitalize">{rechargeTarget.meterType}</span>
              </div>
              {rechargeTarget.customerName && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Customer Name</span>
                  <span className="font-semibold text-foreground text-sm">{rechargeTarget.customerName}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Selected Amount</span>
                <span className="font-semibold text-foreground text-sm">₦{meterTotalFees?.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Service Fee</span>
                <span className="font-semibold text-foreground text-sm">₦{meterTotalFees?.paystackFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-border border-t">
                <span className="font-semibold text-foreground text-sm">Total Amount</span>
                <span className="font-bold text-foreground text-lg">₦{meterTotalFees?.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {isSubmitting && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-muted-foreground text-sm">
                <Spinner className="size-4" />
                Processing recharge request...
              </div>
            )}

            {errorMessage && (
              <p className="text-destructive text-sm text-center">{errorMessage}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1 h-11 text-base">
            Cancel
          </Button>
          <Button onClick={handleConfirmRecharge} disabled={isSubmitting || !rechargeTarget} className="flex-1 h-11 text-base">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                Recharging...
              </span>
            ) : (
              'Recharge'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
