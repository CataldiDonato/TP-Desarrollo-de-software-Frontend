import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { getComanda, cambiarEstadoComanda } from '../../services/comandas.service';
import { agregarDetalle, cambiarCantidadDetalle, quitarDetalle } from '../../services/detalleComanda.service';
import { getProductos } from '../../services/productos.service';
import { getMediosPago } from '../../services/mediosPago.service';
import { formatearFecha, formatearPrecio, mensajeDeError } from '../../utils/formato';
import PagoQrModal from './PagoQrModal';

/**
 * Detalle de una comanda. Si está abierta, el mozo puede:
 *  - agregar productos, cambiar cantidades o quitarlos (solo los que la cocina no empezó)
 *  - cobrarla (elige medio de pago) o cancelarla. En los dos casos la mesa queda libre.
 *
 * Props:
 *  - idComanda: comanda a mostrar
 *  - onCerrar: cierra el modal
 *  - onCambio: avisa al padre que algo cambió, para que recargue el listado
 */
const DetalleComandaModal = ({ idComanda, onCerrar, onCambio }) => {
  const [comanda, setComanda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);
  // Formulario para agregar un producto
  const [productoNuevo, setProductoNuevo] = useState('');
  const [cantidadNueva, setCantidadNueva] = useState(1);
  const [observacionesNuevas, setObservacionesNuevas] = useState('');
  // Medio de pago elegido para cobrar
  const [medioPago, setMedioPago] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mostrarQr, setMostrarQr] = useState(false);

  useEffect(() => {
    cargarDatos(idComanda);
  }, [idComanda]);

  async function cargarDatos(id) {
    try {
      const [resComanda, resProductos, resMedios] = await Promise.all([
        getComanda(id),
        getProductos(),
        getMediosPago()
      ]);
      setComanda(resComanda.data);
      setProductos(resProductos.data);
      setMediosPago(resMedios.data);
    } catch (error) {
      toast.error(mensajeDeError(error, 'No se pudo cargar la comanda'));
    }
  }

  // Después de cada cambio se vuelve a pedir la comanda para ver el total actualizado.
  async function recargarComanda() {
    const respuesta = await getComanda(idComanda);
    setComanda(respuesta.data);
    onCambio();
  }

  // Ejecuta una acción contra el backend mostrando el error si falla.
  async function ejecutar(accion, mensajeOk) {
    setProcesando(true);
    try {
      await accion();
      if (mensajeOk) toast.success(mensajeOk);
      await recargarComanda();
    } catch (error) {
      toast.error(mensajeDeError(error, 'No se pudo realizar la acción'));
    } finally {
      setProcesando(false);
    }
  }

  function modificarCantidad(detalle, cambio) {
    const nuevaCantidad = detalle.cantidad + cambio;
    if (nuevaCantidad < 1) return; // para sacarlo del todo está el botón de quitar
    ejecutar(() => cambiarCantidadDetalle(idComanda, detalle.id_producto, nuevaCantidad));
  }

  function quitarProducto(detalle) {
    if (!window.confirm(`¿Quitar ${detalle.nombre_producto} de la comanda?`)) return;
    ejecutar(() => quitarDetalle(idComanda, detalle.id_producto), 'Producto quitado');
  }

  function agregarProducto(event) {
    event.preventDefault();
    if (!productoNuevo) return;
    ejecutar(
      () => agregarDetalle({
        id_comanda: idComanda,
        id_producto: Number(productoNuevo),
        cantidad: Number(cantidadNueva),
        observaciones: observacionesNuevas.trim() || undefined,
      }),
      'Producto agregado y enviado a cocina'
    );
    setProductoNuevo('');
    setCantidadNueva(1);
    setObservacionesNuevas('');
  }

  function cobrar() {
    if (!medioPago) {
      toast.error('Elegí el medio de pago');
      return;
    }
    ejecutar(
      () => cambiarEstadoComanda(idComanda, { estado: 'Pagada', id_medio_pago: Number(medioPago) }),
      `Comanda cobrada. La mesa ${comanda.id_mesa} quedó libre.`
    );
  }

  function cancelarComanda() {
    if (!window.confirm('¿Cancelar la comanda? La mesa queda libre y no se cobra nada.')) return;
    ejecutar(() => cambiarEstadoComanda(idComanda, { estado: 'Cancelada' }), 'Comanda cancelada');
  }

  if (!comanda) {
    return (
      <Modal titulo={`Comanda #${idComanda}`} onCerrar={onCerrar}>
        <div className="modal-body"><p className="state-msg">Cargando...</p></div>
      </Modal>
    );
  }

  const estaAbierta = comanda.estaAbierta;

  return (
    <>
    <Modal titulo={`Comanda #${comanda.id} - Mesa ${comanda.id_mesa}`} onCerrar={onCerrar}>
      <div className="modal-body">
        <p className="text-muted">
          Mozo: {comanda.mozo.nombre} · {formatearFecha(comanda.fecha)} ·{' '}
          <span className={`badge ${comanda.claseEstado}`}>{comanda.estado}</span>
          {comanda.medio_pago && <> · Pagó con {comanda.medio_pago.tipo}</>}
        </p>

        {/* Productos de la comanda */}
        <div className="table-wrapper">
          <table className="data-table compact-table">
            <thead>
              <tr><th>Producto</th><th>Cant.</th><th>Estado</th><th>Subtotal</th>{estaAbierta && <th></th>}</tr>
            </thead>
            <tbody>
              {comanda.detalles.length === 0 ? (
                <tr><td colSpan="5" className="table-empty">La comanda no tiene productos.</td></tr>
              ) : comanda.detalles.map((detalle) => {
                // Solo se puede modificar lo que la cocina todavía no empezó.
                const modificable = estaAbierta && detalle.esModificable;
                return (
                  <tr key={detalle.id_producto}>
                    <td>
                      {detalle.nombre_producto}
                      {detalle.observaciones && <span className="block text-xs text-warning">Obs.: {detalle.observaciones}</span>}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {modificable && (
                          <button className="btn btn-icon" onClick={() => modificarCantidad(detalle, -1)} disabled={procesando} title="Restar">
                            <Minus size={14} />
                          </button>
                        )}
                        <span>{detalle.cantidad}</span>
                        {modificable && (
                          <button className="btn btn-icon" onClick={() => modificarCantidad(detalle, 1)} disabled={procesando} title="Sumar">
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td><span className={`badge estado-${detalle.estado.toLowerCase()}`}>{detalle.estadoLegible}</span></td>
                    <td>{formatearPrecio(detalle.subtotal)}</td>
                    {estaAbierta && (
                      <td>
                        {modificable && (
                          <button className="btn btn-icon btn-delete" onClick={() => quitarProducto(detalle)} disabled={procesando} title="Quitar">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="flex justify-between border-t border-border py-3 text-lg"><span>Total</span><strong>{formatearPrecio(comanda.total)}</strong></p>

        {estaAbierta && (
          <>
            {/* Agregar un producto más */}
            <form className="form-group" onSubmit={agregarProducto}>
              <label htmlFor="detalle-producto">Agregar producto</label>
              <div className="input-con-boton">
                <select id="detalle-producto" value={productoNuevo} onChange={(e) => setProductoNuevo(e.target.value)}>
                  <option value="">Seleccione un producto...</option>
                  {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} - {formatearPrecio(p.precio)}</option>)}
                </select>
                <input
                  type="number"
                  min="1"
                  className="w-[70px]"
                  value={cantidadNueva}
                  onChange={(e) => setCantidadNueva(e.target.value)}
                  aria-label="Cantidad"
                />
                <button className="btn btn-secondary" type="submit" disabled={procesando} title="Agregar">
                  <Plus size={16} />
                </button>
              </div>
              <input
                type="text"
                maxLength={200}
                placeholder="Observaciones para la cocina (opcional)"
                value={observacionesNuevas}
                onChange={(e) => setObservacionesNuevas(e.target.value)}
                aria-label="Observaciones"
              />
            </form>

            {/* Cobrar */}
            <div className="form-group">
              <label htmlFor="detalle-medio">Cobrar la cuenta</label>
              <div className="input-con-boton">
                <select id="detalle-medio" value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
                  <option value="">-- Medio de pago --</option>
                  {/* Mercado Pago no va acá: se cobra con el QR y lo confirma el webhook */}
                  {mediosPago
                    .filter((m) => m.tipo !== 'MercadoPago')
                    .map((m) => <option key={m.id} value={m.id}>{m.tipo}</option>)}
                </select>
                <button className="btn btn-primary" onClick={cobrar} disabled={procesando}>Cobrar</button>
              </div>
            </div>
            {/* Mercado Pago: genera el QR y espera a que el webhook confirme el pago */}
            <div className="form-group">
              <button className="btn btn-primary" onClick={() => setMostrarQr(true)} disabled={procesando}>
                Cobrar con Mercado Pago (QR)
              </button>
            </div>
            {/* cancelar */}
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={cancelarComanda} disabled={procesando}>Cancelar comanda</button>
            </div>
          </>
        )}
      </div>
    </Modal>

      {/* Va afuera del Modal: el .modal tiene transform y recortaría un overlay fixed adentro */}
      {mostrarQr && (
        <PagoQrModal
          idComanda={idComanda}
          onCerrar={() => setMostrarQr(false)}
          onPagada={async () => {
            setMostrarQr(false);
            toast.success(`Pago recibido. La mesa ${comanda.id_mesa} quedó libre.`);
            await recargarComanda();
          }}
        />
      )}
    </>
  );
};

export default DetalleComandaModal;
