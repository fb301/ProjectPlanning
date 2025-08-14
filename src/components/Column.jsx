import React from "react";
import TodoCard from "./TodoCard";
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const columnBg = {
  todo: "bg-blue-100",
  inProgress: "bg-yellow-100",
  done: "bg-green-100",
};

const columnTitleColor = {
  todo: "text-blue-900",
  inProgress: "text-yellow-800",
  done: "text-green-900",
};

export default function Column({ columnId, columnName, tasks }) {
  return (
    <div className={`p-5 rounded-2xl min-h-[400px] w-80 ${columnBg[columnId]}`}>
      <h2 className={`text-2xl font-bold mb-5 ${columnTitleColor[columnId]} text-center capitalize font-rubrik`}>
        {columnName}
      </h2>

      <SortableContext items={tasks.map((task, index) => `${columnId}-${index}`)} strategy={verticalListSortingStrategy}>
        {tasks.map((task, index) => (
          <SortableCard key={task.id} id={`${columnId}-${index}`} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}

// 🟢 مكوّن SortableCard
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
