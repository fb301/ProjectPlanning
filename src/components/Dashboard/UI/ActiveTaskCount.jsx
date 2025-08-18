import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";

export default function ActiveTaskCount({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);

  const updateCount = async () => {
    const { count: newCount, error } = await supabase
      .from("todotasks")
      .select("*", { count: "exact" })
      .in("status", ["progress", "todo"]);

    if (error) {
      console.error("Error fetching count:", error);
      return;
    }

    console.log("Updated count:", newCount);
    setCount(newCount ?? 0);
  };

  useEffect(() => {
    // Update count on mount
    updateCount();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("realtime-tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todotasks",
        },
        (payload) => {
          console.log("Real-time change detected:", payload);
          updateCount();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    // Fallback: Poll every 60 seconds if real-time doesn't work
    const pollInterval = setInterval(() => {
      updateCount();
    }, 60000);

    // Cleanup subscription and polling on unmount
    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <p className="text-2xl font-semibold text-[var(--gray-12)]">{count}</p>
  );
}
