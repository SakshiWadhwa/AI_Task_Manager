// components/Sidebar.tsx
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-200 p-4">
      <ul>
        <li>
          <Link href="/dashboard">
            <a className="text-black">Dashboard</a>
          </Link>
        </li>
        <li>
          <Link href="/tasks">
            <a className="text-black">Tasks</a>
          </Link>
        </li>
        <li>
          <Link href="/profile">
            <a className="text-black">Profile</a>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
