"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  email: string;
  role: string;
  isBanned: boolean;
  profile?: {
    firstName: string;
    lastName: string;
  };
};

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const query = search ? `?search=${search}` : "";
      const res = await fetch(`http://localhost:4000/admin/users${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, search]);

  const toggleBan = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u));
      }
    } catch (error) {
      console.error("Failed to toggle ban", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <div className="w-72">
          <Input 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : "No Profile"}
                </td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                    u.role === "CAREGIVER" ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.isBanned ? (
                    <span className="text-red-600 font-medium">Banned</span>
                  ) : (
                    <span className="text-green-600 font-medium">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant={u.isBanned ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => toggleBan(u.id)}
                    className={u.isBanned ? "border-amber-500 text-amber-600 hover:bg-amber-50" : ""}
                  >
                    {u.isBanned ? "Unban" : "Ban"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
