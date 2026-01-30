import { cn } from "@/lib/utils";

interface ChatBubbleIconProps {
  className?: string;
}

export function ChatBubbleIcon({ className }: ChatBubbleIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-16 h-16", className)}
    >
      {/* Main bubble */}
      <path
        d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V36C56 40.4183 52.4183 44 48 44H24L12 54V44H16C11.5817 44 8 40.4183 8 36V16Z"
        fill="hsl(var(--secondary))"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      
      {/* Dots */}
      <circle cx="24" cy="26" r="3" fill="hsl(var(--secondary-foreground))" />
      <circle cx="32" cy="26" r="3" fill="hsl(var(--secondary-foreground))" />
      <circle cx="40" cy="26" r="3" fill="hsl(var(--secondary-foreground))" />
    </svg>
  );
}
