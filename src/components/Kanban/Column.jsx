import React, { useState } from "react";
import TodoCard from "./TodoCard";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import TodoForm from "../TodoForm/TodoForm"; // Import your form

// Column styling based on status using Radix design tokens
const getColumnStyle = (columnId) => {
  switch (columnId) {
    case "todo":
      return {
        bg: "bg-[var(--blue-a2)]",
        border: "border-[var(--blue-a6)]",
        title: "text-[var(--blue-11)]",
        icon: "📝",
      };
    case "progress":
      return {
        bg: "bg-[var(--amber-a2)]",
        border: "border-[var(--amber-a6)]",
        title: "text-[var(--amber-11)]",
        icon: "⚡",
      };
    case "done":
      return {
        bg: "bg-[var(--green-a2)]",
        border: "border-[var(--green-a6)]",
        title: "text-[var(--green-11)]",
        icon: "✅",
      };
    default:
      return {
        bg: "bg-[var(--gray-a2)]",
        border: "border-[var(--gray-a6)]",
        title: "text-[var(--gray-11)]",
        icon: "📋",
      };
  }
};

export default function Column({ columnId, columnName, tasks, onTaskUpdate }) {
  const { setNodeRef: setDroppableRef } = useDroppable({ id: columnId });
  const [editTaskId, setEditTaskId] = useState(null);

  const columnStyle = getColumnStyle(columnId);

  const handleEdit = (id) => setEditTaskId(id);
  const closeModal = () => setEditTaskId(null);

  // Handle form close with optional refresh
  const handleFormClose = (shouldRefresh = false) => {
    closeModal();
    if (shouldRefresh && onTaskUpdate) {
      onTaskUpdate();
    }
  };

  return (
    <div>
      <div
        ref={setDroppableRef}
        className={`p-4 rounded-[var(--radius-4)] min-h-[500px] w-80 
                    ${columnStyle.bg} border ${columnStyle.border}
                    shadow-sm transition-all duration-200`}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--gray-a6)]">
          <h2
            className={`text-lg font-semibold ${columnStyle.title} capitalize flex items-center gap-2`}
          >
            <span className="text-base">{columnStyle.icon}</span>
            {columnName}
          </h2>
          <span
            className="px-2 py-1 text-xs font-medium rounded-[var(--radius-2)] 
                         bg-[var(--gray-a3)] text-[var(--gray-11)]"
          >
            {tasks.length}
          </span>
        </div>

        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <SortableCard
                  key={task.id}
                  id={task.id}
                  task={task}
                  onEdit={handleEdit}
                />
              ))
            ) : (
              <div
                className="p-6 rounded-[var(--radius-3)] border-2 border-dashed border-[var(--gray-a6)] 
                            text-[var(--gray-9)] text-center h-24 flex items-center justify-center
                            bg-[var(--gray-a2)] transition-colors duration-200
                            hover:border-[var(--gray-a8)] hover:bg-[var(--gray-a3)]"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg opacity-50">📥</span>
                  <span className="text-xs">Drop tasks here</span>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      {/* Modal with Radix styling */}
      {editTaskId && (
        <div className="fixed inset-0 bg-[var(--black-a8)] flex items-center justify-center z-50 p-4">
          <div
            className="bg-[var(--color-panel)] border border-[var(--gray-a6)] 
                         rounded-[var(--radius-4)] shadow-lg min-w-[400px] max-w-[90vw] 
                         max-h-[90vh] overflow-auto relative"
          >
            <button
              onClick={() => handleFormClose(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-[var(--radius-2)]
                       flex items-center justify-center
                       text-[var(--gray-11)] hover:text-[var(--gray-12)]
                       hover:bg-[var(--gray-a3)] transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent-7)]"
              aria-label="Close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <TodoForm id={editTaskId} onClose={handleFormClose} />
          </div>
        </div>
      )}
    </div>
  );
}

function SortableCard({ id, task, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-4 cursor-grab select-none"
    >
      <TodoCard {...task} onEdit={() => onEdit(id)} />
    </div>
  );
}
