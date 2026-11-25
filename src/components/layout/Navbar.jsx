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
    <nav className="sticky top-0 z-100 flex flex-col items-start justify-between gap-2 border-b border-border bg-surface px-4 py-3 md:min-h-16 md:flex-row md:items-center md:px-8 md:py-2">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-3 text-xl font-bold tracking-wide text-primary">RestoFlow</span>
        {links.map(({ to, label }, i) => (
          <Fragment key={to}>
            {i > 0 && <span className="text-border">|</span>}
            <NavLink to={to} className={({ isActive }) => `rounded-[10px] px-2.5 py-1.5 text-sm transition-colors ${isActive ? 'bg-primary/12 text-primary' : 'text-muted hover:bg-surface-2 hover:text-fg'}`}>{label}</NavLink>
          </Fragment>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {usuario && <span>{usuario.nombre} ({usuario.rol})</span>}
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          <LogOut size={16} /> Salir
        </button>
      </div>
    </nav>
  );
}
