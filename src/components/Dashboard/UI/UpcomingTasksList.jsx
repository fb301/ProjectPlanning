import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";

export default function UpcomingTasksList() {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Query for the 3 most urgent tasks with due dates coming up
  const fetchUpcomingTasks = async () => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from("todotasks")
        .select(
          "id, title, description, status, assigned_to, due_date, priority, created_at"
        )
        .not("due_date", "is", null) // Only tasks with due dates
        .gte("due_date", new Date().toISOString().split("T")[0]) // Due date is today or in the future
        .neq("status", "done") // Exclude completed tasks
        .order("due_date", { ascending: true }) // Most urgent first
        .limit(5);

      if (error) {
        setError(error);
        console.error("Error fetching upcoming tasks:", error);
        return;
      }

      console.log("Upcoming tasks from DB:", data);
      setUpcomingTasks(data || []);
    } catch (err) {
      setError(err);
      console.error("Error fetching upcoming tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingTasks();

    // Set up real-time subscription
    const channel = supabase
      .channel("realtime-upcoming-tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todotasks" },
        () => {
          console.log("Task change detected, refreshing upcoming tasks");
          fetchUpcomingTasks();
        }
      )
      .subscribe();

    // Fallback: Poll every 60 seconds
    const pollInterval = setInterval(fetchUpcomingTasks, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  // Helper function to format due date
  const formatDueDate = (dueDate) => {
    if (!dueDate) return "No due date";

    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Due today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Due tomorrow";
    } else {
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
      } else {
        return `Overdue by ${Math.abs(diffDays)} day${
          Math.abs(diffDays) > 1 ? "s" : ""
        }`;
      }
    }
  };

  // Helper function to get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "progress":
        return "bg-[var(--accent-a3)] text-[var(--accent-11)]";
      case "todo":
        return "bg-[var(--gray-a3)] text-[var(--gray-11)]";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-[var(--gray-a3)] text-[var(--gray-11)]";
    }
  };

  // Helper function to get priority styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-[var(--accent-9)]";
    }
  };

  // Helper function to format status text
  const formatStatus = (status) => {
    switch (status) {
      case "progress":
        return "In Progress";
      case "todo":
        return "To Do";
      case "review":
        return "Review";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="lg:col-span-2">
        <div className="bg-[var(--color-panel)] border border-[var(--gray-a6)] rounded-[var(--radius-3)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--gray-12)] mb-4">
            Upcoming Tasks
          </h2>
          <div className="text-center py-8">
            <p className="text-[var(--gray-11)] text-sm">
              Loading upcoming tasks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:col-span-2">
        <div className="bg-[var(--color-panel)] border border-[var(--gray-a6)] rounded-[var(--radius-3)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--gray-12)] mb-4">
            Upcoming Tasks
          </h2>
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">Error loading tasks</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="bg-[var(--color-panel)] border border-[var(--gray-a6)] rounded-[var(--radius-3)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--gray-12)] mb-4">
          Upcoming Tasks
        </h2>
        <div className="space-y-4">
          {upcomingTasks && upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-[var(--gray-a2)] rounded-[var(--radius-2)]"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 ${getPriorityStyle(
                      task.priority
                    )} rounded-[var(--radius-1)] flex items-center justify-center text-white font-medium`}
                  >
                    {task.priority?.charAt(0).toUpperCase() || "M"}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--gray-12)]">
                      {task.title}
                    </p>
                    <p className="text-sm text-[var(--gray-11)]">
                      {formatDueDate(task.due_date)}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 ${getStatusStyle(
                    task.status
                  )} text-xs font-medium rounded-[var(--radius-1)]`}
                >
                  {formatStatus(task.status)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-[var(--gray-11)] text-sm">
                No upcoming tasks with due dates
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export the data fetching function for use in other components
export const useUpcomingTasks = () => {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpcomingTasks = async () => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from("todotasks")
        .select(
          "id, title, description, status, assigned_to, due_date, priority, created_at"
        )
        .not("due_date", "is", null)
        .gte("due_date", new Date().toISOString().split("T")[0])
        .neq("status", "done")
        .order("due_date", { ascending: true })
        .limit(3);

      if (error) {
        setError(error);
        return;
      }

      setUpcomingTasks(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingTasks();

    const channel = supabase
      .channel("realtime-upcoming-tasks-hook")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todotasks" },
        () => fetchUpcomingTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { upcomingTasks, loading, error, refetch: fetchUpcomingTasks };
};
