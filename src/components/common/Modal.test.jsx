// Test unitario de componente: Modal.jsx
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal', () => {
  afterEach(cleanup); // borra lo renderizado entre un test y otro

  test('muestra el título y el contenido que recibe por props', () => {
    render(<Modal titulo="Nueva mesa" onCerrar={() => {}}><p>Contenido del formulario</p></Modal>);

    expect(screen.getByRole('heading', { name: 'Nueva mesa' })).toBeTruthy();
    expect(screen.getByText('Contenido del formulario')).toBeTruthy();
  });

  test('llama a onCerrar al tocar el botón de cerrar', async () => {
    const onCerrar = vi.fn(); // función "espía" que registra si fue llamada
    render(<Modal titulo="Nueva mesa" onCerrar={onCerrar}><p>Hola</p></Modal>);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  test('llama a onCerrar al tocar el fondo oscuro', async () => {
    const onCerrar = vi.fn();
    const { container } = render(<Modal titulo="Nueva mesa" onCerrar={onCerrar}><p>Hola</p></Modal>);

    await userEvent.click(container.querySelector('.modal-overlay'));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  test('NO se cierra al tocar algo de adentro del modal', async () => {
    const onCerrar = vi.fn();
    render(<Modal titulo="Nueva mesa" onCerrar={onCerrar}><p>Texto de adentro</p></Modal>);

    await userEvent.click(screen.getByText('Texto de adentro'));

    expect(onCerrar).not.toHaveBeenCalled();
  });
});
