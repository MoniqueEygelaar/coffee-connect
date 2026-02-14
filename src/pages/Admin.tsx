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
  runMatchingAlgorithm,
  getStats,
  Match,
  User,
  getUserAvailabilityByEmail,
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
  { key: "totalUsers" as const, label: "Users", icon: Users, suffix: "" },
  { key: "usersWithAvailability" as const, label: "Available", icon: Calendar, suffix: "" },
  { key: "totalMatches" as const, label: "Matches", icon: Coffee, suffix: "" },
  { key: "participationRate" as const, label: "Participation", icon: Percent, suffix: "%" },
];

const Admin = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    participationRate: 0,
    usersWithAvailability: 0,
  });
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, number>>({});
  const [isRunningMatch, setIsRunningMatch] = useState(false);

  const loadData = async () => {
    try {
      console.log("Loading admin data...");

      const usersData = await getUsers();
      const matchesData = await getMatches();
      const statsData = await getStats();
      const availabilityCounts: Record<string, number> = {};

      await Promise.all(
        usersData.map(async (user) => {
          try {
            const availability = await getUserAvailabilityByEmail(user.email);
            // Key by user.id instead of email
            availabilityCounts[user.id] = availability?.slots?.length || 0;
          } catch (err) {
            availabilityCounts[user.id] = 0;
          }
        })
      );

      setUsers(usersData);
      setMatches(matchesData);
      setStats(statsData);
      setAvailabilityMap(availabilityCounts);

    } catch (error) {
      console.error("LOAD DATA FAILED:", error);
      toast({
        title: "Failed to load data",
        description: "Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  const handleRunMatching = async () => {
    setIsRunningMatch(true);
    try {
      const newMatches = await runMatchingAlgorithm();
      await loadData();

      if (newMatches.length === 0) {
        toast({
          title: "No new matches",
          description:
            "Not enough users with overlapping availability, or matching already ran this week.",
        });
      } else {
        toast({
          title: `${newMatches.length} new matches created! 🎉`,
          description:
            "Teammates have been paired based on overlapping availability.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunningMatch(false);
    }
  };

  const getUserSlotCount = (user: User): number => {
    return availabilityMap[user.id] || 0;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CoffeeIcon className="w-7 h-7" />
            <span className="text-lg font-semibold text-foreground tracking-tight">
              Watercooler
            </span>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
              Admin
            </Badge>
          </div>
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
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-8">
        {/* Dashboard Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage your watercooler program
            </p>
          </div>
          <Button
            onClick={handleRunMatching}
            disabled={isRunningMatch || users.length < 2}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            {isRunningMatch ? "Matching..." : "Run matching"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STAT_CONFIG.map(({ key, label, icon: Icon, suffix }) => (
            <Card key={key} className="border-border/40 bg-card/60">
              <CardContent className="py-4 px-5 flex items-center gap-3">
                <Icon className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">
                    {stats[key]}
                    {suffix}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Users Table */}
          <Card className="border-border/40 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base">Team members</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No members yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Slots</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.email}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getUserSlotCount(user) > 0 ? "default" : "outline"}>
                            {getUserSlotCount(user)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Matches Table */}
          <Card className="border-border/40 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base">Match history</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Coffee className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No matches yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pair</TableHead>
                      <TableHead>Slot</TableHead>
                      <TableHead>Week</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((match) => {
                      const user1 = users.find((u) => u.email === match.user1Id);
                      const user2 = users.find((u) => u.email === match.user2Id);
                      return (
                        <TableRow key={match.id}>
                          <TableCell>{user1?.name || "?"} & {user2?.name || "?"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {match.sharedSlot ? formatSlot(match.sharedSlot) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{match.week}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
