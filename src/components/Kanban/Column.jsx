import React from "react";
import TodoCard from "./TodoCard";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

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

  return (
    <div ref={setDroppableRef} className={`p-5 rounded-2xl min-h-[400px] w-80 ${columnBg[columnId]}`}>
      <h2 className={`text-2xl font-bold mb-5 ${columnTitleColor[columnId]} text-center capitalize font-rubrik`}>
        {columnName}
      </h2>

      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <SortableCard key={task.id} id={task.id} task={task} />
          ))
        ) : (
          <div className="p-6 rounded-xl border-2 border-dashed border-gray-600 text-gray-400 text-center h-24 flex items-center justify-center">
            Drop here
          </div>
        )}
      </SortableContext>
    </div>
  );
}

function SortableCard({ id, task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 cursor-grab select-none">
      <TodoCard {...task} />
    </div>
  );
}
