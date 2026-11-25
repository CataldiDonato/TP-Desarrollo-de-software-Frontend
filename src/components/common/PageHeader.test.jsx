// Test unitario de componente: PageHeader.jsx
import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import PageHeader from './PageHeader';

describe('PageHeader', () => {
  afterEach(cleanup);

  test('muestra el título, el subtítulo y las acciones', () => {
    render(<PageHeader titulo="Mesas" subtitulo="Salón del local"><button>Nueva mesa</button></PageHeader>);

    expect(screen.getByRole('heading', { level: 1, name: 'Mesas' })).toBeTruthy();
    expect(screen.getByText('Salón del local')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nueva mesa' })).toBeTruthy();
  });

  test('sin subtítulo no lo renderiza', () => {
    const { container } = render(<PageHeader titulo="Mesas" />);
    expect(container.querySelector('.page-subtitle')).toBeNull();
  });
});
