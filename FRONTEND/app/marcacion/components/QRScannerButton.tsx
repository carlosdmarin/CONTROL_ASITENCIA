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
        variant="outline" 
        className="flex-1 gap-2"
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
        className="flex-1 gap-2"
        onClick={onReset}
      >
        <RotateCcw className="h-4 w-4" />
        Reiniciar
      </Button>
    </>
  );
}