'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from './button';

type SuccessModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function SuccessModal({ open, onClose }: SuccessModalProps) {
    if (!open) return null;

    return (
        <div className="no-scrollbar fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Modal */}
            <div className="no-scrollbar relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                {/* Close button */}
                <Button
                    onClick={onClose}
                    variant={'outline'}
                    className="top-4 right-4 absolute text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </Button>

                <div className="flex flex-col items-center text-center">
                    {/* Check Icon */}
                    <div className="flex justify-center items-center bg-green-100 rounded-full w-14 h-14">
                        <svg
                            viewBox="0 0 24 24"
                            className="w-7 h-7 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    </div>

                    <h2 className="mt-4 font-semibold text-gray-900 text-lg">
                        Check your inbox
                    </h2>

                    <p className="mt-2 text-gray-600 text-sm">
                        If this email can be used for a new account, we have sent a verification link.
                        If you already signed up before, try signing in instead.
                    </p>

                    <div className="mt-6 flex w-full flex-col gap-3">
                        <Button
                            onClick={onClose}
                            className="bg-green-700 hover:bg-green-800 px-4 py-2.5 rounded-lg w-full font-semibold text-white text-sm transition-colors"
                        >
                            Okay
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/auth/login">Go to sign in</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
