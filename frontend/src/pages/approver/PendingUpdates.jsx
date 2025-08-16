import { useEffect, useState } from "react";
import { getPendingUpdates, approveUpdate } from "../../api";

export default function PendingUpdates() {
  const [updates, setUpdates] = useState([]);

  // Only show these important fields
  const importantFields = ["Karthik", "Milpitas", "Fremont"];

  useEffect(() => {
    getPendingUpdates().then((res) => setUpdates(res.data));
  }, []);

  const handleAction = async (id, action) => {
    await approveUpdate(id, action);
    alert(`Request ${action}d!`);
    setUpdates(updates.filter((u) => u._id !== id));
  };

  return (
    <div className="pending-updates">
      <h2>Pending Updates</h2>

      {updates.length === 0 ? (
        <p>No pending updates 🎉</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                {importantFields.map((field) => (
                  <th key={field}>{field} (Prev → New)</th>
                ))}
                <th>Updated By</th>
                <th>Requested At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((u) => (
                <tr key={u._id}>
                  <td>{u.product_id?.["Item Name"] || "Unnamed Product"}</td>
                  {importantFields.map((field) => (
                    <td key={field}>
                      {u.previous_data?.[field] !== undefined || u.updated_data?.[field] !== undefined
                        ? `${u.previous_data?.[field] ?? "-"} → ${u.updated_data?.[field] ?? "-"}` 
                        : "-"}
                    </td>
                  ))}
                  <td>{u.updated_by?.name || "Unknown"}</td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="approve"
                      onClick={() => handleAction(u._id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="reject"
                      onClick={() => handleAction(u._id, "reject")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .pending-updates {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .table-wrapper {
          overflow-x: auto;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          min-width: 800px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
          white-space: nowrap;
        }
        th {
          font-weight: bold;
        }
        td {
          vertical-align: middle;
        }
        .approve {
          background: #4caf50;
          color: white;
          padding: 5px 10px;
          margin-right: 5px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .reject {
          background: #f44336;
          color: white;
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
