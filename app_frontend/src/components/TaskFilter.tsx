import { useState } from "react";

interface TaskFilterProps {
    filters: { category_id?: string; status?: string; due_date?: string }; // Accept filters as prop
    onFilterChange: (filters: { category_id?: string; status?: string; due_date?: string }) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ filters, onFilterChange }) => {
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategory(value);
    onFilterChange({...filters, category_id: value || undefined });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatus(value);
    onFilterChange({...filters, status: value || undefined});
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDueDate(value);
    onFilterChange({...filters, due_date: value || undefined });
  };

  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0 p-4 border-b text-gray-500">
      {/* Category Filter */}
      <select value={filters.category_id} onChange={handleCategoryChange} className="p-2 border rounded w-full md:w-auto">
        <option value="">All Categories</option>
        <option value="1">Work</option>
        <option value="2">Personal</option>
      </select>

      {/* Status Filter */}
      <select value={filters.status} onChange={handleStatusChange} className="p-2 border rounded w-full md:w-auto">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Due Date Filter */}
      <input type="date" value={filters.due_date} onChange={handleDueDateChange} className="p-2 border rounded w-full md:w-auto" />
    </div>
  );
};

export default TaskFilter;
