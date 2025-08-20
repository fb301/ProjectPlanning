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

// Matchar nu de kolumn-id som skickas från KanbanBoard
const columnBg = {
  todo: "bg-blue-900",
  progress: "bg-yellow-900",
  done: "bg-green-900",
};

const columnTitleColor = {
  todo: "text-blue-200",
  progress: "text-yellow-200",
  done: "text-green-200",
};

export default function Column({ columnId, columnName, tasks }) {
  const { setNodeRef: setDroppableRef } = useDroppable({ id: columnId });
  const [editTaskId, setEditTaskId] = useState(null);

  const handleEdit = (id) => setEditTaskId(id);
  const closeModal = () => setEditTaskId(null);

  return (
    <div>
    <div
      ref={setDroppableRef}
      className={`p-5 rounded-2xl min-h-[400px] w-80 ${columnBg[columnId]}`}
    >
      <h2
        className={`text-2xl font-bold mb-5 ${columnTitleColor[columnId]} text-center capitalize font-rubrik`}
      >
        {columnName}
      </h2>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
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
          <div className="p-6 rounded-xl border-2 border-dashed border-gray-600 text-gray-400 text-center h-24 flex items-center justify-center">
            Drop here
          </div>
        )}
      </SortableContext>


    </div>
          {/* Modal */}
      {editTaskId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--gray-1)] border border-[var(--gray-a6)] rounded-[var(--radius-3)] shadow-sm min-w-[350px] relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-120 text-2xl"
            >
              ❌
            </button>
            <TodoForm id={editTaskId} onClose={closeModal} />
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
