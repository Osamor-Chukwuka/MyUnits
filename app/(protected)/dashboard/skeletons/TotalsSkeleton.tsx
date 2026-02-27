'use client';

import React from 'react';

export function TotalsSkeleton() {
  return (
    <div className="p-6 border border-border animate-pulse">
      <div className="bg-muted mb-4 rounded w-1/3 h-4" />
      <div className="bg-muted mb-3 rounded w-2/3 h-10" />
      <div className="bg-muted rounded w-1/4 h-3" />
    </div>
  );
}

export function ActiveMetersSkeleton() {
  return (
    <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 border border-border animate-pulse">
      <div className="bg-muted mb-4 rounded w-1/4 h-4" />
      <div className="bg-muted mb-3 rounded w-1/3 h-10" />
      <div className="bg-muted rounded w-1/5 h-3" />
    </div>
  );
}
