import { useState } from "react";

interface TaskFilterProps {
  onFilterChange: (filters: { category_id?: string; status?: string; due_date?: string }) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ onFilterChange }) => {
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const handleFilterChange = () => {
    onFilterChange({
      category_id: category || undefined,
      status: status || undefined,
      due_date: dueDate || undefined,
    });
  };

  return (
    <div className="flex space-x-4 p-4 border-b">
      {/* Category Filter */}
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border" onBlur={handleFilterChange}>
        <option value="">All Categories</option>
        <option value="1">Work</option>
        <option value="2">Personal</option>
      </select>

      {/* Status Filter */}
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border" onBlur={handleFilterChange}>
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Due Date Filter */}
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="p-2 border"
        onBlur={handleFilterChange}
      />
    </div>
  );
};

export default TaskFilter;
