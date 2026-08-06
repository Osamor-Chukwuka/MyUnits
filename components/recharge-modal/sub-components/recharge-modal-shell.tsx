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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#102A2A]/55 p-4 backdrop-blur-sm sm:items-center">
      <Card className="no-scrollbar my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto border-white/45 bg-[#fff9ef]/92 shadow-[0_30px_100px_rgba(16,42,42,0.28)]">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="flex items-center gap-2 font-bold text-foreground text-2xl">
            <Zap className="w-6 h-6 text-primary" />
            Pay or top up
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 transition-colors hover:bg-secondary"
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
