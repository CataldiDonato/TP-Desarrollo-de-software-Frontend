import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

/**
 * Página PÚBLICA (sin login) a la que Mercado Pago manda al cliente después de pagar (back_urls).
 * Solo informa: no toca la base. La comanda la cierra el backend cuando le llega el webhook.
 *
 * MP agrega a la URL, entre otros: ?status=approved|pending|rejected|null&external_reference=<id comanda>
 */
const RESULTADOS = {
  approved: {
    Icono: CheckCircle2,
    color: 'text-green-600',
    titulo: '¡Pago aprobado!',
    texto: 'Gracias. Ya podés cerrar esta ventana.',
  },
  pending: {
    Icono: Clock,
    color: 'text-amber-500',
    titulo: 'Pago pendiente',
    texto: 'Tu pago se está procesando. Avisale al mozo para que lo confirme.',
  },
  rechazado: {
    Icono: XCircle,
    color: 'text-red-600',
    titulo: 'El pago no se completó',
    texto: 'No se te cobró nada. Podés volver a escanear el QR o pagar con otro medio.',
  },
};

export default function ResultadoPagoPage() {
  const [params] = useSearchParams();
  const status = params.get('status') ?? params.get('collection_status');
  const { Icono, color, titulo, texto } = RESULTADOS[status] ?? RESULTADOS.rechazado;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <section className="card flex w-full max-w-sm flex-col items-center gap-3 p-8 text-center">
        <Icono size={56} className={color} aria-hidden="true" />
        <h1 className="text-xl font-semibold">{titulo}</h1>
        <p className="text-muted">{texto}</p>
      </section>
    </main>
  );
}
