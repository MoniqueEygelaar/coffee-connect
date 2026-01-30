import { cn } from "@/lib/utils";

interface CoffeeIconProps {
  className?: string;
}

export function CoffeeIcon({ className }: CoffeeIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-16 h-16", className)}
    >
      {/* Steam lines */}
      <path
        d="M20 12C20 12 22 8 20 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-muted-foreground animate-float"
        style={{ animationDelay: "0s" }}
      />
      <path
        d="M28 10C28 10 30 6 28 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-muted-foreground animate-float"
        style={{ animationDelay: "0.3s" }}
      />
      <path
        d="M36 12C36 12 38 8 36 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-muted-foreground animate-float"
        style={{ animationDelay: "0.6s" }}
      />
      
      {/* Cup body */}
      <path
        d="M10 22H46V48C46 54.6274 40.6274 60 34 60H22C15.3726 60 10 54.6274 10 48V22Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      
      {/* Cup handle */}
      <path
        d="M46 28H50C53.3137 28 56 30.6863 56 34V36C56 39.3137 53.3137 42 50 42H46"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Coffee liquid */}
      <path
        d="M14 30H42V48C42 52.4183 38.4183 56 34 56H22C17.5817 56 14 52.4183 14 48V30Z"
        fill="hsl(var(--coral))"
      />
      
      {/* Heart on cup */}
      <path
        d="M28 38C28 36 26 34 24 34C22 34 20 36 20 38C20 42 28 48 28 48C28 48 36 42 36 38C36 36 34 34 32 34C30 34 28 36 28 38Z"
        fill="hsl(var(--primary-foreground))"
      />
    </svg>
  );
}
