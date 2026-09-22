import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  function iniciarSesion(usuarioNuevo, tokenNuevo) {
    setUsuario(usuarioNuevo);
    setToken(tokenNuevo);
    localStorage.setItem('usuario', JSON.stringify(usuarioNuevo));
    localStorage.setItem('token', tokenNuevo);
  }

  function cerrarSesion() {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }

  return (
    <AuthContext.Provider value={{ usuario, token, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}