import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CoffeeIcon } from "@/components/icons/CoffeeIcon";
import { getUsers, getMatches, Match, User } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Flame, Trophy, Star, Users, Coffee, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface MemberStats {
  user: User;
  currentStreak: number;
  totalSessions: number;
  lastMatchDate: string | null;
  badges: string[];
  uniquePartners: number;
}

function calculateMemberStats(user: User, allMatches: Match[]): MemberStats {
  const userMatches = allMatches.filter(
    (m) => m.user1_email === user.email || m.user2_email === user.email
  );

  const acceptedWeeks = new Set<string>();
  const partners = new Set<string>();
  let lastMatchDate: string | null = null;

  for (const m of userMatches) {
    const isUser1 = m.user1_email === user.email;
    const myStatus = isUser1 ? m.user1_status : m.user2_status;
    const partnerEmail = isUser1 ? m.user2_email : m.user1_email;

    if (myStatus === "accepted") {
      acceptedWeeks.add(m.week);
      partners.add(partnerEmail);
      if (!lastMatchDate || m.matched_at > lastMatchDate) {
        lastMatchDate = m.matched_at;
      }
    }
  }

  const sortedWeeks = Array.from(acceptedWeeks).sort().reverse();
  let currentStreak = 0;
  for (let i = 0; i < sortedWeeks.length; i++) {
    if (i === 0) { currentStreak = 1; continue; }
    const prevNum = parseInt(sortedWeeks[i - 1].split("-W")[1]);
    const currNum = parseInt(sortedWeeks[i].split("-W")[1]);
    if (prevNum - currNum === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  const totalSessions = acceptedWeeks.size;
  const badges: string[] = [];
  if (totalSessions >= 1) badges.push("First Coffee ☕");
  if (totalSessions >= 5) badges.push("Social Butterfly 🦋");
  if (totalSessions >= 10) badges.push("Coffee Connoisseur 🏆");
  if (currentStreak >= 3) badges.push("On Fire 🔥");
  if (currentStreak >= 5) badges.push("Unstoppable ⚡");
  if (partners.size >= 5) badges.push("Networker 🤝");

  return {
    user,
    currentStreak,
    totalSessions,
    lastMatchDate,
    badges,
    uniquePartners: partners.size,
  };
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, matches] = await Promise.all([getUsers(), getMatches()]);
        const stats = users
          .map((u) => calculateMemberStats(u, matches))
          .sort((a, b) => b.currentStreak - a.currentStreak || b.totalSessions - a.totalSessions);
        setMemberStats(stats);
      } catch (err) {
        console.error(err);
        toast({ title: "Failed to load dashboard", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSessions = memberStats.reduce((sum, m) => sum + m.totalSessions, 0);
  const avgStreak = memberStats.length
    ? (memberStats.reduce((sum, m) => sum + m.currentStreak, 0) / memberStats.length).toFixed(1)
    : "0";
  const topStreaker = memberStats[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CoffeeIcon className="w-7 h-7" />
            <span className="text-lg font-semibold text-foreground tracking-tight">
              Team Dashboard
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/availability")}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full space-y-8">
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <Card className="border-border/40 bg-card/60">
            <CardContent className="py-4 px-5 flex items-center gap-3">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xl font-bold text-foreground leading-none">{memberStats.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Team members</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/60">
            <CardContent className="py-4 px-5 flex items-center gap-3">
              <Coffee className="w-4 h-4 text-secondary" />
              <div>
                <p className="text-xl font-bold text-foreground leading-none">{totalSessions}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/60">
            <CardContent className="py-4 px-5 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-accent" />
              <div>
                <p className="text-xl font-bold text-foreground leading-none">{avgStreak}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avg streak</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/60">
            <CardContent className="py-4 px-5 flex items-center gap-3">
              <Trophy className="w-4 h-4 text-yellow" />
              <div>
                <p className="text-xl font-bold text-foreground leading-none truncate max-w-[100px]">
                  {topStreaker?.user.name.split(" ")[0] || "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Top streaker</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/40 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent" />
                Team Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-10">Loading...</p>
              ) : memberStats.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No team members yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-center">
                        <span className="flex items-center justify-center gap-1">
                          <Flame className="w-3 h-3" /> Streak
                        </span>
                      </TableHead>
                      <TableHead className="text-center">Sessions</TableHead>
                      <TableHead className="text-center">Partners</TableHead>
                      <TableHead className="text-center">Last Chat</TableHead>
                      <TableHead>Badges</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberStats.map((ms, i) => (
                      <TableRow key={ms.user.email}>
                        <TableCell className="font-medium text-muted-foreground">
                          {i === 0 && ms.currentStreak > 0 ? "🥇" : i === 1 && ms.currentStreak > 0 ? "🥈" : i === 2 && ms.currentStreak > 0 ? "🥉" : i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {getInitials(ms.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm leading-none">{ms.user.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{ms.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${ms.currentStreak >= 3 ? "text-accent" : "text-foreground"}`}>
                            {ms.currentStreak}
                            {ms.currentStreak >= 3 && " 🔥"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-foreground">{ms.totalSessions}</TableCell>
                        <TableCell className="text-center text-foreground">{ms.uniquePartners}</TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {ms.lastMatchDate ? formatDate(ms.lastMatchDate) : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {ms.badges.length > 0 ? (
                              ms.badges.slice(0, 3).map((b) => (
                                <Badge key={b} variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {b}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
