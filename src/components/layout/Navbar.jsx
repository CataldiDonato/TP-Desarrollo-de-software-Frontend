import { Fragment } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LINKS_POR_ROL = {
  Administrador: [
    { to: '/', label: 'Home' },
    { to: '/mesas', label: 'Mesas' },
    { to: '/reservas', label: 'Reservas' },
    { to: '/comandas', label: 'Comandas' },
    { to: '/cocina', label: 'Cocina KDS' },
    { to: '/usuarios', label: 'Usuarios' },
    { to: '/productos', label: 'Productos' },
    { to: '/categorias', label: 'Categorías' },
    { to: '/medios-pago', label: 'Medios de pago' },
  ],
  Mozo: [
    { to: '/mesas', label: 'Mesas' },
    { to: '/reservas', label: 'Reservas' },
    { to: '/comandas', label: 'Comandas' },
    { to: '/productos', label: 'Productos' },
  ],
  Cocinero: [
    { to: '/cocina', label: 'Cocina KDS' },
  ],
};

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const links = usuario ? LINKS_POR_ROL[usuario.rol] ?? [] : [];

  function handleLogout() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="nav-group">
        <span className="navbar-brand">RestoFlow</span>
        {links.map(({ to, label }, i) => (
          <Fragment key={to}>
            {i > 0 && <span className="separator">|</span>}
            <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>
          </Fragment>
        ))}
      </div>
      <div className="nav-group">
        {usuario && <span>{usuario.nombre} ({usuario.rol})</span>}
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          <LogOut size={16} /> Salir
        </button>
      </div>
    </nav>
  );
}
