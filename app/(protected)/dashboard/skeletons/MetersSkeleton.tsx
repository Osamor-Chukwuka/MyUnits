'use client';

import React from 'react';

export default function MetersSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex p-6 border border-border min-w-9/28 transition-colors animate-pulse">
          <div className="flex flex-col w-full h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-muted rounded-lg w-10 h-10" />
              <div className="flex-1 min-w-0">
                <div className="bg-muted rounded w-3/4 h-4" />
              </div>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-border border-b">
                <div className="bg-muted rounded w-1/3 h-3" />
                <div className="bg-muted rounded w-1/4 h-3" />
              </div>
              <div className="flex justify-between items-center py-2 border-border border-b">
                <div className="bg-muted rounded w-1/3 h-3" />
                <div className="bg-muted rounded w-1/4 h-3" />
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="bg-muted rounded w-1/3 h-3" />
                <div className="bg-muted rounded w-1/4 h-3" />
              </div>
            </div>

            <div className="flex gap-2 mt-auto">
              <div className="bg-muted rounded w-full h-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
