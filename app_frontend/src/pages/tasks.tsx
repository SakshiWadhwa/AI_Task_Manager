import { useEffect, useState } from "react";
import { fetchTasks } from "../services/taskService";
import { fetchFilteredTasks } from "../services/taskFilterService"

import TaskFilter from "../components/TaskFilter";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  category: { [key: string]: any };
}

const TaskList = () => {
  const [sortBy, setSortBy] = useState<string>("due_date"); // Default sorting by due date
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const [filters, setFilters] = useState<{ category_id?: string; status?: string; due_date?: string }>({});

  useEffect(() => {
    const getTasks = async () => {
      setLoading(true);
      try {
        let data;
        if (Object.keys(filters).length > 0) {
          data = await fetchFilteredTasks(filters);
        } else {
          data = await fetchTasks();
        }
        
        // Ensure unique tasks by using a Map
        const uniqueTasks = Array.from(new Map(data.map(task => [task.id, task])).values());
        
        setTasks(uniqueTasks);
        setCurrentPage(1);
        setError(null);
      } catch (err) {
        setError("Failed to fetch tasks.");
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, [filters]);

  if (loading) return <p className="text-center">Loading tasks...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // Sorting function
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "due_date") {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (sortBy === "status") {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);

  const nextPage = () => {
    if (currentPage < Math.ceil(tasks.length / tasksPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };



  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Task List</h1>
      <TaskFilter onFilterChange={setFilters} />

      {/* Sorting Dropdown */}
      <div className="mb-4">
        <label className="mr-2">Sort By:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="due_date">Due Date</option>
          <option value="status">Status</option>
        </select>
      </div>

      {currentTasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks available.</p>
      ) : (
        <ul className="space-y-4">
          {currentTasks.map((task) => (
            <li key={task.id} className="p-4 border rounded-lg shadow-md">
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <p className="text-sm text-gray-600">{task.description}</p>
              <p className="text-sm">
                <strong>Status:</strong> <span className="text-blue-500">{task.status}</span>
              </p>
              <p className="text-sm text-gray-500">
                <strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Category:</strong> <span className="text-blue-500">{task.category.name}</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-4">
      <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`p-2 border rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          Previous
        </button>
        <span>Page {currentPage} of {Math.ceil(tasks.length / tasksPerPage)}</span>
        <button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(tasks.length / tasksPerPage)}
          className={`p-2 border rounded ${currentPage === Math.ceil(tasks.length / tasksPerPage) ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TaskList;