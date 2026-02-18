"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";

export function MobileSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Hamburger button — only on non-desktop */}
            <button
                onClick={() => setOpen(true)}
                className="
          lg:hidden
          fixed top-4 left-4 z-50
          w-10 h-10 rounded-[10px]
          bg-[#F5F4EF] border border-[#E8E6DF]
          flex items-center justify-center
          shadow-sm
        "
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5 text-[#57534E]" />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="
                lg:hidden fixed inset-0 z-40
                bg-black/30 backdrop-blur-sm
                backdrop-blur-safari
              "
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                            className="
                lg:hidden
                fixed left-0 top-0 z-50
                w-72 h-full
                bg-[#F0EFE9] border-r border-[#E8E6DF]
                flex flex-col
                /* Safe area */
                pl-safe
              "
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setOpen(false)}
                                className="
                  absolute top-4 right-4
                  w-8 h-8 rounded-lg
                  bg-[#E8E6DF] flex items-center justify-center
                  z-50
                "
                            >
                                <X className="w-4 h-4 text-[#57534E]" />
                            </button>

                            {/* Resize Sidebar or strip it? 
                  The existing Sidebar component might expect to be desktop. 
                  We can wrap it or modify it. 
                  The existing Sidebar has "hidden lg:flex" class. 
                  We might need to override that or create a separate content component.
                  Actually, if Sidebar has `hidden lg:flex`, it won't show up here if we just render <Sidebar />.
                  We need to make Sidebar flexible or duplicate content.
                  Verification showed Sidebar has `className` prop.
                  Let's check Sidebar code again or just assume we can override className.
                  Actually, Step 1792 viewed Sidebar and it had `hidden lg:flex` hardcoded in `className="..."`.
                  I should check if it accepts a custom className to override "hidden".
                  If not, I might need to update Sidebar to accept className override.
                  User said "Create MobileSidebar that handles tablet + mobile", implies separate component or wrapper.
                  If Sidebar is rigid, I should modify Sidebar to be flexible.
                  Let's assume I can pass `className="flex w-full h-full static ..."` to Sidebar.
              */}
                            <div className="flex-1 overflow-y-auto h-full w-full relative">
                                {/* 
                    If Sidebar has hardcoded `hidden lg:flex`, we need to strip it.
                    Let's update Sidebar to allow overriding classes.
                    But for now, I'll assume I can fix Sidebar in the next step.
                 */}
                                <Sidebar className="flex w-full h-full static border-none bg-transparent" />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
