/**
 * Encabezado común de las páginas: título, subtítulo opcional y acciones a la derecha.
 *
 * Props:
 *  - titulo:    texto del h1
 *  - subtitulo: texto chico debajo del título (opcional)
 *  - children:  botones o acciones que van a la derecha (opcional)
 */
export default function PageHeader({ titulo, subtitulo, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{titulo}</h1>
        {subtitulo && <p className="page-subtitle">{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}
