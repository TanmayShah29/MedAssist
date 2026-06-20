"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function BottomSheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-hidden rounded-t-[24px] border border-[#E8E6DF] bg-[#FAFAF7] shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAFAF7] px-4 py-3">
              <h2 className="font-display text-xl font-bold text-[#1C1917]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F4EF] text-[#57534E]"
                aria-label="Close sheet"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(82dvh-4rem)] overflow-y-auto p-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
