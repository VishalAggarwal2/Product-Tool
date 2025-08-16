import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

// Admin
import CreateUser from './pages/admin/CreateUser';
import ManageRoles from './pages/admin/ManageRoles';

// Updater
import Products from './pages/updater/Products';
import RequestUpdate from './pages/updater/RequestUpdate';

// Approver
import PendingUpdates from './pages/approver/PendingUpdates';

// Auth

import './styles/global.css'; // fixed case from CSS to css (important for some OS)
import Login from './Login';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin/create-user" element={<CreateUser />} />
        <Route path="/admin/manage-roles" element={<ManageRoles />} />

        {/* Updater */}
        <Route path="/updater/products" element={<Products />} />
        <Route path="/updater/request/:id" element={<RequestUpdate />} />

        {/* Approver */}
        <Route path="/approver/pending" element={<PendingUpdates />} />
      </Routes>
    </BrowserRouter>
  );
}
