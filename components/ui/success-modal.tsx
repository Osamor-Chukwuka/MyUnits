'use client';

import { X } from 'lucide-react';
import { Button } from './button';

type SuccessModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function SuccessModal({ open, onClose }: SuccessModalProps) {
    if (!open) return null;

    const handleOk = () => {
        window.location.reload(); // simple page refresh
    };

    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Modal */}
            <div className="relative bg-white shadow-xl p-6 rounded-2xl w-[90%] max-w-md">
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
                        Almost there
                    </h2>

                    <p className="mt-2 text-gray-600 text-sm">
                        Check your email to complete the signup process.
                    </p>

                    <Button
                        onClick={handleOk}
                        className="bg-green-700 hover:bg-green-800 mt-6 px-4 py-2.5 rounded-lg w-full font-semibold text-white text-sm transition-colors"
                    >
                        Okay
                    </Button>
                </div>
            </div>
        </div>
    );
}
