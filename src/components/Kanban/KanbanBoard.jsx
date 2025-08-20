import React, { useState, useEffect } from "react";
import Column from "./Column";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
      const todo = data.filter((t) => t.status === "todo");
      const progress = data.filter((t) => t.status === "progress");
      const done = data.filter((t) => t.status === "done");
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todotasks" },
        () => fetchTasks()
      )
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

    const sourceColumnId = Object.keys(tasks).find((col) =>
      tasks[col].some((task) => task.id === active.id)
    );
    const destColumnId = Object.keys(tasks).find(
      (col) => tasks[col].some((task) => task.id === over.id) || over.id === col
    );
    if (!sourceColumnId || !destColumnId) return;

    const sourceIndex = tasks[sourceColumnId].findIndex(
      (task) => task.id === active.id
    );
    const destIndex = tasks[destColumnId].findIndex(
      (task) => task.id === over.id
    );
    const isSameColumn = sourceColumnId === destColumnId;

    if (isSameColumn) {
      const newTasks = Array.from(tasks[sourceColumnId]);
      setTasks((prev) => ({
        ...prev,
        [sourceColumnId]: arrayMove(newTasks, sourceIndex, destIndex),
      }));
    } else {
      const sourceTasks = Array.from(tasks[sourceColumnId]);
      const [movedTask] = sourceTasks.splice(sourceIndex, 1);

      // Sätt ny status
      const newStatus =
        destColumnId === "todo"
          ? "todo"
          : destColumnId === "progress"
          ? "progress"
          : "done";
      movedTask.status = newStatus;

      const destTasks = Array.from(tasks[destColumnId]);
      const finalDestIndex = destIndex === -1 ? 0 : destIndex;
      destTasks.splice(finalDestIndex, 0, movedTask);

      setTasks((prev) => ({
        ...prev,
        [sourceColumnId]: sourceTasks,
        [destColumnId]: destTasks,
      }));

      // Uppdatera i databasen
      updateTaskStatus(movedTask.id, newStatus);
    }
  };

  // --- Progress ---
  const totalTasks = Object.values(tasks).flat().length;
  const completedTasks = tasks.done.length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--gray-12)] mb-2">
            Project Kanban Board
          </h1>
          <p className="text-[var(--gray-11)] text-sm">
            Organize and track your project tasks
          </p>
        </div>

        {/* Progress Section */}
        <div
          className="bg-[var(--color-panel)] border border-[var(--gray-a6)] 
                       rounded-[var(--radius-4)] p-6 mb-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--gray-12)]">
              Project Progress
            </h2>
            <div className="flex items-center gap-4 text-sm text-[var(--gray-11)]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--green-9)]"></span>
                {completedTasks} completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--gray-9)]"></span>
                {totalTasks} total
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[var(--gray-11)]">
              <span>
                {completedTasks} of {totalTasks} tasks completed
              </span>
              <span className="font-medium text-[var(--gray-12)]">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-[var(--gray-a6)] rounded-[var(--radius-2)] h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--green-9)] to-[var(--green-10)] 
                          transition-all duration-500 ease-in-out rounded-[var(--radius-2)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Column columnId="todo" columnName="To Do" tasks={tasks.todo} />
            <Column
              columnId="progress"
              columnName="In Progress"
              tasks={tasks.progress}
            />
            <Column columnId="done" columnName="Done" tasks={tasks.done} />
          </div>
        </DndContext>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div
            className="bg-[var(--blue-a2)] border border-[var(--blue-a6)] 
                         rounded-[var(--radius-3)] p-4 text-center"
          >
            <div className="text-2xl font-bold text-[var(--blue-11)]">
              {tasks.todo.length}
            </div>
            <div className="text-sm text-[var(--blue-11)]">Tasks To Do</div>
          </div>
          <div
            className="bg-[var(--amber-a2)] border border-[var(--amber-a6)] 
                         rounded-[var(--radius-3)] p-4 text-center"
          >
            <div className="text-2xl font-bold text-[var(--amber-11)]">
              {tasks.progress.length}
            </div>
            <div className="text-sm text-[var(--amber-11)]">In Progress</div>
          </div>
          <div
            className="bg-[var(--green-a2)] border border-[var(--green-a6)] 
                         rounded-[var(--radius-3)] p-4 text-center"
          >
            <div className="text-2xl font-bold text-[var(--green-11)]">
              {tasks.done.length}
            </div>
            <div className="text-sm text-[var(--green-11)]">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
