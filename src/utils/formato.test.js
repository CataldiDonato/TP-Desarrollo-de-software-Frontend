// Test unitario: funciones de formato (utils/formato.js)
import { describe, test, expect } from 'vitest';
import { formatearPrecio, mensajeDeError } from './formato';

describe('formatearPrecio', () => {
  test('formatea en pesos con separador de miles', () => {
    // Intl usa un espacio especial (no separable) después del $, por eso se normaliza
    expect(formatearPrecio(12000).replace(/\s/g, ' ')).toBe('$ 12.000');
  });

  test('acepta precios que vienen como texto (Prisma devuelve los Decimal como string)', () => {
    expect(formatearPrecio('2500').replace(/\s/g, ' ')).toBe('$ 2.500');
  });

  test('si no hay precio muestra una raya', () => {
    expect(formatearPrecio(null)).toBe('—');
  });
});

describe('mensajeDeError', () => {
  test('usa el mensaje que mandó el backend', () => {
    const error = { response: { data: { message: 'La mesa ya tiene una comanda abierta.' } } };
    expect(mensajeDeError(error, 'Error genérico')).toBe('La mesa ya tiene una comanda abierta.');
  });

  test('si el backend no mandó mensaje usa el texto por defecto', () => {
    expect(mensajeDeError(new Error('Network Error'), 'Error genérico')).toBe('Error genérico');
  });
});
