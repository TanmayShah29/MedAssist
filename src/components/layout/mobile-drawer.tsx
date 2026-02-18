"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface MobileDrawerProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
}

export function MobileDrawer({ isOpen, onClose, children }: MobileDrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-[70] w-[280px] bg-[#111113] border-r border-[#1F1F23] md:hidden flex flex-col"
                    >
                        {/* Close Button (Optional, usually clicking backdrop is enough but good for a11y) */}
                        <div className="absolute top-2 right-2 z-10">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-md text-[#6B7280] hover:text-white hover:bg-[#1C1C1F] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
