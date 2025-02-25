import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000'; // Replace with your actual API URL

export const registerUser = async (email: string, password: string, password2: string) => {
  const response = await axios.post(`${API_URL}/user/register/`, {
    email,
    password,
    password2
  });
  return response.data;
}

// Login API call
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/user/login/`, {
      email,
      password,
    });

    // Assuming the API returns a JWT token
    const { token } = response.data;
    // Store token in localStorage (or cookies, based on preference)
    localStorage.setItem('authToken', token);

    return response.data; // Return the response or token as needed
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Logout API call
export const logoutUser = () => {
  localStorage.removeItem('authToken');
};

export const fetchUsers = async () => {
  const token = localStorage.getItem("authToken");

  try {
      const response = await axios.get(`${API_URL}/user/profile/get/`, { 
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
  }
};

export const assignTask = async (taskId: number, userId: number) => {
  const token = localStorage.getItem("authToken");
  console.log("t: ", taskId, " u: ", userId)
  try {
      const response = await axios.patch(`${API_URL}/task/${taskId}/assign_unassign_task/`, { 
          user_id: userId,
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error assiging task:", error);
      throw error;
  }
};