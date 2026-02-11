import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CoffeeIcon } from "@/components/icons/CoffeeIcon";
import { 
  getUsers, 
  getMatches, 
  getUserById, 
  getUserAvailability, 
  runMatchingAlgorithm, 
  getStats,
  Match,
  User 
} from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Coffee, Percent, Play, Calendar } from "lucide-react";

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
};

function formatHour(hour: number): string {
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

function formatSlot(slot: { day: string; hour: number }): string {
  return `${DAY_LABELS[slot.day]} ${formatHour(slot.hour)}`;
}

const STAT_CONFIG = [
  { key: "totalUsers" as const, label: "Users", icon: Users, color: "primary", suffix: "" },
  { key: "usersWithAvailability" as const, label: "Available", icon: Calendar, color: "secondary", suffix: "" },
  { key: "totalMatches" as const, label: "Matches", icon: Coffee, color: "accent", suffix: "" },
  { key: "participationRate" as const, label: "Participation", icon: Percent, color: "coral", suffix: "%" },
];

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalMatches: 0, participationRate: 0, usersWithAvailability: 0 });
  const [isRunningMatch, setIsRunningMatch] = useState(false);

  const loadData = () => {
    setUsers(getUsers());
    setMatches(getMatches().sort((a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime()));
    setStats(getStats());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunMatching = () => {
    setIsRunningMatch(true);
    try {
      const newMatches = runMatchingAlgorithm();
      loadData();
      if (newMatches.length === 0) {
        toast({
          title: "No new matches",
          description: "Not enough users with overlapping availability, or matching already ran this week.",
        });
      } else {
        toast({
          title: `${newMatches.length} new matches created! 🎉`,
          description: "Teammates have been paired based on overlapping availability.",
        });
      }
    } catch (error) {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsRunningMatch(false);
    }
  };

  const getUserSlotCount = (userId: string): number => {
    return getUserAvailability(userId)?.slots.length || 0;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CoffeeIcon className="w-7 h-7" />
            <span className="text-lg font-semibold text-foreground tracking-tight">Watercooler</span>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">Admin</Badge>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Home
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-8">
        {/* Title + action */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your watercooler program</p>
          </div>
          <Button onClick={handleRunMatching} disabled={isRunningMatch || users.length < 2} className="gap-2">
            <Play className="w-4 h-4" />
            {isRunningMatch ? "Matching..." : "Run matching"}
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color, suffix }) => (
            <Card key={key} className="border-border/40 bg-card/60">
              <CardContent className="py-4 px-5 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${color}/10`}>
                  <Icon className={`w-4 h-4 text-${color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">
                    {stats[key]}{suffix}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two-column tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Team Members */}
          <Card className="border-border/40 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Team members</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No members yet</p>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto -mx-1 px-1">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs text-right">Slots</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-border/20">
                          <TableCell className="font-medium text-sm py-2.5">{user.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm py-2.5">{user.email}</TableCell>
                          <TableCell className="text-right py-2.5">
                            <Badge variant={getUserSlotCount(user.id) > 0 ? "default" : "outline"} className="text-xs">
                              {getUserSlotCount(user.id)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match History */}
          <Card className="border-border/40 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Match history</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Coffee className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No matches yet</p>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto -mx-1 px-1">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead className="text-xs">Pair</TableHead>
                        <TableHead className="text-xs">Slot</TableHead>
                        <TableHead className="text-xs">Week</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((match) => {
                        const user1 = getUserById(match.user1Id);
                        const user2 = getUserById(match.user2Id);
                        return (
                          <TableRow key={match.id} className="border-border/20">
                            <TableCell className="py-2.5">
                              <span className="text-sm font-medium">{user1?.name || "?"}</span>
                              <span className="text-muted-foreground text-sm"> & {user2?.name || "?"}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm py-2.5">
                              {formatSlot(match.sharedSlot)}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Badge variant="outline" className="text-xs">{match.week}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
