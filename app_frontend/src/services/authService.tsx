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