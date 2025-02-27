import { useState, useEffect } from "react";
import { addTaskComment } from "../services/taskService"

const TaskCommentsForm = ({ taskId, addComment }) => {
    const [commentText, setCommentText] = useState("");
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim() === "") return;
        try {
          const newComment = await addTaskComment(taskId, commentText);
          addComment(newComment);
          setCommentText(""); // Clear the textarea after submission
        } catch (error) {
          console.error("Failed to add comment:", error.message);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows="4"
            required
          />
          <button type="submit">Add Comment</button>
        </form>
    );
};
    
export default TaskCommentsForm;
