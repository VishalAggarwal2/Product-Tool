import { useEffect, useState } from 'react';
import API, { updateUserRole } from '../../api';

export default function ManageRoles() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get('/users').then(res => setUsers(res.data));
  }, []);

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, { role });
    alert('Role updated!');
  };

  const containerStyle = {
    maxWidth: '500px',
    margin: '20px auto',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    fontFamily: 'Arial, sans-serif',
  };

  const headerStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
    color: '#333',
  };

  const userCardStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    background: '#fff',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    marginBottom: '10px',
    transition: 'background 0.2s',
  };

  const userNameStyle = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#555',
  };

  const selectStyle = {
    padding: '6px 10px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Manage Roles</h2>
      {users.map(u => (
        <div
          key={u._id}
          style={{
            ...userCardStyle,
            ':hover': { background: '#f1f1f1' },
          }}
        >
          <span style={userNameStyle}>{u.name}</span>
          <select
            style={selectStyle}
            value={u.role}
            onChange={e => handleRoleChange(u._id, e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="updater">Updater</option>
            <option value="approver">Approver</option>
          </select>
        </div>
      ))}
    </div>
  );
}
