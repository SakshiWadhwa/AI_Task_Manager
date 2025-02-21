import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const fetchCategories = async () => {
    const token = localStorage.getItem("authToken");

    try {
        const response = await axios.get(`${API_URL}/task/categories/`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,

        },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching category:", error);
        throw error;
    }
};
