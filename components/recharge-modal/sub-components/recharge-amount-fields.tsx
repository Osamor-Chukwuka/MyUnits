'use client';

interface RechargeAmountFieldsProps {
  amount: string;
  amountError: string;
  onAmountChange: (value: string) => void;
}

export const AMOUNT_SUGGESTIONS = [1000, 2000, 5000, 10000];
export const MIN_AMOUNT = 1000;

export const getRechargeAmountError = (amount: string): string | null => {
  const numericAmount = Number(amount);

  if (!amount || Number.isNaN(numericAmount)) {
    return 'Please enter an amount';
  }

  if (numericAmount < MIN_AMOUNT) {
    return `Minimum amount is ₦${MIN_AMOUNT.toLocaleString()}`;
  }

  return null;
};

export default function RechargeAmountFields({
  amount,
  amountError,
  onAmountChange,
}: RechargeAmountFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="amount" className="block mb-2 font-semibold text-foreground text-sm">
          Amount (₦)
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder={`Min ₦${MIN_AMOUNT.toLocaleString()}`}
          min={MIN_AMOUNT}
          className={`w-full px-4 py-2 rounded-lg border transition-colors bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${amountError ? 'border-destructive' : 'border-border'}`}
        />
        {amountError && <p className="mt-1 text-destructive text-sm">{amountError}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {AMOUNT_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onAmountChange(String(suggestion))}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
              amount === String(suggestion)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/40 text-foreground'
            }`}
          >
            ₦{suggestion.toLocaleString()}
          </button>
        ))}
      </div>
    </>
  );
}