'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { X, Zap } from 'lucide-react';

interface RechargeModalShellProps {
  onClose: () => void;
  children: ReactNode;
}

export default function RechargeModalShell({ onClose, children }: RechargeModalShellProps) {
  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4">
      <Card className="bg-card border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-border border-b">
          <h2 className="flex items-center gap-2 font-bold text-foreground text-2xl">
            <Zap className="w-6 h-6 text-primary" />
            Recharge Meter
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-secondary p-1 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-5 p-6">{children}</div>
      </Card>
    </div>
  );
}