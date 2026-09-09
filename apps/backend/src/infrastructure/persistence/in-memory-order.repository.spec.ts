/** Repositorio bajo prueba */
import { InMemoryOrderRepository } from './in-memory-order.repository';

/** Mocks */
import { orderMock } from '../../application/use-cases/mocks/order-repository.mock';

/** Segunda orden de prueba con otro identificador */
const secondOrderMock = { ...orderMock, id: 'd2b6e9f3-5c4a-4d7b-8e9f-3a9c2b1d4e5f', couponCode: null };

describe('InMemoryOrderRepository: persistencia y consulta de órdenes en memoria', () => {
  let orderRepository: InMemoryOrderRepository;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
  });

  it('debería devolver un arreglo vacío cuando no se ha guardado ninguna orden', async () => {
    expect(await orderRepository.findAll()).toEqual([]);
  });

  it('debería devolver la orden guardada cuando se busca por su identificador', async () => {
    await orderRepository.save(orderMock);
    expect(await orderRepository.findById(orderMock.id)).toEqual(orderMock);
  });

  it('debería devolver null cuando el identificador no corresponde a ninguna orden', async () => {
    await orderRepository.save(orderMock);
    expect(await orderRepository.findById(secondOrderMock.id)).toBeNull();
  });

  it('debería listar la última orden guardada primero cuando hay varias órdenes', async () => {
    await orderRepository.save(orderMock);
    await orderRepository.save(secondOrderMock);
    expect(await orderRepository.findAll()).toEqual([secondOrderMock, orderMock]);
  });

  it('debería conservar lo persistido cuando se muta la orden original después de guardarla', async () => {
    const mutableOrder = { ...orderMock, items: orderMock.items.map(orderItem => ({ ...orderItem })) };
    await orderRepository.save(mutableOrder);
    mutableOrder.items[0].quantity = 99;
    mutableOrder.finalTotal = 0;
    expect(await orderRepository.findById(orderMock.id)).toEqual(orderMock);
  });

  it('debería conservar el estado interno cuando el consumidor muta las copias devueltas', async () => {
    await orderRepository.save(orderMock);
    const storedOrder = await orderRepository.findById(orderMock.id);
    if (storedOrder) {
      storedOrder.items[0].quantity = 99;
      storedOrder.breakdown.finalTotal = 0;
    }
    const orders = await orderRepository.findAll();
    orders[0].finalTotal = 0;
    expect(await orderRepository.findById(orderMock.id)).toEqual(orderMock);
  });
});
