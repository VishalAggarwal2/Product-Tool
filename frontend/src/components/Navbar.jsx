import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Create User", path: "/admin/create-user" },
    { label: "Manage Roles", path: "/admin/manage-roles" },
    { label: "Products", path: "/updater/products" },
    { label: "Pending Updates", path: "/approver/pending" },
    { label: "Login", path: "/login" }, // Added login path
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
