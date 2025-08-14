import React, { useState } from "react";
import Column from "./Column";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

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

    const [sourceColumnId, sourceIndex] = active.id.split("-");
    const [destColumnId, destIndex] = over.id.split("-");

    if (sourceColumnId === destColumnId) {
      const newTasks = Array.from(tasks[sourceColumnId]);
      const oldIndex = parseInt(sourceIndex);
      const newIndex = parseInt(destIndex);
      arrayMove(newTasks, oldIndex, newIndex);
      setTasks((prev) => ({ ...prev, [sourceColumnId]: newTasks }));
    } else {
      // نقل بين الأعمدة
      const sourceTasks = Array.from(tasks[sourceColumnId]);
      const movedTask = sourceTasks.splice(parseInt(sourceIndex), 1)[0];
      movedTask.status = destColumnId === "todo" ? "Todo" : destColumnId === "inProgress" ? "In Progress" : "Done";

      const destTasks = Array.from(tasks[destColumnId]);
      destTasks.splice(parseInt(destIndex), 0, movedTask);

      setTasks((prev) => ({
        ...prev,
        [sourceColumnId]: sourceTasks,
        [destColumnId]: destTasks,
      }));
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 min-h-screen p-10">
      <h1 className="text-5xl font-extrabold text-center mb-10 text-indigo-900 font-rubrik">
        Project Kanban Board
      </h1>

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
