import Modal from './Modal';

/**
 * Modal con formulario: reutiliza Modal y agrega el <form> y los botones Cancelar / Guardar,
 * que son iguales en todos los formularios del sistema. Cada modal solo pasa sus campos como children.
 *
 * Props:
 *  - titulo:          texto de la cabecera
 *  - onSubmit:        se llama al enviar el formulario (output property)
 *  - onCancelar:      se llama al tocar Cancelar, la X o el fondo oscuro (output property)
 *  - guardando:       true mientras la petición está pendiente (deshabilita los botones)
 *  - textoGuardar:    texto del botón principal (por defecto "Guardar")
 *  - textoGuardando:  texto del botón mientras guarda (por defecto "Guardando...")
 *  - textoCancelar:   texto del botón secundario (por defecto "Cancelar")
 *  - peligro:         true para mostrar el botón principal en rojo (acciones destructivas)
 *  - noValidate:      true para usar los mensajes de validación propios en lugar de los del navegador
 *  - children:        campos del formulario
 */
export default function FormModal({
  titulo,
  onSubmit,
  onCancelar,
  guardando = false,
  textoGuardar = 'Guardar',
  textoGuardando = 'Guardando...',
  textoCancelar = 'Cancelar',
  peligro = false,
  noValidate = false,
  children,
}) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar}>
      <form className="modal-form" onSubmit={onSubmit} noValidate={noValidate}>
        {children}

        <div className="modal-actions">
          <button className="btn btn-secondary" type="button" onClick={onCancelar} disabled={guardando}>
            {textoCancelar}
          </button>
          <button className={`btn ${peligro ? 'btn-danger' : 'btn-primary'}`} type="submit" disabled={guardando}>
            {guardando ? textoGuardando : textoGuardar}
          </button>
        </div>
      </form>
    </Modal>
  );
}
