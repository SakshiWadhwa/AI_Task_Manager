import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const fetchTasks = async () => {
    const token = localStorage.getItem("authToken");

    try {
        const response = await axios.get(`${API_URL}/task/`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,

        },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};

export const createTask = async (taskData: any) => {
    const token = localStorage.getItem("authToken");
    console.log("Sending request with data:", JSON.stringify(taskData)); // Debug
    try {
        const response = await axios.post(`${API_URL}/task/create/`, taskData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,

            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};

export const updateTasks = async (taskId: number, updatedTaskData: object) => {
    const token = localStorage.getItem("authToken");

    try {
        const response = await axios.put(`${API_URL}/task/${taskId}/update/`, updatedTaskData, { 
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
};

export const deleteTask = async (taskId: number) => {
    const token = localStorage.getItem("authToken");
  
    try {
      await axios.delete(`${API_URL}/task/${taskId}/delete/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };
  