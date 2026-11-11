import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RUTA_POR_ROL } from '../utils/roles';

export default function RutaProtegida({ roles }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={RUTA_POR_ROL[usuario.rol] ?? '/login'} replace />;
  }

  return <Outlet />;
}
