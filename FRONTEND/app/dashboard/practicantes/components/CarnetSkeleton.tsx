"use client";

export function CarnetSkeleton() {
  return (
    <div
      className="mx-auto w-90 overflow-hidden rounded-2xl bg-white shadow-xl"
      style={{ borderRadius: "16px" }}
      aria-busy="true"
      aria-label="Cargando carnet"
    >
      {/* ENCABEZADO */}
      <div className="h-22 bg-slate-100 animate-shimmer" />

      {/* DATOS */}
      <div className="px-6 py-5">
        <div className="flex gap-4">
          {/* FOTO */}
          <div className="aspect-[3/4] w-28 overflow-hidden rounded-xl bg-slate-100 animate-shimmer" style={{ borderRadius: "12px" }} />
          {/* INFORMACIÓN */}
          <div className="flex-1 pl-3 space-y-3 py-1">
            <div className="h-4 w-32 rounded-md bg-slate-100 animate-shimmer" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-8 rounded bg-slate-100 animate-shimmer" />
              <div className="h-4 w-24 rounded bg-slate-100 animate-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-8 rounded bg-slate-100 animate-shimmer" />
              <div className="h-4 w-20 rounded bg-slate-100 animate-shimmer" />
            </div>
          </div>
        </div>

        {/* QR */}
        <div className="mt-5 flex items-center gap-5">
          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <div className="h-[140px] w-[140px] rounded-lg bg-slate-100 animate-shimmer" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-20 rounded bg-slate-100 animate-shimmer" />
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-slate-100 animate-shimmer" />
              <div className="h-3 w-24 rounded bg-slate-100 animate-shimmer" />
              <div className="h-3 w-20 rounded bg-slate-100 animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* PIE */}
      <div className="bg-white px-6 py-4 text-center space-y-2">
        <div className="h-3 w-40 mx-auto rounded bg-slate-100 animate-shimmer" />
        <div className="h-3 w-32 mx-auto rounded bg-slate-100 animate-shimmer" />
      </div>
    </div>
  );
}
