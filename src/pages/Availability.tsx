import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoffeeIcon } from "@/components/icons/CoffeeIcon";
import { getCurrentUserId, getUserById, getUserAvailability, setUserAvailability, TimeSlot } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, ArrowLeft } from "lucide-react";

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
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      toast({
        title: "Please sign up first",
        description: "You need to join the watercooler before setting availability.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const user = getUserById(userId);
    if (user) {
      setUserName(user.name);
    }

    // Load existing availability
    const existing = getUserAvailability(userId);
    if (existing) {
      setSelectedSlots(existing.slots);
    }
  }, [navigate]);

  const toggleSlot = (day: string, hour: number) => {
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.day === day && s.hour === hour);
      if (exists) {
        return prev.filter((s) => !(s.day === day && s.hour === hour));
      } else {
        return [...prev, { day, hour }];
      }
    });
  };

  const isSlotSelected = (day: string, hour: number) => {
    return selectedSlots.some((s) => s.day === day && s.hour === hour);
  };

  const handleSave = () => {
    const userId = getCurrentUserId();
    if (!userId) {
      navigate("/");
      return;
    }

    if (selectedSlots.length === 0) {
      toast({
        title: "No slots selected",
        description: "Please select at least one time slot for coffee chats.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      setUserAvailability(userId, selectedSlots);
      setShowConfirmation(true);
      toast({
        title: "Availability saved! 🎉",
        description: `You've selected ${selectedSlots.length} time slots for coffee chats.`,
      });
    } catch (error) {
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center shadow-lg border-2">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4">
              <CoffeeIcon className="w-24 h-24 animate-float" />
            </div>
            <CardTitle className="text-3xl">You're all set, {userName}! 🎉</CardTitle>
            <CardDescription className="text-lg">
              Your availability has been saved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <p className="text-foreground font-medium">What happens next?</p>
              <ul className="text-muted-foreground text-left space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Each week, we'll match you with a teammate who has overlapping free time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span>You'll get an email with your match and suggested meeting time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Grab a virtual coffee and catch up! ☕</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setShowConfirmation(false)}
                variant="outline"
              >
                Edit Availability
              </Button>
              <Button 
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoffeeIcon className="w-8 h-8" />
            <span className="text-xl font-bold text-foreground">Watercooler</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            When are you free for coffee? ☕
          </h1>
          <p className="text-muted-foreground text-lg">
            Click on the time slots when you're available for a casual chat
          </p>
        </div>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle>Weekly Availability</CardTitle>
            <CardDescription>
              Select all the times that work for you (Monday - Friday, 9 AM - 5 PM)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Day headers */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="h-10" /> {/* Empty corner cell */}
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="h-10 flex items-center justify-center font-semibold text-foreground bg-muted rounded-lg"
                    >
                      {DAY_LABELS[day]}
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-6 gap-2 mb-2">
                    {/* Hour label */}
                    <div className="h-12 flex items-center justify-end pr-3 text-sm text-muted-foreground">
                      {formatHour(hour)}
                    </div>
                    
                    {/* Day slots */}
                    {DAYS.map((day) => {
                      const isSelected = isSlotSelected(day, hour);
                      return (
                        <button
                          key={`${day}-${hour}`}
                          onClick={() => toggleSlot(day, hour)}
                          className={cn(
                            "h-12 rounded-lg border-2 transition-all duration-200 font-medium",
                            "hover:scale-105 active:scale-95",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground shadow-md"
                              : "bg-card border-border hover:border-primary/50 hover:bg-primary/10"
                          )}
                        >
                          {isSelected && <Check className="w-5 h-5 mx-auto" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected count and save button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              <div className="text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedSlots.length}</span> time slots selected
              </div>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                size="lg"
                className="min-w-[200px]"
              >
                {isSaving ? "Saving..." : "Save Availability"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Availability;
