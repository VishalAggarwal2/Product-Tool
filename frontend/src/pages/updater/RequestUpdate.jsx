import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { requestUpdate } from '../../api';

export default function RequestUpdate() {
  const { id } = useParams();
  const [updatedData, setUpdatedData] = useState({ Karthik: "", Milpitas: "", Fremont: "" });

  const currentUserId = "PUT_LOGGED_IN_USER_ID_HERE"; // Replace with actual logged-in user id

  const handleChange = (e) => {
    setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await requestUpdate({
      product_id: id,
      updated_data: updatedData,
      updated_by: currentUserId,
    });
    alert('Update request submitted!');
  };

  return (
    <div className="request-update">
      <h2>Request Update</h2>
      <form onSubmit={handleSubmit}>
        <label>Karthik</label>
        <input name="Karthik" value={updatedData.Karthik} onChange={handleChange} />
        <label>Milpitas</label>
        <input name="Milpitas" value={updatedData.Milpitas} onChange={handleChange} />
        <label>Fremont</label>
        <input name="Fremont" value={updatedData.Fremont} onChange={handleChange} />
        <button type="submit">Submit</button>
      </form>

      <style>{`
        .request-update { padding: 20px; font-family: Arial, sans-serif; }
        form { display: flex; flex-direction: column; gap: 12px; max-width: 300px; }
        label { font-weight: bold; }
        input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        input:focus { border-color: #2196f3; outline: none; }
        button { padding: 8px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #45a049; }
      `}</style>
    </div>
  );
}
