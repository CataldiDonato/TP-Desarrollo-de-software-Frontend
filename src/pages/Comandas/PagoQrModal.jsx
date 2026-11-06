import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { crearPagoMercadoPago, getComanda } from '../../services/comandas.service';
import { formatearPrecio, mensajeDeError } from '../../utils/formato';

const INTERVALO_CONSULTA_MS = 3000;

/**
 * Muestra el QR de Mercado Pago para que el cliente pague la comanda desde el celular.
 * La comanda NO se cierra acá: la cierra el backend cuando le llega el webhook de MP.
 * Este modal solo consulta cada 3 s si ya quedó "Pagada".
 *
 * Props:
 *  - idComanda: comanda a cobrar
 *  - onPagada: se llama cuando el backend confirma el pago
 *  - onCerrar: cierra el modal sin cobrar
 */
export default function PagoQrModal({ idComanda, onPagada, onCerrar }) {
  const [pago, setPago] = useState(null);
  // Refs para no reiniciar los efectos si el padre pasa funciones nuevas en cada render.
  const onPagadaRef = useRef(onPagada);
  const onCerrarRef = useRef(onCerrar);
  useEffect(() => {
    onPagadaRef.current = onPagada;
    onCerrarRef.current = onCerrar;
  });

  // Genera el link de pago al abrir
  useEffect(() => {
    let activo = true;
    crearPagoMercadoPago(idComanda)
      .then((res) => { if (activo) setPago(res.data); })
      .catch((error) => {
        if (!activo) return;
        toast.error(mensajeDeError(error, 'No se pudo generar el QR'));
        onCerrarRef.current();
      });
    return () => { activo = false; };
  }, [idComanda]);

  // Consulta si el webhook ya cerró la comanda
  useEffect(() => {
    if (!pago) return;
    const intervalo = setInterval(async () => {
      try {
        const { data } = await getComanda(idComanda);
        if (data.estado === 'Pagada') {
          clearInterval(intervalo);
          onPagadaRef.current();
        }
      } catch {
        // Un error de red puntual no corta la espera: se reintenta en la próxima vuelta.
      }
    }, INTERVALO_CONSULTA_MS);
    return () => clearInterval(intervalo);
  }, [pago, idComanda]);

  return (
    <Modal titulo={`Cobrar comanda #${idComanda} con Mercado Pago`} onCerrar={onCerrar}>
      <div className="modal-body flex flex-col items-center gap-4 text-center">
        {!pago ? (
          <p className="state-msg">Generando QR...</p>
        ) : (
          <>
            <p className="text-lg font-semibold">Total: {formatearPrecio(pago.total)}</p>
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG value={pago.init_point} size={240} />
            </div>
            <p className="text-sm text-muted">Pedile al cliente que escanee el código con la cámara del celular.</p>
            <a className="text-sm underline" href={pago.init_point} target="_blank" rel="noreferrer">
              Abrir link de pago
            </a>
            <p className="state-msg">Esperando el pago...</p>
            <p className="form-hint">Si agregás o quitás productos, cerrá esta ventana y generá un QR nuevo.</p>
          </>
        )}
        <div className="modal-actions">
          <button className="btn" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </Modal>
  );
}
