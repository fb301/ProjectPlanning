import React, { useState, useEffect } from "react";
import Column from "./Column";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "../../utils/supabase";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState({ todo: [], progress: [], done: [] });
  const sensors = useSensors(useSensor(PointerSensor));

  // --- Hämta tasks från Supabase ---
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("todotasks")
      .select("*")
      .order("due_date", { ascending: true });

    if (!error && data) {
      const todo = data.filter(t => t.status === "todo");
      const progress = data.filter(t => t.status === "progress");
      const done = data.filter(t => t.status === "done");
      setTasks({ todo, progress, done });
    } else {
      console.error("Fel vid hämtning:", error);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Realtidslyssnare
    const channel = supabase
      .channel("todotasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "todotasks" }, () => fetchTasks())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // --- Uppdatera task i databasen ---
  const updateTaskStatus = async (taskId, newStatus) => {
    const { data, error } = await supabase
      .from("todotasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) console.error("Fel vid uppdatering:", error);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const sourceColumnId = Object.keys(tasks).find(col => tasks[col].some(task => task.id === active.id));
    const destColumnId = Object.keys(tasks).find(col => tasks[col].some(task => task.id === over.id) || over.id === col);
    if (!sourceColumnId || !destColumnId) return;

    const sourceIndex = tasks[sourceColumnId].findIndex(task => task.id === active.id);
    const destIndex = tasks[destColumnId].findIndex(task => task.id === over.id);
    const isSameColumn = sourceColumnId === destColumnId;

    if (isSameColumn) {
      const newTasks = Array.from(tasks[sourceColumnId]);
      setTasks(prev => ({ ...prev, [sourceColumnId]: arrayMove(newTasks, sourceIndex, destIndex) }));
    } else {
      const sourceTasks = Array.from(tasks[sourceColumnId]);
      const [movedTask] = sourceTasks.splice(sourceIndex, 1);

      // Sätt ny status
      const newStatus = destColumnId === "todo" ? "todo" :
                        destColumnId === "progress" ? "progress" : "done";
      movedTask.status = newStatus;

      const destTasks = Array.from(tasks[destColumnId]);
      const finalDestIndex = destIndex === -1 ? 0 : destIndex;
      destTasks.splice(finalDestIndex, 0, movedTask);

      setTasks(prev => ({ ...prev, [sourceColumnId]: sourceTasks, [destColumnId]: destTasks }));

      // Uppdatera i databasen
      updateTaskStatus(movedTask.id, newStatus);
    }
  };

  // --- Progress ---
  const totalTasks = Object.values(tasks).flat().length;
  const completedTasks = tasks.done.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-gray-900 min-h-screen p-6 md:px-12 lg:px-24">
      <h1 className="text-5xl font-extrabold text-center mb-8 text-gray-100 font-rubrik">
        Project Kanban Board
      </h1>

      {/* Progress Bar */}
      <div className="w-full max-w-4xl mx-auto mb-12">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>{completedTasks} of {totalTasks} tasks completed</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-lg h-5 overflow-hidden">
          <div
            className="h-5 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex justify-between gap-8">
          <Column columnId="todo" columnName="Todo" tasks={tasks.todo} />
          <Column columnId="progress" columnName="In Progress" tasks={tasks.progress} />
          <Column columnId="done" columnName="Done" tasks={tasks.done} />
        </div>
      </DndContext>
    </div>
  );
}
