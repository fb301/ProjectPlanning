import React from "react";

export default function TodoCard({
  title,
  description,
  status,
  assigned_to,
  due_date,
  priority,
  id,
  onEdit, // Add this prop
}) {
  // Helper function to get priority styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50/5";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50/5";
      case "low":
        return "border-l-green-500 bg-green-50/5";
      default:
        return "border-l-[var(--accent-9)] bg-[var(--accent-a2)]";
    }
  };

  // Helper function to get priority icon and color
  const getPriorityDisplay = (priority) => {
    switch (priority) {
      case "high":
        return { icon: "🔴", color: "text-red-400" };
      case "medium":
        return { icon: "🟡", color: "text-yellow-400" };
      case "low":
        return { icon: "🟢", color: "text-green-400" };
      default:
        return { icon: "⚪", color: "text-[var(--gray-11)]" };
    }
  };

  const priorityDisplay = getPriorityDisplay(priority);

  return (
    <div
      className={`p-4 rounded-[var(--radius-3)] shadow-sm border-l-4 ${getPriorityStyle(
        priority
      )}
                    bg-[var(--color-panel)] border border-[var(--gray-a6)]
                    transition-all duration-200 ease-in-out
                    hover:shadow-md hover:scale-[1.02] cursor-grab select-none
                    hover:border-[var(--gray-a8)]`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-[var(--gray-12)] leading-tight">
          {title}
        </h3>
        <span className={`text-xs ${priorityDisplay.color} flex-shrink-0`}>
          {priorityDisplay.icon}
        </span>
      </div>

      {description && (
        <p className="text-sm text-[var(--gray-11)] mb-3 line-clamp-2">
          {description}
        </p>
      )}

      <div className="space-y-2 mb-4">
        {assigned_to && (
          <div className="flex items-center gap-2 text-xs text-[var(--gray-11)]">
            <span className="text-[var(--accent-11)]">👤</span>
            <span>{assigned_to}</span>
          </div>
        )}
        {due_date && (
          <div className="flex items-center gap-2 text-xs text-[var(--gray-11)]">
            <span className="text-[var(--accent-11)]">📅</span>
            <span>{new Date(due_date).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span>{priorityDisplay.icon}</span>
          <span className={`capitalize ${priorityDisplay.color}`}>
            {priority} priority
          </span>
        </div>
      </div>

      <button
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          if (onEdit) onEdit(id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full px-3 py-2 text-xs font-medium rounded-[var(--radius-2)] 
                   bg-[var(--accent-9)] text-white border-0
                   hover:bg-[var(--accent-10)] focus:bg-[var(--accent-10)]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200 cursor-pointer
                   focus:outline-none focus:ring-2 focus:ring-[var(--accent-7)] focus:ring-offset-2 focus:ring-offset-[var(--color-panel)]"
      >
        Edit Task
      </button>
    </div>
  );
}
