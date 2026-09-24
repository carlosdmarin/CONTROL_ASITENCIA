"use client";

import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw } from "lucide-react";

interface QRScannerButtonProps {
  isScanning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export default function QRScannerButton({ 
  isScanning, 
  onToggle, 
  onReset 
}: QRScannerButtonProps) {
  return (
    <>
      <Button 
        className="flex-1 gap-3 min-h-[44px] h-11 rounded-xl bg-brand text-brand-foreground hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand/20"
        onClick={onToggle}
      >
        {isScanning ? (
          <>
            <Pause className="h-4 w-4" />
            Pausar
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Reanudar
          </>
        )}
      </Button>

      <Button 
        variant="outline" 
        className="flex-1 gap-3 min-h-[44px] h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand/20"
        onClick={onReset}
      >
        <RotateCcw className="h-4 w-4" />
        Reiniciar
      </Button>
    </>
  );
}