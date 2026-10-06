import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createComanda } from '../../services/comandas.service';
import { getMesas } from '../../services/mesas.service';
import { getProductos } from '../../services/productos.service';
import { formatearPrecio, mensajeDeError } from '../../utils/formato';

// Apertura de mesa: el mozo elige la mesa, carga los productos y los envía a la cocina.
const NuevaComandaPage = () => {
  const navigate = useNavigate();

  // Datos que vienen del backend para los desplegables
  const [mesas, setMesas] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  // Formulario
  const [mesa, setMesa] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);

  // Listado temporal de productos antes de confirmar el envío
  const [itemsTemporal, setItemsTemporal] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [resMesas, resProductos] = await Promise.all([getMesas(), getProductos()]);
      // Una mesa ocupada ya tiene comanda abierta, así que no se puede elegir.
      setMesas(resMesas.data.filter((m) => m.estado !== 'Ocupada'));
      setProductosDisponibles(resProductos.data);
    } catch (error) {
      toast.error(mensajeDeError(error, 'No se pudieron cargar las mesas y productos'));
    }
  }

  function agregarAlListado(e) {
    e.preventDefault();
    if (!productoSeleccionado || Number(cantidad) < 1) return;

    // Busco los datos del producto seleccionado para mostrarlos en el listado temporal.
    const productoInfo = productosDisponibles.find(p => p.id === Number(productoSeleccionado));

    // Si ya estaba en la lista, se suma la cantidad en vez de repetirlo.
    const existe = itemsTemporal.find(item => item.id === productoInfo.id);
    if (existe) {
      setItemsTemporal(itemsTemporal.map(item =>
        item.id === productoInfo.id ? { ...item, cantidad: item.cantidad + Number(cantidad) } : item
      ));
    } else {
      setItemsTemporal([...itemsTemporal, { ...productoInfo, cantidad: Number(cantidad) }]);
    }

    // Reseteamos el formulario de producto
    setProductoSeleccionado('');
    setCantidad(1);
  }

  function quitarDelListado(id) {
    setItemsTemporal(itemsTemporal.filter(item => item.id !== id));
  }

  async function confirmarEnvio() {
    if (!mesa) {
      toast.error('Elegí la mesa');
      return;
    }
    if (itemsTemporal.length === 0) {
      toast.error('Cargá al menos un producto');
      return;
    }

    setEnviando(true);
    try {
      // El mozo no se manda: el backend lo toma del usuario logueado.
      await createComanda({
        id_mesa: Number(mesa),
        detalles: itemsTemporal.map(item => ({ id_producto: item.id, cantidad: item.cantidad }))
      });
      toast.success(`Comanda de la mesa ${mesa} enviada a cocina`);
      navigate('/comandas');
    } catch (error) {
      toast.error(mensajeDeError(error, 'Error al crear la comanda'));
    } finally {
      setEnviando(false);
    }
  }

  const total = itemsTemporal.reduce((suma, item) => suma + (item.precio ?? 0) * item.cantidad, 0);

  return (
    <div className="page-container">
      <h1 className="page-title">Nueva comanda</h1>

      {/* Dos columnas en pantallas grandes: formulario a la izquierda, listado a la derecha */}
      <div className="dos-columnas">
        <div className="panel">
          <div className="form-group">
            <label htmlFor="comanda-mesa">Mesa *</label>
            <select id="comanda-mesa" value={mesa} onChange={(e) => setMesa(e.target.value)}>
              <option value="">-- Elegir mesa --</option>
              {mesas.map(m => (
                <option key={m.id} value={m.id}>Mesa {m.id} ({m.capacidad} personas){m.estado === 'Reservada' ? ' - Reservada' : ''}</option>
              ))}
            </select>
          </div>

          <form onSubmit={agregarAlListado} className="form-group">
            <label htmlFor="comanda-producto">Cargar producto</label>
            <div className="input-con-boton">
              <select id="comanda-producto" value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
                <option value="">Seleccione un producto...</option>
                {productosDisponibles.map(prod => (
                  <option key={prod.id} value={prod.id}>{prod.nombre} - {formatearPrecio(prod.precio)}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="input-cantidad"
                aria-label="Cantidad"
              />
              <button type="submit" className="btn btn-secondary" title="Agregar">
                <Plus size={16} />
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <h2 className="panel-title">Productos a enviar</h2>
          {itemsTemporal.length === 0 ? (
            <p className="text-muted">Todavía no cargaste productos.</p>
          ) : (
            <ul className="lista-simple">
              {itemsTemporal.map(item => (
                <li key={item.id} className="item-lista">
                  <span>{item.cantidad} x {item.nombre}</span>
                  <span>
                    {formatearPrecio((item.precio ?? 0) * item.cantidad)}
                    <button className="btn btn-icon btn-delete" onClick={() => quitarDelListado(item.id)} title="Quitar">
                      <Trash2 size={16} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="total"><span>Total</span><strong>{formatearPrecio(total)}</strong></p>

          <button className="btn btn-primary btn-block" onClick={confirmarEnvio} disabled={enviando || itemsTemporal.length === 0}>
            {enviando ? 'Enviando...' : 'Confirmar y enviar a cocina'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaComandaPage;
