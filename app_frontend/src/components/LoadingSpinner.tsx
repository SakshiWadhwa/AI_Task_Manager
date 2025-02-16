// components/LoadingSpinner.tsx
const LoadingSpinner = () => {
    return (
      <div className="flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  };
  
  export default LoadingSpinner;
  