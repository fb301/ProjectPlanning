import React, { useState } from "react";
import FormInput from "./FormInput.jsx";
import { supabase } from "../utils/supabase";

export default function TodoForm() {
  const initialFormState = {
    title: "",
    description: "",
    status: "todo",
    assignedTo: "",
    dueDate: "", // YYYY-MM-DD från <input type="date" />
    priority: "medium",
  };

  const [task, setTask] = useState(initialFormState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const payload = {
      title: task.title.trim(),
      description: task.description.trim() || null,
      status: task.status, // 'todo' | 'progress' | 'done'
      priority: task.priority, // 'low' | 'medium' | 'high'
      assigned_to: task.assignedTo || null,
      due_date: task.dueDate || null, // YYYY-MM-DD funkar direkt mot DATE-kolumn
    };

    try {
      const { error } = await supabase.from("tasks").insert([payload]); // array är mest framtidssäkert

      if (error) throw error;

      setIsSubmitted(true);
      setTask(initialFormState);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      setErrorMsg(err.message ?? "Något gick fel vid skapandet av uppgiften.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-panel)] border border-[var(--gray-a6)] rounded-[var(--radius-3)] p-6 shadow-sm font-sans text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--gray-12)] mb-2">
          Create a New Task
        </h1>
        <p className="text-[var(--gray-11)]">
          Fill out the details below to add a new task to do.
        </p>
      </div>

      {isSubmitted && (
        <div
          className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg relative mb-6 text-center"
          role="alert"
        >
          <span className="block sm:inline">Task created successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div
          className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6 text-center"
          role="alert"
        >
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="title"
          label="Title"
          name="title"
          value={task.title}
          onChange={handleChange}
          required
        />

        <FormInput
          id="description"
          label="Description"
          name="description"
          type="textarea"
          value={task.description}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="status"
            label="Status"
            name="status"
            type="select"
            value={task.status}
            onChange={handleChange}
          >
            <option value="todo">⏰ To Do</option>
            <option value="progress">⏳ Progress</option>
            <option value="done">✅ Done</option>
          </FormInput>

          <FormInput
            id="priority"
            label="🔥Priority"
            name="priority"
            type="select"
            value={task.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </FormInput>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="assignedTo"
            label="👤 Assigned To"
            name="assignedTo"
            value={task.assignedTo}
            onChange={handleChange}
            type="select"
            required
          >
            <option value="">Select a user</option>
            <option value="mats.lind">Mats Lind</option>
            <option value="fredrik.bjorklund">Fredrik Björklund</option>
            <option value="tomas.mauritzson">Tomas Mauritzson</option>
            <option value="khattab.alshami">Khattab Alshami</option>
            <option value="danny.gomez">Danny Gomez</option>
          </FormInput>

          <FormInput
            id="dueDate"
            label="📅 Due Date"
            name="dueDate"
            type="date"
            value={task.dueDate}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent-6)] rounded-[var(--radius-2)] hover:bg-[var(--accent-9)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {loading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </div>
  );
}
