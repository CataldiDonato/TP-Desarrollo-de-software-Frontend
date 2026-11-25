import { X } from 'lucide-react';

/**
 * Ventana modal genérica. Todos los formularios y detalles la usan para no repetir el mismo HTML.
 *
 * Props:
 *  - titulo:   texto de la cabecera (input property)
 *  - onCerrar: función que se llama al tocar la X o el fondo oscuro (output property)
 *  - children: lo que va adentro del modal
 */
export default function Modal({ titulo, onCerrar, children }) {
  // Cierra solo si el click fue sobre el fondo oscuro, no sobre algo de adentro del modal.
  function handleClickFondo(event) {
    if (event.target === event.currentTarget) {
      onCerrar();
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClickFondo}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="modal-header">
          <h2>{titulo}</h2>
          <button className="btn btn-icon" type="button" onClick={onCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
