import { useState, useEffect } from "react";
import { fetchAssignedTasks } from "../services/taskFilterService";

interface Task {
  id: number;
  title: string;
  due_date: string;
  status: string;
}

const AssignedTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const data = await fetchAssignedTasks();
        setTasks(data);
      } catch (err) {
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };
    getTasks();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">My Assigned Tasks</h2>

      {loading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {tasks.length === 0 && !loading && <p>No tasks assigned to you.</p>}

      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="p-4 border rounded-lg shadow">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-gray-600">Due: {task.due_date}</p>
            <span className={`px-3 py-1 text-white rounded ${task.status === "Completed" ? "bg-green-500" : "bg-yellow-500"}`}>
              {task.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssignedTasks;
