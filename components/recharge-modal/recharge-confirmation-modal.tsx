'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
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
// import PaystackPop from '@paystack/inline-js';
import { initializePaystack, rechargeMeterWithVtPass, saveRechargeToDB, saveTransactionToDB, updateTransactionStatus, verifyPaystackPayment } from '@/app/actions/payment-actions';
import RechargeResultModal, { RechargeResultPayload, normalizeRechargeResultStatus } from './recharge-result-modal';
import { VtPassRechargeResult } from '@/lib/helpers/vtpass-recharge-helper';
import { sendMeterTokenEmailAction } from '@/app/actions/email-actions';

type PaystackPopupResult =
  | {
    outcome: 'success';
    reference?: string;
  }
  | {
    outcome: 'cancelled';
  };

export interface RechargeConfirmationTarget {
  id?: string;
  name?: string;
  meterNumber: string;
  disco: string;
  meterType: string;
  customerName?: string;
}

interface RechargeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRechargeComplete?: () => void | Promise<void>;
  rechargeTarget: RechargeConfirmationTarget | null;
  meterTotalFees?: MeterTotalFees | null;
}

export default function RechargeConfirmationModal(props: RechargeConfirmationModalProps) {
  const { isOpen, onClose, onRechargeComplete, rechargeTarget, meterTotalFees } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rechargeResult, setRechargeResult] = useState<RechargeResultPayload | null>(null);

  useEffect(() => {
    setIsSubmitting(false);
    setIsConfirmationVisible(isOpen);
    setErrorMessage('');
    setRechargeResult(null);
  }, [isOpen]);

  const closeConfirmationFlow = () => {
    setIsConfirmationVisible(false);
    onClose();
  };

  const openRechargeResult = (result: RechargeResultPayload) => {
    setIsConfirmationVisible(false);
    setRechargeResult({
      status: result.status ?? 'failed',
      meterToken: result.meterToken ?? null,
      message: result.message ?? null,
    });
  };

  const handleResultClose = async () => {
    const normalizedStatus = normalizeRechargeResultStatus(rechargeResult?.status);
    setRechargeResult(null);

    if (normalizedStatus === 'success') {
      if (onRechargeComplete) {
        await onRechargeComplete();
        return;
      }

      onClose();
      return;
    }

    onClose();
  };

  const handleConfirmRecharge = async () => {
    if (!rechargeTarget) {
      setErrorMessage('Meter details are missing. Please start again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const rechargeFlowResult = await callPaystack();
      openRechargeResult(rechargeFlowResult);
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Recharge failed. Please try again.';
      openRechargeResult({
        status: 'failed',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaystackPopup = async (accessCode: string): Promise<PaystackPopupResult> => {
    if (typeof window === 'undefined') {
      throw new Error('Payment can only be started in the browser.');
    }



    const { default: PaystackPop } = await import('@paystack/inline-js');

    return new Promise<PaystackPopupResult>((resolve, reject) => {
      const popup = new PaystackPop();

      popup.resumeTransaction(accessCode, {
        onSuccess: (transaction) => {
          resolve({
            outcome: 'success',
            reference: transaction.reference,
          });
        },
        onCancel: () => {
          resolve({ outcome: 'cancelled' });
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  //call paystack and recharge meter with VT pass
  const callPaystack = async (): Promise<RechargeResultPayload> => {
    try {
      //step 1: initialize paystack and get access code
      const { access_code, reference } = await initializePaystack(meterTotalFees?.totalAmount || 0);
      if (!access_code || !reference) {
        throw new Error('Failed to initialize payment. Please try again.');
      }

      flushSync(() => {
        setIsConfirmationVisible(false);
      });

      //step 2: wait for the Paystack popup to complete before verifying
      const popupResult = await openPaystackPopup(access_code);

      if (popupResult.outcome === 'cancelled') {
        return {
          status: 'failed',
          message: 'Payment was cancelled.',
        };
      }

      //step 3: verify payment after the popup reports success
      setRechargeResult({
        status: 'processing',
        message: 'Please wait while we complete your recharge.',
      });

      const paymentReference = popupResult.reference || reference;
      const paymentVerificationResult = await verifyPaystackPayment(paymentReference);
      const paymentStatus = paymentVerificationResult.status.toLowerCase();

      if (paymentStatus === 'success') {

        //save transaction to DB
        const transactionId = await saveTransactionToDB({
          reference: paymentReference,
          rechargeTarget,
          meterTotalFees: meterTotalFees || null,
          paymentStatus,
        });
        //payment successful, call VT pass to recharge meter
        const rechargeResult = await rechargeMeter(transactionId);
        //return recharge result to be shown in the UI
        return rechargeResult;
      }

      return {
        status: paymentVerificationResult.status,
        message: paymentVerificationResult.message || 'Payment was not successful.',
      };

    } catch (error) {
      console.log('Paystack step error: ', error);
      throw error;
    }
  };

  //recharge meter with VT pass
  const rechargeMeter = async (transactionId: string | null): Promise<RechargeResultPayload> => {
    let rechargeResult: VtPassRechargeResult | null = null;
    const amount = meterTotalFees?.amount;

    if (!rechargeTarget?.disco || !rechargeTarget.meterNumber || !rechargeTarget.meterType || amount == null) {
      return {
        status: 'failed',
        message: 'Please check the meter details and amount, then try again.',
      };
    }

    try {
      //recharge meter logic goes here
      rechargeResult = await rechargeMeterWithVtPass(rechargeTarget.disco, rechargeTarget.meterNumber, rechargeTarget.meterType, amount);

      await updateTransactionStatus(transactionId, rechargeResult.status, rechargeResult.requestId);
    } catch (error) {
      console.error('VTpass Recharge error: ', error);

      // update VTpass transaction status in DB to failed
      await updateTransactionStatus(transactionId, 'failed', rechargeResult?.requestId || null);

      return {
        status: 'failed',
        message: `Recharge could not be completed. Please try again. Error: ${(error as Error).message}`,
      };
    }




    // handle recharge result
    if (!rechargeResult) {
      return {
        status: 'failed',
        message: 'Recharge could not be completed. Please try again.',
      };
    }

    if (rechargeResult.status === 'requery_required') {
      return {
        status: 'requery_required',
        message: 'We could not confirm this recharge yet. Please check your payment history and tap Get token again shortly.',
      };
    }

    if (rechargeResult.status !== 'success') {
      return {
        status: rechargeResult.status,
        message: rechargeResult.message || 'Recharge could not be completed. Please try again.',
      };
    }

    // save recharge result without blocking the user if persistence keeps failing
    await saveRechargeToDB({
      transactionId,
      rechargeTarget,
      rechargeResult,
      amount,
    });

    // Send the email as a nice-to-have only. The recharge already succeeded, so
    // email delivery should never turn a successful recharge into a failed one.
    const emailSent = await sendTokenEmail({
      transactionId,
      rechargeResult,
      amount,
    });

    //return recharge result
    return {
      status: 'success',
      message: emailSent
        ? 'Recharge successful. Your meter token has been sent to your registered email.'
        : 'Recharge successful. Your token is ready below.',
      meterToken: rechargeResult?.token || null,
    };
  };

  async function sendTokenEmail({
    transactionId,
    rechargeResult,
    amount,
  }: {
    transactionId: string | null;
    rechargeResult: VtPassRechargeResult;
    amount: number;
  }) {
    try {
      const emailResult = await sendMeterTokenEmailAction({
        meterName: rechargeTarget?.name,
        meterNumber: rechargeTarget?.meterNumber ?? '',
        token: rechargeResult.token ?? '',
        units: rechargeResult.units ?? '',
        amount,
        charges: meterTotalFees?.totalCharges,
        transactionDate: new Date(),
        idempotencyKey: getTokenEmailIdempotencyKey(transactionId, rechargeResult.requestId),
      });

      if (!emailResult.ok) {
        console.error('Meter token email was not sent.', {
          transactionId,
          requestId: rechargeResult.requestId,
          message: emailResult.message,
        });
      }

      return emailResult.ok;
    } catch (error) {
      console.error('Meter token email failed after recharge success.', {
        transactionId,
        requestId: rechargeResult.requestId,
        error,
      });

      return false;
    }
  }

  function getTokenEmailIdempotencyKey(transactionId: string | null, requestId?: string) {
    if (transactionId) return `meter-token-${transactionId}`;
    if (requestId) return `meter-token-${requestId}`;

    return undefined;
  }

  return (
    <>
      <Dialog open={isConfirmationVisible} onOpenChange={(open) => !open && !isSubmitting && closeConfirmationFlow()}>
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
                  <span className="text-muted-foreground text-sm">Service area</span>
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
                  Almost ready...
                </div>
              )}

              {errorMessage && (
                <p className="text-destructive text-sm text-center">{errorMessage}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmationFlow} disabled={isSubmitting} className="flex-1 h-11 text-base">
              Cancel
            </Button>
            <Button onClick={handleConfirmRecharge} disabled={isSubmitting || !rechargeTarget} className="flex-1 h-11 text-base">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Almost ready...
                </span>
              ) : (
                'Recharge'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RechargeResultModal
        isOpen={!!rechargeResult}
        onClose={handleResultClose}
        status={rechargeResult?.status}
        meterToken={rechargeResult?.meterToken}
        message={rechargeResult?.message}
      />
    </>
  );
}
