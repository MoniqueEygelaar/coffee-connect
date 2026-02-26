import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, X, Plus } from "lucide-react";

const INTEREST_SUGGESTIONS = [
  "Coffee", "Gaming", "Music", "Travel", "Cooking", "Reading",
  "Fitness", "Photography", "Movies", "Hiking", "Art", "Tech",
  "Podcasts", "Gardening", "Sports", "Yoga", "Writing", "Dancing",
];

interface ProfileEditorProps {
  email: string;
  initialFunFact: string;
  initialInterests: string[];
  onSaved: () => void;
}

const ProfileEditor = ({ email, initialFunFact, initialInterests, onSaved }: ProfileEditorProps) => {
  const [funFact, setFunFact] = useState(initialFunFact);
  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [newInterest, setNewInterest] = useState("");
  const [saving, setSaving] = useState(false);

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed) && interests.length < 8) {
      setInterests([...interests, trimmed]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ fun_fact: funFact, interests } as any)
        .eq("email", email);
      if (error) throw error;
      toast({ title: "Profile updated! ✨" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/40 bg-card/60">
      <CardContent className="pt-5 pb-5 space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Your Profile</h3>
        </div>

        {/* Fun Fact */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Fun fact about you</label>
          <input
            type="text"
            value={funFact}
            onChange={(e) => setFunFact(e.target.value)}
            placeholder="e.g. I can solve a Rubik's cube in under a minute"
            maxLength={150}
            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none transition"
          />
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Interests ({interests.length}/8)</label>
          
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => removeInterest(interest)}
              >
                {interest}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>

          {interests.length < 8 && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest(newInterest))}
                  placeholder="Add an interest..."
                  className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none transition"
                />
                <Button size="sm" variant="outline" onClick={() => addInterest(newInterest)} disabled={!newInterest.trim()}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1">
                {INTEREST_SUGGESTIONS.filter((s) => !interests.includes(s)).slice(0, 6).map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 text-xs"
                    onClick={() => addInterest(suggestion)}
                  >
                    + {suggestion}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving} size="sm" className="w-full">
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
