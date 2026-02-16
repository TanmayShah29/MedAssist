"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Page Transition ── */
export function AnimatedPage({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

/* ── Stagger Container ── */
export function StaggerContainer({
    children,
    className,
    delay = 0.06,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: delay } },
            }}
        >
            {children}
        </motion.div>
    );
}

/* ── Stagger Item ── */
export function StaggerItem({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

/* ── Hover Card (lift 4px) ── */
export function HoverCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            whileHover={{
                y: -4,
                transition: { duration: 0.2, ease: EASE },
            }}
        >
            {children}
        </motion.div>
    );
}

/* ── Button Press (scale 0.96) ── */
export function MotionButton({
    children,
    className,
    onClick,
    type = "button",
    disabled,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}) {
    return (
        <motion.button
            type={type}
            className={className}
            onClick={onClick}
            disabled={disabled}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: EASE }}
        >
            {children}
        </motion.button>
    );
}

/* ── Fade In (for individual elements) ── */
export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.6,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

export const MotionDiv = motion.div;
export { AnimatePresence };
