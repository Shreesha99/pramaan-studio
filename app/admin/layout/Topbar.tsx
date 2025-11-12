"use client";

interface TopbarProps {
  admin: {
    username: string;
    displayName?: string;
  };
  onLogout: () => void;
}

export default function Topbar({ admin, onLogout }: TopbarProps) {
  return (
    <header className="bg-white shadow flex justify-between items-center px-6 py-3">
      <h2 className="font-semibold text-lg">Dashboard</h2>

      {admin && (
        <div className="flex items-center gap-3">
          <span className="text-gray-600">
            {admin.displayName || admin.username}
          </span>
          <button
            onClick={onLogout}
            className="text-sm bg-black text-white px-3 py-1 rounded-full hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
