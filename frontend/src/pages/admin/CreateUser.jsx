import { useState } from 'react';
import { createUser } from '../../api';

export default function CreateUser() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createUser({ name, password, role });
      alert('✅ User created successfully!');
      if (res.data && res.data._id) {
        localStorage.setItem('loggedInUser', JSON.stringify(res.data));
      }
      setName('');
      setPassword('');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to create user.');
    }
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '400px',
      margin: '40px auto',
      background: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center',
      color: '#333',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    input: {
      padding: '10px',
      fontSize: '14px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      outline: 'none',
    },
    select: {
      padding: '10px',
      fontSize: '14px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      background: '#fff',
      outline: 'none',
    },
    button: {
      padding: '10px',
      fontSize: '15px',
      borderRadius: '5px',
      border: 'none',
      background: '#4CAF50',
      color: 'white',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create User</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          style={styles.select}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="updater">Updater</option>
          <option value="approver">Approver</option>
        </select>
        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) => (e.target.style.background = '#45a049')}
          onMouseOut={(e) => (e.target.style.background = '#4CAF50')}
        >
          Create
        </button>
      </form>
    </div>
  );
}
