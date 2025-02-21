import { useEffect, useState } from "react";
import { fetchTasks, createTask } from "../services/taskService";
import { fetchFilteredTasks } from "../services/taskFilterService"

import TaskFilter from "../components/TaskFilter";
import TaskForm from "../components/TaskForm";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleNewTaskSave = async (taskData: Task) => {
    console.log("Sending task data:", taskData);
    try {
      const newTask = await createTask(taskData);
      setTasks([...tasks, newTask]); // Update task list
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to create task.");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading tasks...</p>;
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
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Task List</h1>
      <TaskFilter filters={filters} onFilterChange={setFilters} />

      {/* New Task Button */}
      <div className="mb-4 text-right">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          New Task
        </button>
      </div>

      {/* Task Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <TaskForm onSave={handleNewTaskSave} onCancel={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Sorting Dropdown */}
      <div className="mb-4 flex items-center space-x-2">
        <label className="text-gray-600 font-medium">Sort By:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded focus:ring focus:ring-blue-300"
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
            <li key={task.id} className="p-5 bg-gray-100 border rounded-lg shadow-md hover:shadow-lg transition">
              <h2 className="text-lg font-semibold text-gray-700">{task.title}</h2>
              <p className="text-sm text-gray-600">{task.description}</p>
              <p className="text-sm text-gray-500">
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