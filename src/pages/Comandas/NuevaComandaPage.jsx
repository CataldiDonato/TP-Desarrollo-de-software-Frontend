import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createComanda } from '../../services/comandas.service';
import { getMesas } from '../../services/mesas.service';
import { getProductos } from '../../services/productos.service';
import { ItemComanda } from '../../models/modelos';
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
  const [observaciones, setObservaciones] = useState('');

  // Listado temporal de productos antes de confirmar el envío (instancias de ItemComanda)
  const [itemsTemporal, setItemsTemporal] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [resMesas, resProductos] = await Promise.all([getMesas(), getProductos()]);
      // Una mesa ocupada ya tiene comanda abierta, así que no se puede elegir.
      setMesas(resMesas.data.filter((m) => !m.estaOcupada));
      setProductosDisponibles(resProductos.data);
    } catch (error) {
      toast.error(mensajeDeError(error, 'No se pudieron cargar las mesas y productos'));
    }
  }

  function agregarAlListado(e) {
    e.preventDefault();
    if (!productoSeleccionado || Number(cantidad) < 1) return;

    // Busco el producto seleccionado para mostrar sus datos en el listado temporal.
    const producto = productosDisponibles.find(p => p.id === Number(productoSeleccionado));

    // Si ya estaba en la lista, se suma la cantidad en vez de repetirlo.
    const existe = itemsTemporal.find(item => item.producto.id === producto.id);
    if (existe) {
      setItemsTemporal(itemsTemporal.map(item =>
        item === existe ? item.sumar(Number(cantidad), observaciones) : item
      ));
    } else {
      setItemsTemporal([...itemsTemporal, new ItemComanda(producto, Number(cantidad), observaciones)]);
    }

    // Reseteamos el formulario de producto
    setProductoSeleccionado('');
    setCantidad(1);
    setObservaciones('');
  }

  function quitarDelListado(idProducto) {
    setItemsTemporal(itemsTemporal.filter(item => item.producto.id !== idProducto));
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
        detalles: itemsTemporal.map(item => item.toApi())
      });
      toast.success(`Comanda de la mesa ${mesa} enviada a cocina`);
      navigate('/comandas');
    } catch (error) {
      toast.error(mensajeDeError(error, 'Error al crear la comanda'));
    } finally {
      setEnviando(false);
    }
  }

  const total = itemsTemporal.reduce((suma, item) => suma + item.subtotal, 0);

  return (
    <div className="page-container">
      <h1 className="page-title">Nueva comanda</h1>

      {/* Una columna en celular y tablet; dos en pantallas grandes: formulario a la izquierda, listado a la derecha */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card flex flex-col gap-4 p-5 shadow-none">
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
                className="w-[70px]"
                aria-label="Cantidad"
              />
              <button type="submit" className="btn btn-secondary" title="Agregar">
                <Plus size={16} />
              </button>
            </div>
            <input
              type="text"
              maxLength={200}
              placeholder="Observaciones para la cocina (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              aria-label="Observaciones"
            />
          </form>
        </div>

        <div className="card flex flex-col gap-4 p-5 shadow-none">
          <h2 className="text-[1.05rem]">Productos a enviar</h2>
          {itemsTemporal.length === 0 ? (
            <p className="text-muted">Todavía no cargaste productos.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {itemsTemporal.map(item => (
                <li key={item.producto.id} className="flex items-center justify-between gap-2 border-b border-border pb-2">
                  <span>
                    {item.cantidad} x {item.producto.nombre}
                    {item.observaciones && <span className="block text-xs text-warning">Obs.: {item.observaciones}</span>}
                  </span>
                  <span className="flex items-center gap-1">
                    {formatearPrecio(item.subtotal)}
                    <button className="btn btn-icon btn-delete" onClick={() => quitarDelListado(item.producto.id)} title="Quitar">
                      <Trash2 size={16} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="flex justify-between border-t border-border py-3 text-lg"><span>Total</span><strong>{formatearPrecio(total)}</strong></p>

          <button className="btn btn-primary btn-block" onClick={confirmarEnvio} disabled={enviando || itemsTemporal.length === 0}>
            {enviando ? 'Enviando...' : 'Confirmar y enviar a cocina'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaComandaPage;
