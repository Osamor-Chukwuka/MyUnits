'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col justify-center items-center gap-4 min-h-[50vh]">
      <p className="text-destructive text-lg">Error: {error.message}</p>
      <button
        onClick={reset}
        className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
