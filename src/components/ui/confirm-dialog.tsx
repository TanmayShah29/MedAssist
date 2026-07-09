"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="relative w-full max-w-md rounded-[18px] border border-[#EBEAE4] bg-[#FDFDFB] p-5 shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#FFFFFF]"
              aria-label="Close confirmation"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex gap-3 pr-8">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${destructive ? "bg-red-50 text-red-600" : "bg-sky-50 text-sky-600"}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 id="confirm-title" className="text-lg font-bold text-[#0F172A]">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-[#475569]">{description}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={onCancel} className="min-h-[44px] rounded-[10px] border border-[#EBEAE4] bg-white px-4 py-2 text-sm font-semibold text-[#475569]">
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`min-h-[44px] rounded-[10px] px-4 py-2 text-sm font-semibold text-white ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-sky-500 hover:bg-sky-600"}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
