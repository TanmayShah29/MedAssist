import { cn } from "@/lib/utils";
import { User, Brain } from "lucide-react";

export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
};

export function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";

    return (
        <div className={cn(
            "flex gap-3 max-w-[85%]",
            isUser ? "ml-auto flex-row-reverse" : ""
        )}>
            {/* Avatar */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                isUser
                    ? "bg-sky-100 border-sky-200 text-sky-700"
                    : "bg-emerald-100 border-emerald-200 text-emerald-700"
            )}>
                {isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={cn(
                "p-4 rounded-[14px] text-sm leading-relaxed border",
                isUser
                    ? "bg-sky-500 border-sky-600 text-white rounded-tr-[4px]"
                    : "bg-[#F5F4EF] border-[#E8E6DF] text-[#57534E] rounded-tl-[4px]"
            )}>
                {message.content}
            </div>
        </div>
    );
}
