import { useEffect, useState } from "react";
import { fetchAssignedTasks } from "../services/taskFilterService"; // Import the function

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: string;
}

export default function AssignedTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchAssignedTasks();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching assigned tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-500">My Assigned Tasks</h2>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks assigned to you.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="border p-4 rounded mb-2 text-gray-500">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p>{task.description}</p>
              <p><strong>Due Date:</strong> {task.due_date}</p>
              <p><strong>Status:</strong> {task.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
