import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservaFormModal from './ReservaFormModal';
import { createReserva, updateReserva } from '../../services/reservas.service';
import { getMesasDisponibles } from '../../services/mesas.service';
import { fechaReservaAUTC, fechaReservaParaInput, formatearFechaReserva } from '../../utils/fechaReserva';

vi.mock('../../services/reservas.service', () => ({ createReserva: vi.fn(), updateReserva: vi.fn() }));
vi.mock('../../services/mesas.service', () => ({ getMesasDisponibles: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const instante = '2031-05-11T02:30:00.000Z';
const reserva = { id: 7, fecha: instante, nombre_cliente: 'Ana', telefono_cliente: '123', cantidad_personas: 2, id_mesa: 1 };

describe('fechas de reservas en hora del restaurante', () => {
  test('al crear consulta y guarda el mismo instante y lo muestra en el día elegido', async () => {
    const user = userEvent.setup();
    getMesasDisponibles.mockResolvedValue({ data: [{ id: 1, capacidad: 4 }] });
    createReserva.mockResolvedValue({});
    render(<ReservaFormModal onGuardado={vi.fn()} onCancelar={vi.fn()} />);
    await user.type(screen.getByLabelText(/Nombre del cliente/), 'Ana');
    await user.type(screen.getByLabelText(/Teléfono/), '123');
    await user.type(screen.getByLabelText(/Fecha y hora/), '2031-05-10T23:30');
    await user.type(screen.getByLabelText(/Cantidad de personas/), '2');
    await user.click(screen.getByRole('button', { name: 'Buscar mesas libres' }));
    await waitFor(() => expect(getMesasDisponibles).toHaveBeenCalledWith(instante, '2', undefined));
    await user.selectOptions(screen.getByLabelText(/Mesa/), '1');
    await user.click(screen.getByRole('button', { name: 'Confirmar reserva' }));
    await waitFor(() => expect(createReserva).toHaveBeenCalledWith(expect.objectContaining({ fecha: instante, id_mesa: 1 })));
    expect(formatearFechaReserva(instante)).toContain('10/5/31');
    expect(formatearFechaReserva(instante)).toContain('23:30');
    expect(fechaReservaParaInput(instante)).toBe('2031-05-10T23:30');
  });

  test('al editar conserva la hora y excluye la propia reserva al consultar mesas', async () => {
    const user = userEvent.setup();
    getMesasDisponibles.mockResolvedValue({ data: [{ id: 1, capacidad: 4 }] });
    updateReserva.mockResolvedValue({});
    render(<ReservaFormModal reservaInicial={reserva} onGuardado={vi.fn()} onCancelar={vi.fn()} />);
    expect(screen.getByLabelText(/Fecha y hora/).value).toBe('2031-05-10T23:30');
    await user.click(screen.getByRole('button', { name: 'Buscar mesas libres' }));
    await waitFor(() => expect(getMesasDisponibles).toHaveBeenCalledWith(instante, 2, 7));
    await user.selectOptions(screen.getByLabelText(/Mesa/), '1');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(updateReserva).toHaveBeenCalledWith(7, expect.objectContaining({ fecha: instante })));
  });

  test('cambiar la fecha invalida la mesa obtenida previamente', async () => {
    const user = userEvent.setup();
    render(<ReservaFormModal reservaInicial={reserva} onGuardado={vi.fn()} onCancelar={vi.fn()} />);
    await user.clear(screen.getByLabelText(/Fecha y hora/));
    expect(screen.getByLabelText(/Mesa/).disabled).toBe(true);
  });

  test('al editar sin cambiar la hora conserva segundos y milisegundos existentes', async () => {
    const user = userEvent.setup();
    const fecha = '2031-05-11T02:30:42.123Z';
    updateReserva.mockResolvedValue({});
    render(<ReservaFormModal reservaInicial={{ ...reserva, fecha }} onGuardado={vi.fn()} onCancelar={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(updateReserva).toHaveBeenCalledWith(7, expect.objectContaining({ fecha })));
  });

  test('rechaza fechas inválidas y horas inexistentes por cambios históricos de zona', () => {
    expect(() => fechaReservaAUTC('2031-02-30T23:30')).toThrow();
    expect(() => fechaReservaAUTC('2008-10-19T00:30')).toThrow();
  });
});
