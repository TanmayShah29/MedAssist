import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ChatInputProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
    ({ className, ...props }, ref) => (
        <Textarea
            autoComplete="off"
            ref={ref}
            name="message"
            className={cn(
                // Base styles
                "max-h-32 px-4 py-3 bg-white text-slate-900 text-sm",
                // Placeholder
                "placeholder:text-slate-400",
                // Focus ring - sky blue to match brand
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-sky-400 focus-visible:border-sky-400",
                // Disabled state
                "disabled:cursor-not-allowed disabled:opacity-50",
                // Layout
                "w-full rounded-xl flex items-center h-16 resize-none",
                // Border
                "border border-slate-200",
                className,
            )}
            {...props}
        />
    ),
)
ChatInput.displayName = "ChatInput"

export { ChatInput }
