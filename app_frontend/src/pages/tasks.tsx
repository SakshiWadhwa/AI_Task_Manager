import { useEffect, useState } from "react";
import { fetchTasks, createTask, updateTasks, deleteTask, fetchComments, addTaskComment, deleteTaskComment } from "../services/taskService";
import { fetchFilteredTasks } from "../services/taskFilterService"

import TaskFilter from "../components/TaskFilter";
import TaskForm from "../components/TaskForm";
import {fetchUsers, assignTask} from "../services/authService" ;

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  category: { [key: string]: any };
  assigned_to: { [key: string]: any },

}

interface Users {
  id: string;
  email: string;
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
  const [editingTask, setEditingTask] = useState<Task | null>(null); // New state for editing task
  const [users, setUsers] = useState<Users[]>([]);
  const [comments, setComments] = useState<Record<number, string[]>>({});
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);


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

  useEffect(() => {
    const getComments = async () => {
      try {
        const allComments = await Promise.all(tasks.map(task => fetchComments(task.id)));
        const commentsMap = tasks.reduce((acc, task, index) => {
          acc[task.id] = allComments[index];
          return acc;
        }, {});
        setComments(commentsMap);
      } catch (err) {
        console.error("Failed to fetch comments.");
      }
    };
    if (tasks.length) getComments();
  }, [tasks]);

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

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task); // Set task for editing
    setIsModalOpen(true);  // Open the modal
  };

  const handleTaskUpdate = async (updatedTaskData: Task) => {
    try {
      const updatedTask = await updateTasks(updatedTaskData.id, updatedTaskData); // Update the task
      setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task))); // Update the task list
      setIsModalOpen(false); // Close modal
      setEditingTask(null); // Reset editing state
    } catch (err) {
      alert("Failed to update task.");
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        setTasks(tasks.filter((task) => task.id !== taskId)); // Remove task from list
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    }
  };

  const handleAssignTask = async (taskId: number, selectedUser: Users) => {
    try {
      const updatedTask = await assignTask(taskId, selectedUser.id);
      setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (error) {
      alert("Failed to assign task.");
    }
  };
  
  const handleTaskCommentAdd = async (taskId: number, newComment: string) => {
    if (!newComment.trim()) return;
    try {
      const comment = await addTaskComment(taskId, newComment);
      setComments(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), comment]
      }));
      setNewComment("");
    } catch (err) {
      alert("Failed to add comment.");
    }
  };

  const handleDeleteComment = async (taskId: number, commentId: number) => {
    try {
      await deleteTaskComment(taskId, commentId);
      setComments(prev => ({
        ...prev,
        [taskId]: prev[taskId].filter(comment => comment.id !== commentId)
      }));
    }catch (error) {
      console.log("Failed to delete task comment")
    }
  }

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
          <div className="bg-blue p-6 rounded-lg shadow-lg max-w-md w-full">
            <TaskForm 
              task={editingTask} // Pass the task being edited
              onSave={editingTask ? handleTaskUpdate : handleNewTaskSave} // Conditional handler
              onCancel={() => setIsModalOpen(false)} 
            />
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
              {/* <p className="text-sm text-gray-500">
                <strong>Assigned To:</strong> {task.assigned_to_id ? task.assigned_to_id.username : "Unassigned"}
              </p> */}
              {/* Users Dropdown */}
              <div>
                <label className="text-sm font-semibold block text-gray-500 font-medium">Assigned To</label>
                <select value={task.assigned_to || ""}
                      onChange={(e) => {
                        const selectedUserId = e.target.value;
                        if (selectedUserId === "") {
                          // Optionally handle unassignment here if needed.
                        } else {
                          const selectedUser = users.find(user => String(user.id) === selectedUserId);
                          if (selectedUser) {
                            handleAssignTask(task.id, selectedUser);
                          }
                        }
                      }}
                    className="ml-2 p-1 border rounded text-gray-700">
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                 </select>
              </div>

              <div className="mt-3">
                <h3 className="text-md font-semibold text-gray-500">Comments</h3>
                <div className="max-h-40 overflow-y-auto bg-white p-2 border rounded">
                  {comments[task.id]?.length > 0 ? (
                    comments[task.id].map(comment => (
                      <div key={comment.id} className="border-b p-2 flex justify-between items-center">
                        <p className="text-sm text-gray-700">{comment.text}</p>
                        <button
                          className="text-red-500 text-xs"
                          onClick={() => handleDeleteComment(task.id, comment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No comments yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-2 flex">
                {/* <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="border rounded px-2 py-1 flex-grow text-gray-600"
                  placeholder="Add a comment"
                /> */}
                <input
                  type="text"
                  value={newComment[task.id] || ""}
                  onChange={(e) => setNewComment(prev => ({ ...prev, [task.id]: e.target.value }))}
                  placeholder="Add a comment..."
                  className="flex-1 border p-2 rounded text-sm text-gray-600"
                />
                <button
                  className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleTaskCommentAdd(task.id, newComment[task.id])}
                >
                  Add
                </button>
              </div>

              {/* Edit Button */}
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => handleTaskEdit(task)}
                  className="text-blue-500 hover:text-blue-700 mt-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleTaskDelete(task.id)}
                  className="bg-red-500 text-white  px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-4 text-gray-500">
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