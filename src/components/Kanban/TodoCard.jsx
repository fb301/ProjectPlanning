import React from "react";

export default function TodoCard({ title, description, status, assignedTo, dueDate, priority }) {
  const statusColor =
    status === "Done" ? "border-green-500" :
    status === "In Progress" ? "border-yellow-500" :
    "border-blue-500"; // Todo: أزرق غامق للـ Dark Mode

  const statusIcon =
    status === "Done" ? "✅" :
    status === "In Progress" ? "⏳" :
    "⏰";

  const priorityColor =
    priority === "High" ? "text-red-500 font-bold" :
    priority === "Medium" ? "text-yellow-400 font-bold" :
    "text-green-400 font-bold";

  return (
    <div className={`p-6 rounded-2xl shadow-lg border-l-8 ${statusColor} 
                    bg-gray-800 text-gray-100
                    transition-all duration-300 ease-in-out
                    hover:scale-105 hover:shadow-xl hover:rotate-1 cursor-grab select-none`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{statusIcon}</span>
        <h2 className="text-2xl font-extrabold text-indigo-200">{title}</h2>
      </div>

      <p className="text-gray-300 text-lg mb-4 italic">{description}</p>

      <div className="text-base text-gray-200 flex justify-between mb-2">
        <span>👤 <strong>{assignedTo}</strong></span>
        <span>📅 <strong>{dueDate}</strong></span>
      </div>

      <div className="text-sm">
        🔥 Priority: <span className={priorityColor}>{priority}</span>
      </div>
    </div>
  );
}
