import { useState } from "react";

interface TaskFilterProps {
  onFilterChange: (filters: { category_id?: string; status?: string; due_date?: string }) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ onFilterChange }) => {
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategory(value);
    onFilterChange({ category_id: value || undefined });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatus(value);
    onFilterChange({ status: value || undefined});
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDueDate(value);
    onFilterChange({ due_date: value || undefined });
  };

  return (
    <div className="flex space-x-4 p-4 border-b">
      {/* Category Filter */}
      <select value={category} onChange={handleCategoryChange} className="p-2 border">
        <option value="">All Categories</option>
        <option value="1">Work</option>
        <option value="2">Personal</option>
      </select>

      {/* Status Filter */}
      <select value={status} onChange={handleStatusChange} className="p-2 border">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Due Date Filter */}
      <input type="date" value={dueDate} onChange={handleDueDateChange} className="p-2 border" />
    </div>
  );
};

export default TaskFilter;
