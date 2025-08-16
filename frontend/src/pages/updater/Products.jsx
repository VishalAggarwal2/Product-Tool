import { useEffect, useState } from "react";
import API, { getProducts } from "../../api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [loggedInUser, setLoggedInUser] = useState(null);

  const editableFields = ["Karthik", "Milpitas", "Fremont"];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (storedUser) setLoggedInUser(storedUser);

    getProducts().then((res) => setProducts(res.data));
  }, []);

  const handleEdit = (index) => {
    setEditIndex(index);
    const product = products[index];
    const data = editableFields.reduce((acc, field) => {
      acc[field] = { prev: product[field] ?? "", new: product[field] ?? "" };
      return acc;
    }, {});
    setEditData(data);
  };

  const handleChange = (e, field) => {
    const value = e.target.value;
    if (value === "" || !isNaN(value)) {
      setEditData({
        ...editData,
        [field]: { ...editData[field], new: value },
      });
    }
  };

  const handleSave = async (id) => {
    if (!loggedInUser) {
      alert("❌ Please log in first.");
      return;
    }

    try {
      const updated_data = {};
      editableFields.forEach((field) => {
        updated_data[field] = editData[field].new;
      });

      await API.post(
        "/update-request",
        { productId: id, updated_data },
        { headers: { userid: loggedInUser.id } }
      );
      alert("✅ Product update request submitted!");
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Failed to submit update request.");
    }
  };

  return (
    <div className="products-page">
      <h2 className="title">Products</h2>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Barcode</th>
            {editableFields.map((field) => (
              <th key={field}>{field}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, index) => (
            <tr key={p._id}>
              <td>{p["Item Name"]}</td>
              <td>{p["Barcode"]}</td>
              {editableFields.map((field) => (
                <td key={field}>
                  {editIndex === index ? (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "12px", color: "#888" }}>
                        Prev: {editData[field].prev}
                      </span>
                      <input
                        type="number"
                        value={editData[field].new}
                        onChange={(e) => handleChange(e, field)}
                      />
                    </div>
                  ) : (
                    p[field] ?? "-"
                  )}
                </td>
              ))}
              <td>
                {editIndex === index ? (
                  <>
                    <button onClick={() => handleSave(p._id)} className="btn save">
                      Save
                    </button>
                    <button onClick={() => setEditIndex(null)} className="btn cancel">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(index)} className="btn edit">
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .products-page { padding: 20px; font-family: Arial, sans-serif; }
        .title { font-size: 22px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        input { padding: 6px; width: 100%; border: 1px solid #ccc; border-radius: 4px; }
        input:focus { border-color: #2196f3; outline: none; }
        .btn { padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; margin-right: 4px; }
        .btn.edit { background: #2196f3; color: white; }
        .btn.edit:hover { background: #1976d2; }
        .btn.save { background: #4caf50; color: white; }
        .btn.save:hover { background: #45a049; }
        .btn.cancel { background: #f44336; color: white; }
        .btn.cancel:hover { background: #d32f2f; }
        td input { text-align: right; }
      `}</style>
    </div>
  );
}
