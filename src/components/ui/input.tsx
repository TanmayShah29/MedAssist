import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, startIcon, endIcon, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {startIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]">
                        {startIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "input-base file:border-0 file:bg-transparent file:text-sm file:font-medium",
                        startIcon && "pl-10",
                        endIcon && "pr-10",
                        error && "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {endIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E]">
                        {endIcon}
                    </div>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
