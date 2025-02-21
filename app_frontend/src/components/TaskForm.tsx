import { useState, useEffect } from "react";
import { fetchCategories } from "../services/categoryService"; // Import API service

interface Task {
  id?: number;
  title: string;
  description: string;
  category_id: string;
  due_date: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
}

interface TaskFormProps {
  task?: Task;
  onSave: (taskData: Task) => void;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Task>({
    title: task?.title || "",
    description: task?.description || "",
    category_id: task?.category_id || "",
    due_date: task?.due_date || "",
    status: task?.status || "Pending",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch categories from API when the component mounts
  useEffect(() => {
    const getCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    getCategories();
  }, []);

  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) newErrors.title = "Task title is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.due_date) newErrors.due_date = "Due date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      <h2 className="text-2xl font-bold text-center mb-4">{task ? "Edit Task" : "Create Task"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div>
          <label className="block text-gray-700 font-medium">Task Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
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
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
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
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
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

        {/* Due Date Picker */}
        <div>
          <label className="block text-gray-700 font-medium">Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
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
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
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
