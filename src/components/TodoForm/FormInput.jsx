// Reusable Input Field Component
const FormInput = ({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  children,
}) => (
  <div>
    
    <label
      htmlFor={id}
      className="block text-sm font-medium text-[var(--gray-11)] mb-2"
    >
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows="4"
        className="w-full bg-[var(--gray-a2)] border border-[var(--gray-a6)] rounded-[var(--radius-3)] p-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        required={required}
      />
    ) : type === "select" ? (
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-stone-800 border border-[var(--gray-a6)] rounded-[var(--radius-3)] p-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        required={required}
      >
        {children}
      </select>
    ) : (
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
       className="w-full bg-[var(--gray-a2)] border border-[var(--gray-a6)] rounded-[var(--radius-3)] p-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        required={required}
      />
    )}
  </div>
);
export default FormInput;