import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoffeeIcon } from "@/components/icons/CoffeeIcon";
import { ChatBubbleIcon } from "@/components/icons/ChatBubbleIcon";
import { PeopleIcon } from "@/components/icons/PeopleIcon";
import { addUser } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoffeeIcon className="w-8 h-8" />
            <span className="text-xl font-bold text-foreground">Watercooler</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
            className="text-sm"
          >
            Admin Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text and Form */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Connect with your{" "}
                <span className="text-primary">team</span>{" "}
                over virtual{" "}
                <span className="text-secondary">coffee</span> ☕
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Get randomly paired with teammates for casual watercooler chats. 
                Build connections, share ideas, and make work more human!
              </p>
            </div>

            {/* Sign Up Form */}
            <Card className="max-w-md shadow-lg border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Join the Watercooler</CardTitle>
                <CardDescription>
                  Sign up to start getting matched with teammates for coffee chats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Work Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Joining..." : "Join the Watercooler ☕"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Illustrations */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-primary/10 animate-float" style={{ animationDelay: "0s" }}>
                <CoffeeIcon className="w-24 h-24" />
                <span className="text-sm font-medium text-foreground">Weekly Chats</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-secondary/10 animate-float" style={{ animationDelay: "0.5s" }}>
                <ChatBubbleIcon className="w-24 h-24" />
                <span className="text-sm font-medium text-foreground">Easy Scheduling</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-accent/10 animate-float" style={{ animationDelay: "1s" }}>
              <PeopleIcon className="w-24 h-24" />
              <span className="text-sm font-medium text-foreground">Build Connections</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Sign Up</h3>
              <p className="text-muted-foreground">
                Enter your name and email to join the watercooler community
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Set Availability</h3>
              <p className="text-muted-foreground">
                Pick the times when you're free for a casual coffee chat
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent flex items-center justify-center text-accent-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Get Matched</h3>
              <p className="text-muted-foreground">
                Each week, you'll be paired with a teammate who shares your free time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Made with ☕ and 💜 for better team connections</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
