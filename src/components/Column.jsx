import React from "react";
import TodoCard from "./TodoCard";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

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
          <div className="p-6 rounded-xl border-2 border-dashed border-gray-400 text-gray-500 text-center h-24 flex items-center justify-center">
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
