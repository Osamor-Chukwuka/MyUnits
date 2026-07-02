'use client';

import { CheckCircle2, RefreshCcw, XCircle } from 'lucide-react';
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

export type RechargeResultStatus = 'success' | 'processing' | 'reversed' | 'failed' | 'requery_required';

export interface RechargeResultPayload {
  status?: string | null;
  meterToken?: string | null;
  message?: string | null;
}

interface RechargeResultModalProps extends RechargeResultPayload {
  isOpen: boolean;
  onClose: () => void;
  isDismissible?: boolean;
}

export function normalizeRechargeResultStatus(status?: string | null): RechargeResultStatus {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === 'success') {
    return 'success';
  }

  if (normalizedStatus === 'reversed') {
    return 'reversed';
  }

  if (normalizedStatus === 'requery_required') {
    return 'requery_required';
  }

  if (normalizedStatus === 'ongoing' || normalizedStatus === 'pending' || normalizedStatus === 'processing') {
    return 'processing';
  }

  return 'failed';
}

export default function RechargeResultModal({
  isOpen,
  onClose,
  status,
  meterToken,
  message,
  isDismissible,
}: RechargeResultModalProps) {
  const normalizedStatus = normalizeRechargeResultStatus(status);
  const canDismiss = isDismissible ?? normalizedStatus !== 'processing';

  const title =
    normalizedStatus === 'success'
      ? 'Recharge Successful'
      : normalizedStatus === 'processing'
        ? 'Recharge Processing'
        : normalizedStatus === 'requery_required'
          ? 'Recharge Needs Requery'
        : normalizedStatus === 'reversed'
          ? 'Payment Reversed'
          : 'Recharge Failed';

  const description =
    message ??
    (normalizedStatus === 'success'
      ? 'Your recharge was successful. Your meter token has also been sent to your registered email.'
      : normalizedStatus === 'processing'
        ? 'Your recharge is still being processed. Please check back shortly for the final status.'
        : normalizedStatus === 'requery_required'
          ? 'We could not confirm this recharge yet. Please go to Recharge History and click the Requery button to check the final status.'
        : normalizedStatus === 'reversed'
          ? 'The payment failed and your money has been reversed to your account.'
          : 'We could not complete this recharge. Please try again.');

  const iconWrapperClassName =
    normalizedStatus === 'success'
      ? 'bg-emerald-500/12 text-emerald-600'
      : normalizedStatus === 'processing'
        ? 'bg-amber-500/12 text-amber-600'
        : normalizedStatus === 'requery_required'
          ? 'bg-sky-500/12 text-sky-600'
        : normalizedStatus === 'reversed'
          ? 'bg-orange-500/12 text-orange-600'
          : 'bg-destructive/12 text-destructive';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && canDismiss && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={canDismiss}>
        <DialogHeader className="items-center text-center sm:items-center sm:text-center">
          <div className={`flex size-16 items-center justify-center rounded-full ${iconWrapperClassName}`}>
            {normalizedStatus === 'success' ? (
              <CheckCircle2 className="size-8" />
            ) : normalizedStatus === 'processing' ? (
              <Spinner className="size-8" />
            ) : normalizedStatus === 'requery_required' ? (
              <RefreshCcw className="size-8" />
            ) : normalizedStatus === 'reversed' ? (
              <RefreshCcw className="size-8" />
            ) : (
              <XCircle className="size-8" />
            )}
          </div>
          <DialogTitle className="mt-2">{title}</DialogTitle>
          <DialogDescription className="max-w-sm text-center">{description}</DialogDescription>
        </DialogHeader>

        {normalizedStatus === 'success' && meterToken && (
          <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Meter Token</p>
            <p className="break-all font-semibold text-foreground text-lg leading-relaxed">{meterToken}</p>
          </div>
        )}

        {canDismiss && (
          <DialogFooter>
            <Button onClick={onClose} className="w-full">
              {normalizedStatus === 'success' ? 'Done' : 'Close'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
