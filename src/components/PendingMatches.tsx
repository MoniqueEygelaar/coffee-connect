import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getMatchesForUser,
  updateMatchStatus,
  getUserByEmail,
  Match,
} from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { Check, X, Coffee, Clock, MessageCircle } from "lucide-react";
import { getIcebreaker } from "@/lib/icebreakers";

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

function formatHour(hour: number): string {
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

interface PendingMatchesProps {
  email: string;
}

const PendingMatches = ({ email }: PendingMatchesProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      const allMatches = await getMatchesForUser(email);
      setMatches(allMatches);

      // Fetch partner names
      const names: Record<string, string> = {};
      for (const m of allMatches) {
        const partnerEmail =
          m.user1_email === email ? m.user2_email : m.user1_email;
        if (!names[partnerEmail]) {
          const user = await getUserByEmail(partnerEmail);
          names[partnerEmail] = user?.name || partnerEmail;
        }
      }
      setPartnerNames(names);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [email]);

  const handleRespond = async (
    matchId: string,
    status: "accepted" | "declined"
  ) => {
    setUpdating(matchId);
    try {
      await updateMatchStatus(matchId, email, status);
      toast({
        title: status === "accepted" ? "Match accepted! ☕" : "Match declined",
        description:
          status === "accepted"
            ? "Great! Your coffee chat is confirmed on your end."
            : "No worries, maybe next week!",
      });
      await fetchMatches();
    } catch (err) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getUserStatus = (match: Match) =>
    match.user1_email === email ? match.user1_status : match.user2_status;

  const getPartnerStatus = (match: Match) =>
    match.user1_email === email ? match.user2_status : match.user1_status;

  if (loading) return null;
  if (matches.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Coffee className="w-5 h-5" /> Your Matches
      </h2>

      {matches.map((match) => {
        const partnerEmail =
          match.user1_email === email ? match.user2_email : match.user1_email;
        const partnerName = partnerNames[partnerEmail] || partnerEmail;
        const myStatus = getUserStatus(match);
        const theirStatus = getPartnerStatus(match);
        const slot = match.shared_slot as any;

        return (
          <Card key={match.id} className="border border-border/60 bg-card/80">
            <CardContent className="pt-5 pb-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{partnerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {DAY_LABELS[slot?.day] || slot?.day}{" "}
                    {slot?.hour !== undefined && `at ${formatHour(slot.hour)}`}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Week {match.week}
                  </p>
                </div>

                <div className="flex gap-1.5">
                  {theirStatus === "pending" && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Clock className="w-3 h-3" /> Waiting on them
                    </Badge>
                  )}
                  {theirStatus === "accepted" && (
                    <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                      They accepted
                    </Badge>
                  )}
                  {theirStatus === "declined" && (
                    <Badge variant="destructive" className="text-xs">
                      They declined
                    </Badge>
                  )}
                </div>
              </div>

              {/* Icebreaker */}
              <div className="flex items-start gap-2 bg-muted/30 rounded-lg px-3 py-2 text-sm">
                <MessageCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Icebreaker</span>
                  <p className="text-foreground">{getIcebreaker(match.id)}</p>
                </div>
              </div>

              {myStatus === "pending" ? (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(match.id, "accepted")}
                    disabled={updating === match.id}
                    className="gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(match.id, "declined")}
                    disabled={updating === match.id}
                    className="gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </Button>
                </div>
              ) : (
                <Badge
                  className={
                    myStatus === "accepted"
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : "bg-destructive/10 text-destructive"
                  }
                >
                  You {myStatus}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PendingMatches;
