"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, ScanLine, AlertCircle } from "lucide-react";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScanningRef = useRef(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startScanner = async () => {
            setError(null);
            // Ensure any previous instance is cleaned up
            if (scannerRef.current) {
                try {
                    await scannerRef.current.clear();
                } catch (e) { /* ignore */ }
            }

            try {
                const html5QrcodeScanner = new Html5Qrcode("reader");
                scannerRef.current = html5QrcodeScanner;

                const config = { fps: 10, qrbox: { width: 250, height: 250 } };

                await html5QrcodeScanner.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        handleStopAndSuccess(decodedText);
                    },
                    (errorMessage) => {
                        // console.log(errorMessage);
                    }
                );
                isScanningRef.current = true;
            } catch (err: any) {
                console.error("Error starting scanner", err);
                let message = "Failed to access camera.";
                if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
                    message = "Camera permission denied. Please enable camera access in your browser settings.";
                } else if (err?.name === "NotFoundError") {
                    message = "No camera found on this device.";
                } else if (err?.name === "NotReadableError") {
                    message = "Camera is currently in use by another application.";
                }
                setError(message);
            }
        };

        const handleStopAndSuccess = async (text: string) => {
            if (scannerRef.current && isScanningRef.current) {
                try {
                    await scannerRef.current.stop();
                    scannerRef.current.clear();
                    isScanningRef.current = false;
                } catch (e) { console.error(e); }
            }
            onScanSuccess(text);
        };

        // Delay start slightly to ensure DOM is ready
        const timer = setTimeout(startScanner, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current && isScanningRef.current) {
                scannerRef.current.stop()
                    .then(() => {
                        scannerRef.current?.clear();
                        isScanningRef.current = false;
                    })
                    .catch(console.error);
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-transparent relative">
                {/* Header */}
                <div className="absolute top-0 inset-x-0 z-10 flex justify-between items-center p-4">
                    <div className="flex items-center gap-2 text-white/80">
                        <ScanLine className="animate-pulse" />
                        <span className="font-mono text-sm tracking-widest uppercase">Scanning...</span>
                    </div>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Scanner Viewport */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10 aspect-[4/5] bg-black">
                    {!error && (
                        <div id="reader" className="w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>
                    )}

                    {/* Error Overlay */}
                    {error && (
                        <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Camera Error</h3>
                            <p className="text-white/70 mb-6">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {/* Overlay Frame (only show if no error) */}
                    {!error && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl -mt-1 -ml-1"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl -mt-1 -mr-1"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl -mb-1 -ml-1"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl -mb-1 -mr-1"></div>

                                {/* Scanning Line Animation */}
                                <div className="absolute inset-x-0 h-0.5 bg-indigo-500/50 top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                            </div>
                        </div>
                    )}
                </div>

                {!error && (
                    <div className="mt-8 text-center space-y-2">
                        <p className="text-white font-medium text-lg">Position code in frame</p>
                        <p className="text-white/50 text-sm">Hold steady to scan assets automatically.</p>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                #reader__scan_region { display: none !important; }
                #reader__dashboard_section_csr button { display: none !important; }
            `}</style>
        </div>
    );
}
