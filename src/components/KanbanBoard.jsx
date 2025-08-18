import React, { useState } from "react";
import Column from "./Column";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

const initialTasks = {
  todo: [
    { id: "1", title: "Design Homepage", description: "Create wireframes and finalize homepage.", status: "Todo", assignedTo: "Alice", dueDate: "2025-08-20", priority: "High" },
    { id: "2", title: "Setup Database", description: "Initialize Supabase and configure tables.", status: "Todo", assignedTo: "Bob", dueDate: "2025-08-25", priority: "Medium" },
  ],
  inProgress: [
    { id: "3", title: "Build Login Page", description: "Implement form validation and auth.", status: "In Progress", assignedTo: "Charlie", dueDate: "2025-08-22", priority: "High" },
  ],
  done: [
    { id: "4", title: "Project Setup", description: "Initialize project with Astro + React.", status: "Done", assignedTo: "Dave", dueDate: "2025-08-15", priority: "Low" },
  ],
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    let sourceColumnId = Object.keys(tasks).find(col => tasks[col].some(task => task.id === active.id));
    let destColumnId = Object.keys(tasks).find(col => tasks[col].some(task => task.id === over.id) || over.id === col);
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
      movedTask.status = destColumnId === "todo" ? "Todo" :
                         destColumnId === "inProgress" ? "In Progress" : "Done";
      const destTasks = Array.from(tasks[destColumnId]);
      const finalDestIndex = destIndex === -1 ? 0 : destIndex;
      destTasks.splice(finalDestIndex, 0, movedTask);

      setTasks(prev => ({
        ...prev,
        [sourceColumnId]: sourceTasks,
        [destColumnId]: destTasks
      }));
    }
  };

  // --- Progress calculation ---
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
          <Column columnId="inProgress" columnName="In Progress" tasks={tasks.inProgress} />
          <Column columnId="done" columnName="Done" tasks={tasks.done} />
        </div>
      </DndContext>
    </div>
  );
}
