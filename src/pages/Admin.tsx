import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

function formatSlot(slot: { day: string; hour: number }): string {
  return `${DAY_LABELS[slot.day]} at ${formatHour(slot.hour)}`;
}

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
          description: "Either matching was already run this week, or there aren't enough users with overlapping availability.",
        });
      } else {
        toast({
          title: `Created ${newMatches.length} new matches! 🎉`,
          description: "Teammates have been paired based on their overlapping availability.",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunningMatch(false);
    }
  };

  const getUserSlotCount = (userId: string): number => {
    const availability = getUserAvailability(userId);
    return availability?.slots.length || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoffeeIcon className="w-8 h-8" />
            <span className="text-xl font-bold text-foreground">Watercooler</span>
            <Badge variant="secondary" className="ml-2">Admin</Badge>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your watercooler program</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.usersWithAvailability}</p>
                  <p className="text-sm text-muted-foreground">With Availability</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Coffee className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalMatches}</p>
                  <p className="text-sm text-muted-foreground">Total Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-coral/10">
                  <Percent className="w-6 h-6 text-coral" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.participationRate}%</p>
                  <p className="text-sm text-muted-foreground">Participation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Management */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>All registered watercooler participants</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No team members yet</p>
                  <p className="text-sm">Share the signup link to get started!</p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
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
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={getUserSlotCount(user.id) > 0 ? "default" : "secondary"}>
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

          {/* Match History + Trigger */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Match History</CardTitle>
                <CardDescription>Recent coffee chat pairings</CardDescription>
              </div>
              <Button 
                onClick={handleRunMatching}
                disabled={isRunningMatch || users.length < 2}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunningMatch ? "Matching..." : "Run Matching"}
              </Button>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No matches yet</p>
                  <p className="text-sm">Run matching to create the first pairings!</p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pair</TableHead>
                        <TableHead>Shared Slot</TableHead>
                        <TableHead>Week</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((match) => {
                        const user1 = getUserById(match.user1Id);
                        const user2 = getUserById(match.user2Id);
                        return (
                          <TableRow key={match.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{user1?.name || "Unknown"}</span>
                                <span className="text-muted-foreground text-sm">& {user2?.name || "Unknown"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatSlot(match.sharedSlot)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{match.week}</Badge>
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
