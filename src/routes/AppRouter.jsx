import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

// Vistas
import ProductosPage from '../pages/Productos/ProductosPage';
import CocinaPage from '../pages/Productos/Cocina/CocinaPage';
// Descomentar a medida que cada integrante cree su página:
// import HomePage from '../pages/Home/HomePage';
// import ReservasPage from '../pages/Reservas/ReservasPage';
// import MesasPage from '../pages/Mesas/MesasPage';
// import ComandasPage from '../pages/Comandas/ComandasPage';
// import UsuariosPage from '../pages/Usuarios/UsuariosPage';

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/productos" element={<ProductosPage />} />
          {/* <Route path="/" element={<HomePage />} /> */}
          {/* <Route path="/reservas" element={<ReservasPage />} /> */}
          {/* <Route path="/mesas" element={<MesasPage />} /> */}
          {/* <Route path="/comandas/*" element={<ComandasPage />} /> */}
          <Route path="/cocina" element={<CocinaPage />} />
          {/* <Route path="/usuarios" element={<UsuariosPage />} /> */}
        </Routes>
      </main>
    </>
  );
}
