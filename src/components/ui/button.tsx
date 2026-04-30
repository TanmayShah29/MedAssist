import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — matches the .btn component class but in cva form for flexibility
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans font-semibold leading-none",
    "rounded-[10px] min-h-[44px] px-5 py-2.5 text-sm",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-1",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
    "-webkit-appearance-none appearance-none",
    "select-none cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Sky-500 filled — primary CTA */
        primary:
          "bg-[#0EA5E9] text-white shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-[#0284C7] hover:shadow-[0_4px_18px_rgba(14,165,233,0.35)]",
        /** Bordered, subtle fill on hover */
        secondary:
          "bg-[#F5F4EF] text-[#1C1917] border-2 border-[#E8E6DF] hover:border-[#0EA5E9] hover:bg-[#E0F2FE] hover:text-[#0EA5E9]",
        /** No background, transparent */
        ghost:
          "bg-transparent text-[#57534E] border border-transparent hover:bg-[#EFEDE6] hover:text-[#1C1917] hover:border-[#E8E6DF]",
        /** Danger / destructive */
        danger:
          "bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600",
        /** Outlined brand */
        outline:
          "bg-transparent text-[#0EA5E9] border-2 border-[#0EA5E9] hover:bg-[#E0F2FE]",
        /** Dark surface — for use on dark backgrounds */
        dark:
          "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40",
        /** Icon-only button — square */
        icon:
          "bg-[#F5F4EF] text-[#57534E] border border-[#E8E6DF] shadow-sm hover:bg-[#EFEDE6] hover:text-[#1C1917] hover:shadow-md",
      },
      size: {
        sm: "text-[13px] min-h-[36px] h-9 px-3.5 py-2 rounded-[8px] gap-1.5",
        md: "text-sm min-h-[44px] px-5 py-2.5 rounded-[10px]",
        lg: "text-[15px] min-h-[52px] px-7 py-3.5 rounded-[14px] font-bold",
        xl: "text-[16px] min-h-[56px] px-8 py-4 rounded-[14px] font-bold",
        "icon-sm": "!p-0 w-9 h-9 min-h-[36px] rounded-[8px]",
        "icon-md": "!p-0 w-11 h-11 min-h-[44px] rounded-[10px]",
        "icon-lg": "!p-0 w-12 h-12 min-h-[48px] rounded-[12px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        style={{ WebkitAppearance: "none", ...props.style }}
        {...props}
      >
        {isLoading ? (
          <>
            <ButtonSpinner />
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

/** Inline spinner for loading state */
function ButtonSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export { Button, buttonVariants };
