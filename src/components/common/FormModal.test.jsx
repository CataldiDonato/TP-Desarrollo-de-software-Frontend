// Test unitario de componente: FormModal.jsx
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormModal from './FormModal';

describe('FormModal', () => {
  afterEach(cleanup);

  test('muestra el título, los campos y los botones por defecto', () => {
    render(<FormModal titulo="Nueva mesa" onSubmit={vi.fn()} onCancelar={vi.fn()}><input aria-label="Capacidad" /></FormModal>);

    expect(screen.getByRole('heading', { name: 'Nueva mesa' })).toBeTruthy();
    expect(screen.getByLabelText('Capacidad')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeTruthy();
  });

  test('llama a onSubmit al tocar Guardar y a onCancelar al tocar Cancelar', async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onCancelar = vi.fn();
    render(<FormModal titulo="Nueva mesa" onSubmit={onSubmit} onCancelar={onCancelar}><p>Campos</p></FormModal>);

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  test('mientras guarda muestra el texto de carga y deshabilita los botones', () => {
    render(<FormModal titulo="Nueva mesa" onSubmit={vi.fn()} onCancelar={vi.fn()} guardando><p>Campos</p></FormModal>);

    expect(screen.getByRole('button', { name: 'Guardando...' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Cancelar' }).disabled).toBe(true);
  });

  test('acepta textos personalizados para los botones', () => {
    render(
      <FormModal titulo="Cancelar reserva" onSubmit={vi.fn()} onCancelar={vi.fn()} textoGuardar="Cancelar reserva" textoCancelar="Volver" peligro>
        <p>Campos</p>
      </FormModal>
    );

    expect(screen.getByRole('button', { name: 'Volver' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar reserva' }).className).toContain('btn-danger');
  });
});
