
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { RUTA_POR_ROL } from '../../utils/roles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setEnviando(true);
    try {
      const respuesta = await login(email, contrasenia);
      const { token, usuario } = respuesta.data;
      iniciarSesion(usuario, token);
      navigate(RUTA_POR_ROL[usuario.rol] ?? '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center p-4">
      <form className="card flex w-full max-w-[380px] flex-col gap-4 rounded-[15px] px-6 py-8" onSubmit={handleSubmit}>
        <h1 className="page-title">Iniciar sesión</h1>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="contrasenia">Contraseña</label>
          <input id="contrasenia" type="password" value={contrasenia} onChange={(e) => setContrasenia(e.target.value)} required />
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </section>
  );
}