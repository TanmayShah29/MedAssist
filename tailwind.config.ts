import type { Config } from "tailwindcss";
import { colors, typography, spacing, shadows } from "./src/lib/design-tokens";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                ...colors, // Spread design tokens
            },
            fontSize: {
                ...typography.size,
            },
            fontFamily: {
                ...typography.family,
            },
            spacing: {
                ...spacing,
            },
            boxShadow: {
                ...shadows,
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
