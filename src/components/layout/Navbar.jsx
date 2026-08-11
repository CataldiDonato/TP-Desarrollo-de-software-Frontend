import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-group">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <span className="separator">|</span>
        <NavLink to="/reservas" className={({ isActive }) => isActive ? 'active' : ''}>Reservas</NavLink>
        <span className="separator">|</span>
        <NavLink to="/mesas" className={({ isActive }) => isActive ? 'active' : ''}>Mesas</NavLink>
        <span className="separator">|</span>
        <NavLink to="/comandas" className={({ isActive }) => isActive ? 'active' : ''}>Comandas</NavLink>
      </div>
      <div className="nav-group">
        <NavLink to="/cocina" className={({ isActive }) => isActive ? 'active' : ''}>Cocina KDS</NavLink>
        <span className="separator">|</span>
        <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'active' : ''}>Usuarios</NavLink>
        <span className="separator">|</span>
        <NavLink to="/productos" className={({ isActive }) => isActive ? 'active' : ''}>Productos</NavLink>
      </div>
    </nav>
  );
}