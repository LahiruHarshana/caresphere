"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

type AuditLog = {
  id: string;
  action: string;
  targetId: string;
  targetType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  admin: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
};

export default function LogsPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:4000/admin/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchLogs();
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">System Audit Logs</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Timestamp</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Admin</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Action</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Target</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No activity logs found.</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium">
                  {log.admin.profile.firstName} {log.admin.profile.lastName}
                  <div className="text-xs font-normal text-gray-400">{log.admin.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    log.action.includes("BAN") ? "bg-red-50 text-red-700" :
                    log.action.includes("VERIFY") ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {log.targetType}: {log.targetId?.substring(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <pre className="text-[10px] bg-gray-50 p-1 rounded max-w-[200px] overflow-hidden text-ellipsis">
                    {JSON.stringify(log.metadata)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
