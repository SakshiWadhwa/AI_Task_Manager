import { useEffect, useState } from "react";
import { fetchTasks } from "../services/taskService";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
}

const TaskList = () => {
  const [sortBy, setSortBy] = useState<string>("due_date"); // Default sorting by due date
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const data = await fetchTasks();
        
        // Ensure unique tasks by using a Map
        const uniqueTasks = Array.from(new Map(data.map(task => [task.id, task])).values());
        
        setTasks(uniqueTasks);
      } catch (err) {
        setError("Failed to fetch tasks.");
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Task List</h1>

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

      {sortedTasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks available.</p>
      ) : (
        <ul className="space-y-4">
          {sortedTasks.map((task) => (
            <li key={task.id} className="p-4 border rounded-lg shadow-md">
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <p className="text-sm text-gray-600">{task.description}</p>
              <p className="text-sm">
                <strong>Status:</strong> <span className="text-blue-500">{task.status}</span>
              </p>
              <p className="text-sm text-gray-500">
                <strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;