import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CoffeeIcon } from "@/components/icons/CoffeeIcon";
import {
  getCurrentUserEmail,
  getUserByEmail,
  getUserAvailabilityByEmail,
  setUserAvailabilityByEmail,
  TimeSlot,
} from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, ArrowLeft, Save } from "lucide-react";
import { isAdminEmail } from "@/lib/admin";
import PendingMatches from "@/components/PendingMatches";
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
};

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16] as const;

function formatHour(hour: number): string {
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

const Availability = () => {
  
  const navigate = useNavigate();

  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // ✅ Load user and availability
  useEffect(() => {
    const fetchUserData = async () => {
      const email = getCurrentUserEmail();
      if (!email) {
        toast({
          title: "Access denied",
          description: "You must log in first.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        const user = await getUserByEmail(email);
        if (!user) throw new Error("User not found");

        setUserName(user.name);
        setCurrentEmail(user.email);

        const existing = await getUserAvailabilityByEmail(email);
        if (existing?.slots?.length) setSelectedSlots(existing.slots);
      } catch (error) {
        console.error(error);
        toast({
          title: "Failed to load availability",
          description: "Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [navigate]);

  const toggleSlot = (day: string, hour: number) => {
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.day === day && s.hour === hour);
      if (exists) return prev.filter((s) => !(s.day === day && s.hour === hour));
      return [...prev, { day, hour }];
    });
  };

  const isSlotSelected = (day: string, hour: number) => {
    return selectedSlots.some((s) => s.day === day && s.hour === hour);
  };

  const handleSave = async () => {
    const email = getCurrentUserEmail();
    if (!email) return navigate("/");

    if (selectedSlots.length === 0) {
      toast({
        title: "No slots selected",
        description: "Please select at least one time slot.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await setUserAvailabilityByEmail(email, selectedSlots);
      setShowConfirmation(true);
      toast({
        title: "Availability saved! 🎉",
        description: `You've selected ${selectedSlots.length} slots.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <CoffeeIcon className="w-20 h-20 mx-auto animate-float" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">You're all set, {userName}!</h1>
            <p className="text-muted-foreground">Your availability has been saved</p>
          </div>

          <Card className="border border-border/60 bg-card/80 text-left">
            <CardContent className="pt-5 pb-5 space-y-3">
              <p className="text-sm font-medium text-foreground">What happens next</p>
              {[
                "Each week, we'll match you with a teammate",
                "You'll get notified with your match and time",
                "Grab a virtual coffee and catch up ☕",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1">
              Edit availability
            </Button>
            <Button onClick={() => {
              localStorage.removeItem("watercooler_current_user");
              navigate("/");
            }} className="flex-1 gap-2">
              <ArrowLeft className="w-4 h-4" /> Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CoffeeIcon className="w-7 h-7" />
            <span className="text-lg font-semibold text-foreground tracking-tight">Watercooler</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.removeItem("watercooler_current_user");
                navigate("/");
              }}
              className="gap-2 text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Log out
            </Button>

            {isAdminEmail(currentEmail) && (
              <Button variant="ghost" onClick={() => navigate("/admin")} className="gap-2 text-muted-foreground">
                Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            When are you free for coffee?
          </h1>
          <p className="text-muted-foreground">Tap the slots when you're available for a casual chat</p>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            <div className="grid grid-cols-6 gap-1.5 mb-1.5">
              <div /> {/* Empty corner */}
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="h-9 flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {DAY_LABELS[day]}
                </div>
              ))}
            </div>

            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-6 gap-1.5 mb-1.5">
                <div className="h-11 flex items-center justify-end pr-3 text-xs text-muted-foreground/70 tabular-nums">
                  {formatHour(hour)}
                </div>
                {DAYS.map((day) => {
                  const isSelected = isSlotSelected(day, hour);
                  return (
                    <button
                      key={`${day}-${hour}`}
                      onClick={() => toggleSlot(day, hour)}
                      className={cn(
                        "h-11 rounded-lg transition-all duration-150 text-sm font-medium",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "bg-muted/40 hover:bg-muted/80 text-transparent hover:text-muted-foreground/30"
                      )}
                    >
                      {isSelected ? <Check className="w-4 h-4 mx-auto" /> : "·"}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Save bar */}
        <div className="mt-8 flex items-center justify-between border-t border-border/40 pt-6">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{selectedSlots.length}</span> slots selected
          </span>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 min-w-[160px]">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save availability"}
          </Button>
        </div>

        {/* Pending matches */}
        {currentEmail && (
          <div className="mt-10">
            <PendingMatches email={currentEmail} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Availability;
