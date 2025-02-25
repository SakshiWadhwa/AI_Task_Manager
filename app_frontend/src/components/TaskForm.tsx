import { useState, useEffect } from "react";
import { fetchCategories } from "../services/categoryService"; // Import API service
import {fetchUsers, assignTask} from "../services/authService" ;

interface Task {
  id?: number;
  title: string;
  description: string;
  category_id: string;
  due_date: string;
  status: string;
  assigned_to_id?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Users {
  id: string;
  email: string;
}

interface TaskFormProps {
  task?: Task;
  onSave: (taskData: Task) => void;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Task>({
    id: task?.id,  // Include task ID
    title: task?.title || "",
    description: task?.description || "",
    category_id: task?.category_id || "",
    due_date: task?.due_date || "",
    status: task?.status || "Pending",
    assigned_to_id: task?.assigned_to_id,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isAssigning, setIsAssigning] = useState(false);

  // Reset formData whenever task changes
  useEffect(() => {
    setFormData({
      id: task?.id,
      title: task?.title || "",
      description: task?.description || "",
      category_id: task?.category_id || "",
      due_date: task?.due_date || "",
      status: task?.status || "pending",
      assigned_to_id: task?.assigned_to_id,
    });
  }, [task]); // Runs whenever `task` changes

  // Fetch categories from API when the component mounts
  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    getCategories();
  }, []);

  // Fetch users from API when the component mounts
  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    getUsers();
  }, []);

  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) newErrors.title = "Task title is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.due_date) newErrors.due_date = "Due date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    console.log("formData: ", formData.id)
    if (name === "assigned_to_id" && formData.id) {
      setIsAssigning(true);
      try {
        await assignTask(formData.id, Number(value));
        setIsAssigning(false);
      } catch (error) {
        console.error("Failed to assign task:", error);
        setIsAssigning(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
        // Convert status to lowercase before submitting
      const updatedTaskData = {
        ...formData,
        status: formData.status.toLowerCase(),  // Ensure status is lowercase
      };
      onSave(updatedTaskData);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4  text-gray-800">{task ? "Edit Task" : "Create Task"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div>
          <label className="block text-gray-700 font-medium">Task Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300 text-gray-600"
            placeholder="Enter task title"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300 text-gray-600"
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium">Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300 text-gray-500"
          >
            <option value="">Select Category</option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option disabled>Loading categories...</option>
            )}
          </select>
          {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id}</p>}
        </div>

         {/* Users Dropdown */}
         <div>
          <label className="block text-gray-700 font-medium">Assigned To</label>
          <select
            name="assigned_to_id"
            value={formData.assigned_to_id ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300 text-gray-500"
          >
            <option value="">Assign Task</option>
            {users.length > 0 ? (
              users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))
            ) : (
              <option disabled>Loading Users...</option>
            )}
          </select>
          {isAssigning && <p className="text-blue-500 text-sm">Assigning task...</p>}
        </div>

        {/* Due Date Picker */}
        <div>
          <label className="block text-gray-600 font-medium">Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300 text-gray-500"
          />
          {errors.due_date && <p className="text-red-500 text-sm">{errors.due_date}</p>}
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300 text-gray-500"
          >
            <option value="Pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            disabled={Object.keys(errors).length > 0}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            {task ? "Update Task" : "Create Task"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
