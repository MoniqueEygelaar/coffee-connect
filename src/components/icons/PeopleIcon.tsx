import { cn } from "@/lib/utils";

interface PeopleIconProps {
  className?: string;
}

export function PeopleIcon({ className }: PeopleIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-16 h-16", className)}
    >
      {/* Person 1 - left */}
      <circle cx="20" cy="20" r="8" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path
        d="M8 52C8 42.0589 16.0589 34 26 34H14C10.6863 34 8 38.0294 8 42.5V52Z"
        fill="hsl(var(--accent))"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <path
        d="M6 56C6 46.0589 13.1634 38 22 38C26.5 38 30.5 40 33 43"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
        fill="none"
      />
      <ellipse cx="20" cy="52" rx="14" ry="8" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Person 2 - right */}
      <circle cx="44" cy="20" r="8" fill="hsl(var(--coral))" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <ellipse cx="44" cy="52" rx="14" ry="8" fill="hsl(var(--coral))" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Connection heart */}
      <path
        d="M32 28C32 26 30 24 28 24C26 24 24 26 24 28C24 32 32 38 32 38C32 38 40 32 40 28C40 26 38 24 36 24C34 24 32 26 32 28Z"
        fill="hsl(var(--primary))"
        className="animate-float"
      />
    </svg>
  );
}
