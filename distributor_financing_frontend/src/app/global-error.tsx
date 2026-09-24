'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6 text-slate-800">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-900">Application Error</h2>
          <p className="text-xs text-slate-500">
            An unexpected error occurred. Please try reloading the page.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#1F4DA8] hover:bg-[#3A6FD8] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
