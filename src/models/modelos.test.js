// Test unitario: clases de modelo (src/models). Verifica que se construyen desde la API
// y que los métodos de negocio y toApi() devuelven lo que espera el backend.
import { describe, expect, it } from 'vitest';
import { Comanda, ItemComanda, Mesa, PedidoCocina, Producto, Reserva, Usuario, conModelo } from './modelos';

describe('Modelo (factory method)', () => {
  it('desdeApi crea una instancia de la subclase que lo llama', () => {
    const mesa = Mesa.desdeApi({ id: 1, capacidad: 4, estado: 'Ocupada' });
    expect(mesa).toBeInstanceOf(Mesa);
    expect(mesa.estaOcupada).toBe(true);
    expect(mesa.claseEstado).toBe('estado-ocupada');
  });

  it('conModelo convierte el data de una respuesta (lista u objeto)', () => {
    const lista = conModelo(Mesa)({ status: 200, data: [{ id: 1, capacidad: 2 }] });
    expect(lista.status).toBe(200);
    expect(lista.data[0]).toBeInstanceOf(Mesa);

    const uno = conModelo(Mesa)({ data: { id: 2, capacidad: 6 } });
    expect(uno.data.capacidad).toBe(6);
  });
});

describe('Comanda', () => {
  const json = {
    id: 3, fecha: '2026-10-06T15:28:00.000Z', estado: 'Abierta', id_mesa: 4,
    mozo: { id: 2, nombre: 'Mozo' }, medio_pago: null, total: 24000,
    detalles: [
      { id_producto: 1, nombre_producto: 'Milanesa', cantidad: 2, estado: 'Pendiente', precio: 12000, subtotal: 24000 },
      { id_producto: 2, nombre_producto: 'Flan', cantidad: 1, estado: 'En_Preparacion', precio: 0, subtotal: 0 },
    ],
  };

  it('arma los detalles como objetos y sabe qué se puede modificar', () => {
    const comanda = Comanda.desdeApi(json);
    expect(comanda.estaAbierta).toBe(true);
    expect(comanda.detalles[0].esModificable).toBe(true);
    expect(comanda.detalles[1].esModificable).toBe(false);
    expect(comanda.detalles[1].estadoLegible).toBe('En preparación');
  });
});

describe('ItemComanda (modelo de request)', () => {
  const milanesa = new Producto({ id: 1, nombre: 'Milanesa', tipo: 'Plato', id_categoria: 1, precio: 12000 });

  it('calcula el subtotal y arma el detalle para POST /comandas', () => {
    const item = new ItemComanda(milanesa, 2, '  sin sal ');
    expect(item.subtotal).toBe(24000);
    expect(item.toApi()).toEqual({ id_producto: 1, cantidad: 2, observaciones: 'sin sal' });
  });

  it('sumar devuelve un ítem nuevo y no manda observaciones vacías', () => {
    const item = new ItemComanda(milanesa, 1);
    const sumado = item.sumar(2);
    expect(sumado).not.toBe(item);
    expect(sumado.cantidad).toBe(3);
    expect(sumado.toApi()).toEqual({ id_producto: 1, cantidad: 3 });
  });
});

describe('toApi de los formularios', () => {
  it('Producto convierte precio y categoría a número', () => {
    const producto = new Producto({ nombre: ' Flan ', descripcion: null, tipo: 'Plato', id_categoria: '3', precio: '1500' });
    expect(producto.toApi()).toEqual({ nombre: 'Flan', descripcion: '', tipo: 'Plato', id_categoria: 3, precio: 1500 });
  });

  it('Reserva manda la fecha en ISO y los números como números', () => {
    const reserva = new Reserva({
      fecha: '2026-11-01T21:00', nombre_cliente: 'Ana', telefono_cliente: '341', cantidad_personas: '2', id_mesa: '5',
    });
    const datos = reserva.toApi();
    expect(datos.fecha).toBe(new Date('2026-11-01T21:00').toISOString());
    expect(datos.cantidad_personas).toBe(2);
    expect(datos.id_mesa).toBe(5);
  });

  it('Usuario solo manda la contraseña si se escribió una', () => {
    const usuario = new Usuario({ nombre: 'Ana', email: 'ana@test.com', rol: 'Mozo' });
    expect(usuario.toApi('')).not.toHaveProperty('contrasenia');
    expect(usuario.toApi('12345678').contrasenia).toBe('12345678');
    expect(usuario.claseRol).toBe('role-waiter');
  });
});

describe('PedidoCocina', () => {
  it('sabe a qué estado pasa y cuándo ya está listo', () => {
    const base = { idComanda: 1, idProducto: 2, cantidad: 1, producto: { nombre: 'Flan' }, comanda: { id_mesa: 7 } };
    const pendiente = PedidoCocina.desdeApi({ ...base, estado: 'Pendiente' });
    expect(pendiente.siguienteEstado).toBe('En_Preparacion');
    expect(pendiente.clave).toBe('1-2');
    expect(pendiente.idMesa).toBe(7);
    expect(PedidoCocina.desdeApi({ ...base, estado: 'Finalizada' }).siguienteEstado).toBeNull();
  });
});
