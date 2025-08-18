import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export default function TodoTaskList() {
  const [tasks, setTasks] = useState([]);

  // Hämtar alla poster i datumordning
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("todotasks")
      .select("*")
      .order("due_date", { ascending: true });

    console.log(data, error);

    if (!error) {
      setTasks(data);
    } else {
      console.error("Fel vid hämtning:", error);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Realtids-lyssnare: triggar när något i tabellen ändras
    const channel = supabase
      .channel("todotasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todotasks" },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    // Städa upp när komponenten demonteras
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ul>
      {tasks.map((t) => (
        <li key={t.id}>
          <strong>{t.title}</strong> — {t.status} — {t.due_date}
        </li>
      ))}
    </ul>
  );
}
