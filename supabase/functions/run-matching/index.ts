import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate current week string
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor(
      (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const currentWeek = `${now.getFullYear()}-W${week.toString().padStart(2, "0")}`;

    // Check if matches already exist this week
    const { data: existingMatches } = await supabase
      .from("matches")
      .select("*")
      .eq("week", currentWeek);

    if (existingMatches && existingMatches.length > 0) {
      return new Response(
        JSON.stringify({
          message: "Matches already exist for this week",
          matches: existingMatches,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*");
    if (usersError) throw usersError;

    // Get all availability
    const { data: availabilities, error: availError } = await supabase
      .from("availability")
      .select("*");
    if (availError) throw availError;

    // Shuffle users
    const shuffled = [...(users || [])].sort(() => Math.random() - 0.5);
    const matchedEmails = new Set<string>();
    const newMatches: any[] = [];

    for (let i = 0; i < shuffled.length; i++) {
      const user1 = shuffled[i];
      if (matchedEmails.has(user1.email)) continue;

      const user1Avail = availabilities?.find(
        (a: any) => a.user_email === user1.email
      );
      const user1Slots = user1Avail?.slots || [];
      if (!Array.isArray(user1Slots) || user1Slots.length === 0) continue;

      for (let j = i + 1; j < shuffled.length; j++) {
        const user2 = shuffled[j];
        if (matchedEmails.has(user2.email)) continue;

        const user2Avail = availabilities?.find(
          (a: any) => a.user_email === user2.email
        );
        const user2Slots = user2Avail?.slots || [];
        if (!Array.isArray(user2Slots) || user2Slots.length === 0) continue;

        // Find overlapping slots
        const overlapping = user1Slots.filter((s1: any) =>
          user2Slots.some(
            (s2: any) => s1.day === s2.day && s1.hour === s2.hour
          )
        );

        if (overlapping.length > 0) {
          const sharedSlot =
            overlapping[Math.floor(Math.random() * overlapping.length)];

          const { data: match, error: matchError } = await supabase
            .from("matches")
            .insert({
              user1_email: user1.email,
              user2_email: user2.email,
              shared_slot: sharedSlot,
              week: currentWeek,
            })
            .select()
            .single();

          if (matchError) {
            console.error("Failed to insert match:", matchError);
            continue;
          }

          newMatches.push(match);
          matchedEmails.add(user1.email);
          matchedEmails.add(user2.email);
          break;
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `Created ${newMatches.length} new matches`,
        matches: newMatches,
        week: currentWeek,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Matching error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
