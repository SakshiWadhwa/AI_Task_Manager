// components/SkeletonLoader.tsx
const SkeletonLoader = () => {
    return (
      <div className="w-full p-4 space-y-4">
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        <div className="h-6 bg-gray-300 rounded w-5/6"></div>
      </div>
    );
  };
  
  export default SkeletonLoader;
  