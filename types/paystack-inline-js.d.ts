declare module '@paystack/inline-js' {
  interface ResumeTransactionCallbacks {
    onSuccess?: (transaction: { reference: string }) => void;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
  }

  export interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number;
    ref?: string;
    currency?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (response: { reference: string;[key: string]: unknown }) => void;
    onCancel?: () => void;
    onLoad?: () => void;
    onError?: (error: unknown) => void;
  }

  export default class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void;
    resumeTransaction(
      accessCode: string,
      callbacks?: ResumeTransactionCallbacks
    ): void;
  }
}