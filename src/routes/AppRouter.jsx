import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

// Vistas
import ProductosPage from '../pages/Productos/ProductosPage';
// Descomentar a medida que cada integrante cree su página:
// import HomePage from '../pages/Home/HomePage';
// import ReservasPage from '../pages/Reservas/ReservasPage';
// import MesasPage from '../pages/Mesas/MesasPage';
// import ComandasPage from '../pages/Comandas/ComandasPage';
// import CocinaPage from '../pages/Cocina/CocinaPage';
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
          {/* <Route path="/cocina" element={<CocinaPage />} /> */}
          {/* <Route path="/usuarios" element={<UsuariosPage />} /> */}
        </Routes>
      </main>
    </>
  );
}