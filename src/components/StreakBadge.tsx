import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMatchesForUser, Match } from "@/lib/storage";
import { Flame, Trophy, Star, Zap } from "lucide-react";

interface StreakBadgeProps {
  email: string;
}

function calculateStreak(matches: Match[], email: string): { current: number; total: number; badges: string[] } {
  const acceptedWeeks = new Set<string>();
  
  for (const m of matches) {
    const myStatus = m.user1_email === email ? m.user1_status : m.user2_status;
    if (myStatus === "accepted") {
      acceptedWeeks.add(m.week);
    }
  }

  const sortedWeeks = Array.from(acceptedWeeks).sort().reverse();
  
  // Calculate current streak
  let current = 0;
  // Simple: count consecutive recent weeks
  for (let i = 0; i < sortedWeeks.length; i++) {
    if (i === 0) { current = 1; continue; }
    // Check if consecutive (rough check)
    const prev = sortedWeeks[i - 1];
    const curr = sortedWeeks[i];
    const prevNum = parseInt(prev.split("-W")[1]);
    const currNum = parseInt(curr.split("-W")[1]);
    if (prevNum - currNum === 1) {
      current++;
    } else {
      break;
    }
  }

  const total = acceptedWeeks.size;
  const badges: string[] = [];
  
  if (total >= 1) badges.push("First Coffee ☕");
  if (total >= 5) badges.push("Social Butterfly 🦋");
  if (total >= 10) badges.push("Coffee Connoisseur 🏆");
  if (current >= 3) badges.push("On Fire 🔥");
  if (current >= 5) badges.push("Unstoppable ⚡");

  return { current, total, badges };
}

const StreakBadge = ({ email }: StreakBadgeProps) => {
  const [streak, setStreak] = useState({ current: 0, total: 0, badges: [] as string[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const matches = await getMatchesForUser(email);
        setStreak(calculateStreak(matches, email));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [email]);

  if (loading || streak.total === 0) return null;

  return (
    <Card className="border-border/40 bg-card/60">
      <CardContent className="pt-5 pb-5 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow" />
          <h3 className="font-semibold text-foreground">Your Stats</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-3 py-2.5">
            <Flame className="w-5 h-5 text-accent" />
            <div>
              <p className="text-lg font-bold text-foreground leading-none">{streak.current}</p>
              <p className="text-[11px] text-muted-foreground">Week streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-3 py-2.5">
            <Star className="w-5 h-5 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground leading-none">{streak.total}</p>
              <p className="text-[11px] text-muted-foreground">Total chats</p>
            </div>
          </div>
        </div>

        {streak.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {streak.badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakBadge;
