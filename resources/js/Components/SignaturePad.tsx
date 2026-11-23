import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle, PenTool } from 'lucide-react';

interface SignaturePadProps {
    value?: string;
    onChange: (base64: string) => void;
    error?: string;
    hideTopLabel?: boolean;
}

export default function SignaturePad({ value, onChange, error, hideTopLabel = false }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
    const lastWidthRef = useRef<number>(0);

    // Initialize canvas with high-DPI scaling & fixed crisp ink
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;

        // Only resize if the display width has changed significantly (e.g. screen orientation flip)
        // This strictly prevents canvas wipe/skewing when virtual keyboards open/close
        if (lastWidthRef.current && Math.abs(lastWidthRef.current - rect.width) < 4) {
            return;
        }
        lastWidthRef.current = rect.width;

        // Preserve existing strokes if resizing
        let tempCanvas: HTMLCanvasElement | null = null;
        if (canvas.width > 0 && canvas.height > 0) {
            tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.drawImage(canvas, 0, 0);
            }
        }

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 2.8;
            ctx.strokeStyle = '#09090b'; // Rich solid black ink (clearly visible on white)

            // Restore previous drawing if it existed
            if (tempCanvas && tempCanvas.width > 0) {
                ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
            }
        }
    }, []);

    useEffect(() => {
        // Initial setup
        initCanvas();

        const handleOrientationOrResize = () => {
            initCanvas();
        };

        window.addEventListener('resize', handleOrientationOrResize);

        const canvas = canvasRef.current;
        if (canvas) {
            const preventTouchScroll = (e: TouchEvent) => {
                if (e.target === canvas) {
                    e.preventDefault();
                }
            };
            canvas.addEventListener('touchstart', preventTouchScroll, { passive: false });
            canvas.addEventListener('touchmove', preventTouchScroll, { passive: false });
            canvas.addEventListener('touchend', preventTouchScroll, { passive: false });

            return () => {
                window.removeEventListener('resize', handleOrientationOrResize);
                canvas.removeEventListener('touchstart', preventTouchScroll);
                canvas.removeEventListener('touchmove', preventTouchScroll);
                canvas.removeEventListener('touchend', preventTouchScroll);
            };
        }

        return () => window.removeEventListener('resize', handleOrientationOrResize);
    }, [initCanvas]);

    // Helper to get coordinates relative to canvas
    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX = 0;
        let clientY = 0;

        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    // Auto-trim signature bounding box to eliminate empty whitespace
    const extractTrimmedBase64 = (): string => {
        const canvas = canvasRef.current;
        if (!canvas) return '';

        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        const width = canvas.width;
        const height = canvas.height;
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        let found = false;

        // Scan pixels for non-transparent content
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = data[(y * width + x) * 4 + 3];
                if (alpha > 20) {
                    found = true;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        if (!found) return '';

        // Add 16px padding
        const padding = 16;
        const trimX = Math.max(0, minX - padding);
        const trimY = Math.max(0, minY - padding);
        const trimW = Math.min(width - trimX, maxX - minX + padding * 2);
        const trimH = Math.min(height - trimY, maxY - minY + padding * 2);

        const trimmedCanvas = document.createElement('canvas');
        trimmedCanvas.width = trimW;
        trimmedCanvas.height = trimH;

        const trimmedCtx = trimmedCanvas.getContext('2d');
        if (!trimmedCtx) return canvas.toDataURL('image/png');

        trimmedCtx.drawImage(canvas, trimX, trimY, trimW, trimH, 0, 0, trimW, trimH);

        return trimmedCanvas.toDataURL('image/png');
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        // Blur any active text field to prevent mobile keyboard from dismissing mid-stroke
        if (document.activeElement instanceof HTMLElement && document.activeElement.tagName === 'INPUT') {
            document.activeElement.blur();
        }

        const pos = getPos(e);
        setIsDrawing(true);
        setLastPos(pos);

        // Draw immediate dot so single taps register cleanly without skewing
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = '#09090b';
        ctx.fill();

        if (!hasDrawn) {
            setHasDrawn(true);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !lastPos) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentPos = getPos(e);

        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();

        setLastPos(currentPos);
        if (!hasDrawn) {
            setHasDrawn(true);
        }
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        setLastPos(null);

        const trimmed = extractTrimmedBase64();
        if (trimmed) {
            onChange(trimmed);
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
        onChange('');
    };

    return (
        <div className="space-y-2">
            {!hideTopLabel && (
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <PenTool className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        <span>Tanda Tangan Digital Tamu</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    {hasDrawn ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tercatat
                        </span>
                    ) : (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            Wajib dibubuhkan langsung
                        </span>
                    )}
                </div>
            )}

            {/* Canvas Box: Strictly fixed dimensions, NO transitions or layout shifts on tap, pure white paper background */}
            <div 
                ref={containerRef}
                className={`relative w-full rounded-2xl border-2 border-dashed bg-white overflow-hidden shadow-sm select-none ${
                    error
                        ? 'border-rose-400'
                        : hasDrawn
                        ? 'border-brand-500'
                        : 'border-zinc-300'
                }`}
                style={{ 
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                }}
            >
                {/* Background Watermark when empty */}
                {!hasDrawn && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-zinc-400 select-none p-4 text-center">
                        <PenTool className="w-7 h-7 mb-1.5 stroke-1 opacity-50 text-zinc-400" />
                        <p className="text-xs sm:text-sm font-medium tracking-wide text-zinc-400">
                            Goreskan tanda tangan dengan jari atau stylus di sini
                        </p>
                    </div>
                )}

                {/* Touch-None Canvas: Fixed pure white background so ink is sharp on PC & mobile */}
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-44 sm:h-52 cursor-crosshair block bg-white"
                    style={{ 
                        touchAction: 'none',
                        backgroundColor: '#ffffff'
                    }}
                />

                {/* Bottom Signature Line */}
                <div className="absolute bottom-5 left-10 right-10 border-b border-dashed border-zinc-300 pointer-events-none flex justify-center">
                    <span className="text-[10px] text-zinc-400 bg-white px-2 -mb-2 select-none">
                        Garis Tanda Tangan
                    </span>
                </div>
            </div>

            {/* Actions & Feedback */}
            <div className="flex items-center justify-between pt-1">
                <button
                    type="button"
                    onClick={clearSignature}
                    disabled={!hasDrawn}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi Tanda Tangan</span>
                </button>

                <p className="text-[11px] text-zinc-400">
                    *Tanda tangan tersimpan sah sebagai bukti fisik digital
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
