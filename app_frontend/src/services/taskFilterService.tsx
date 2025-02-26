import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const fetchFilteredTasks = async (filters: { category_id?: string; status?: string; due_date?: string }) => {
    const token = localStorage.getItem("authToken");

    try {
        const queryParams = new URLSearchParams(filters as any).toString();
        const response = await axios.get(`${API_URL}/task/filter_task/?${queryParams}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,

            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching filtered tasks:", error);
        throw error;
    }
};

export const fetchAssignedTasks = async () => {
    const token = localStorage.getItem("authToken");
  
    try {
      const response = await axios.get(`${API_URL}/task/assigned_task_list/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      throw error;
    }
  };
  
