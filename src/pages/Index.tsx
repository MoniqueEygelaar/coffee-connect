import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getUsers, addUser, getUserByEmail, setCurrentUserEmail, User } from "@/lib/storage";
import { CoffeeIcon } from "@/components/icons/CoffeeIcon";
import { motion } from "framer-motion";

import { isAdminEmail } from "@/lib/admin";

const Index = () => {
  const navigate = useNavigate();
  const [currentEmail, setCurrentEmailState] = useState<string | null>(
    localStorage.getItem("watercooler_current_user")
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentEmail) return;

    if (isAdminEmail(currentEmail)) {
      navigate("/admin");
    } else {
      navigate("/availability");
    }
  }, [currentEmail, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast({
        title: "Oops!",
        description: "Please enter both your name and email",
        variant: "destructive",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      let user = await getUserByEmail(normalizedEmail);
      if (!user) {
        user = await addUser({ name: name.trim(), email: normalizedEmail });
      }

      setCurrentUserEmail(user.email);

      toast({
        title: `Hi, ${user.name}!`,
        description: ``,
      });

      // Navigate directly based on email
      if (isAdminEmail(user.email)) {
        navigate("/admin");
      } else {
        navigate("/availability");
      }
    } catch (err: any) {
      toast({
        title: "Failed to log in",
        description: err.message || "Please try again",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-500 to-purple-800 p-6">
      {/* Animated Hero */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <CoffeeIcon className="w-20 h-20 mx-auto text-primary animate-bounce" />
        <h1 className="text-slate-900 md:text-5xl font-bold text-foreground mt-4">
          Fathom Coffee Corner
        </h1>
        <p className="text-gray-800 mt-2">
          Connect, chat, and have virtual coffee with your teammates ☕
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl p-8 md:p-10 w-full max-w-md space-y-6 border border-border"
      >
        <h2 className="text-gray-900 font-bold text-foreground text-center mb-1">Log In</h2>

        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-indigo-900 font-medium text-foreground mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dwight Schrute"
              className="w-full rounded-xl border border-border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-indigo-900 font-medium text-foreground mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. dwightschrute@fathom.dev"
              className="w-full rounded-xl border border-border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl text-lg font-semibold"
        >
          {isSubmitting ? "Joining..." : "Join the Watercooler"}
        </Button>

        <div className="text-center text-sm text-muted-foreground mt-2">
          Already joined? Just enter the same email to continue
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center text-sm text-gray-300"
      >
        Made with ❤️ for team bonding
      </motion.div>
    </div>
  );
};

export default Index;
