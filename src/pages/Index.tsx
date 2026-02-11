import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CoffeeIcon } from "@/components/icons/CoffeeIcon";
import { ChatBubbleIcon } from "@/components/icons/ChatBubbleIcon";
import { PeopleIcon } from "@/components/icons/PeopleIcon";
import { addUser } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Oops!",
        description: "Please fill in both your name and email.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      addUser({ name: name.trim(), email: email.trim() });
      toast({
        title: "Welcome aboard! ☕",
        description: "Let's set up your availability for coffee chats.",
      });
      navigate("/availability");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CoffeeIcon className="w-7 h-7" />
            <span className="text-lg font-semibold text-foreground tracking-tight">Watercooler</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin")}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Admin
          </Button>
        </div>
      </header>

      {/* Centered Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Weekly random coffee chats
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
            Build real connections<br />
            <span className="text-primary">one coffee at a time</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
            Get randomly paired with teammates each week for casual watercooler conversations. No awkward scheduling — just show up and connect.
          </p>

          {/* Signup Card */}
          <Card className="max-w-md mx-auto border border-border/60 bg-card/80 backdrop-blur-sm shadow-xl shadow-primary/5">
            <CardContent className="pt-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-muted/50 border-border/50 placeholder:text-muted-foreground/60"
                />
                <Input
                  type="email"
                  placeholder="Work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-muted/50 border-border/50 placeholder:text-muted-foreground/60"
                />
                <Button 
                  type="submit" 
                  className="w-full h-11 font-semibold gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Joining..." : "Get started"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* How it works - horizontal */}
        <div className="max-w-4xl w-full mt-24">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <CoffeeIcon className="w-12 h-12" />, title: "Sign up", desc: "Join with your name and email in seconds" },
              { icon: <ChatBubbleIcon className="w-12 h-12" />, title: "Set your hours", desc: "Pick the times you're free for a quick chat" },
              { icon: <PeopleIcon className="w-12 h-12" />, title: "Get matched", desc: "We pair you with a teammate who shares free time" },
            ].map((step, i) => (
              <div key={i} className="group flex flex-col items-center text-center p-6 rounded-xl bg-card/50 border border-border/40 hover:border-primary/30 transition-colors">
                <div className="mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                  {step.icon}
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Step {i + 1}</span>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground/70">
          Made with ☕ for better team connections
        </div>
      </footer>
    </div>
  );
};

export default Index;
