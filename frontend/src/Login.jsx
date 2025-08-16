import { useState } from 'react';
import API from './api';

export default function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/login', { name, password });
      if (res.data && res.data.user) {
        localStorage.setItem('loggedInUser', JSON.stringify(res.data.user));
        alert(`✅ Logged in as ${res.data.user.name} (${res.data.user.role})`);
        setName('');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(`❌ ${err.response.data.error}`);
      } else {
        alert('❌ Error logging in.');
      }
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
      <h2 style={styles.heading}>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="password"
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) => (e.target.style.background = '#45a049')}
          onMouseOut={(e) => (e.target.style.background = '#4CAF50')}
        >
          Login
        </button>
      </form>
    </div>
  );
}
