import React, { useState, useEffect } from "react";
import FormInput from "./FormInput.jsx";
import { supabase } from "../../utils/supabase";

export default function TodoForm({
  id = "", // ← Nytt prop
  title = "",
  description = "",
  status = "todo",
  assignedTo = "",
  dueDate = "",
  priority = "medium",
  onClose, // New prop for callback when form closes
}) {
  const initialFormState = {
    id: id,
    title: title,
    description: description,
    status: status,
    assignedTo: assignedTo,
    dueDate: dueDate,
    priority: priority,
  };

  const [task, setTask] = useState(initialFormState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (id !== "") {
      const fetchTask = async () => {
        const { data, error } = await supabase
          .from("todotasks")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          setTask({
            id: data.id,
            title: data.title,
            description: data.description ?? "",
            status: data.status,
            priority: data.priority,
            assignedTo: data.assigned_to ?? "",
            dueDate: data.due_date ?? "",
          });
        }
      };
      fetchTask();
    }
  }, [id]);

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
      status: task.status,
      priority: task.priority,
      assigned_to: task.assignedTo || null,
      due_date: task.dueDate || null,
    };

    try {
      let response;
      if (id !== "") {
        // Uppdatera befintlig uppgift
        response = await supabase
          .from("todotasks")
          .update(payload)
          .eq("id", id);
      } else {
        // Skapa ny uppgift
        response = await supabase.from("todotasks").insert([payload]);
      }

      if (response.error) throw response.error;

      setIsSubmitted(true);
      // setTask(initialFormState);
      setTimeout(() => setIsSubmitted(false), 3000);

      // Call onClose with refresh flag after successful submission
      if (onClose) {
        setTimeout(() => onClose(true), 1500); // Close modal and refresh after 1.5s
      }
    } catch (err) {
      setErrorMsg(err.message ?? "Something dysfunctioned.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--gray-2)] border border-[var(--gray-a6)] rounded-[var(--radius-3)] p-6 shadow-sm font-sans text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--gray-12)] mb-2">
          {id === "" ? "Create a New Task" : "Update Task '" + task.title + "'"}
        </h1>
        <p className="text-[var(--gray-11)]">
          {id === ""
            ? "Fill out the details below to add a new task to do."
            : "Edit the details below to update the task."}
        </p>
      </div>

      {isSubmitted && (
        <div className="...">
          <span className="block sm:inline">
            {id !== ""
              ? "Task updated successfully!"
              : "Task created successfully!"}
          </span>
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
          {loading ? "Saving..." : id !== "" ? "Uppdate Task" : "Create Task"}
        </button>
      </form>
    </div>
  );
}
