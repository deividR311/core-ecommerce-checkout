/** Repositorio bajo prueba */
import { InMemoryProductRepository } from './in-memory-product.repository';

/** Semillas */
import { PRODUCTS_SEED } from '../seed/products.seed';

describe('InMemoryProductRepository: catálogo en memoria con control de stock', () => {
  const laptopId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
  const deskLampId = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
  const unknownProductId = '00000000-0000-4000-8000-000000000000';
  let productRepository: InMemoryProductRepository;

  beforeEach(() => {
    productRepository = new InMemoryProductRepository();
  });

  it('debería devolver los seis productos de la semilla cuando se consulta el catálogo completo', async () => {
    const products = await productRepository.findAll();
    expect(products).toHaveLength(6);
    expect(products).toEqual(PRODUCTS_SEED);
  });

  it('debería devolver copias cuando se consulta el catálogo para que el consumidor no altere el estado interno', async () => {
    const [firstProduct] = await productRepository.findAll();
    firstProduct.stock = 0;
    firstProduct.unitPrice = 1;
    const [reloadedProduct] = await productRepository.findAll();
    expect(reloadedProduct.stock).toBe(5);
    expect(reloadedProduct.unitPrice).toBe(1299.99);
  });

  it('debería devolver solo los productos existentes cuando se consultan ids existentes e inexistentes', async () => {
    const products = await productRepository.findByIds([laptopId, unknownProductId, deskLampId]);
    expect(products.map(product => product.name)).toEqual(['Laptop Pro 14', 'Lámpara de Escritorio']);
  });

  it('debería devolver cada producto una sola vez cuando el mismo id se repite en la consulta', async () => {
    const products = await productRepository.findByIds([laptopId, laptopId]);
    expect(products).toHaveLength(1);
  });

  it('debería devolver un arreglo vacío cuando ningún id existe', async () => {
    expect(await productRepository.findByIds([unknownProductId])).toEqual([]);
  });

  it('debería descontar el stock y retornar true cuando la cantidad no supera el disponible', async () => {
    const isDecremented = await productRepository.decrementStock(laptopId, 2);
    const [laptop] = await productRepository.findByIds([laptopId]);
    expect(isDecremented).toBe(true);
    expect(laptop.stock).toBe(3);
  });

  it('debería dejar el stock en cero y retornar true cuando la cantidad es exactamente el disponible', async () => {
    const isDecremented = await productRepository.decrementStock(deskLampId, 2);
    const [deskLamp] = await productRepository.findByIds([deskLampId]);
    expect(isDecremented).toBe(true);
    expect(deskLamp.stock).toBe(0);
  });

  it('debería rechazar sin modificar el stock cuando la cantidad supera el disponible', async () => {
    const isDecremented = await productRepository.decrementStock(deskLampId, 3);
    const [deskLamp] = await productRepository.findByIds([deskLampId]);
    expect(isDecremented).toBe(false);
    expect(deskLamp.stock).toBe(2);
  });

  it('debería rechazar cuando el producto no existe', async () => {
    expect(await productRepository.decrementStock(unknownProductId, 1)).toBe(false);
  });

  it('debería rechazar sin modificar el stock cuando la cantidad es cero, negativa o decimal', async () => {
    expect(await productRepository.decrementStock(laptopId, 0)).toBe(false);
    expect(await productRepository.decrementStock(laptopId, -1)).toBe(false);
    expect(await productRepository.decrementStock(laptopId, 1.5)).toBe(false);
    const [laptop] = await productRepository.findByIds([laptopId]);
    expect(laptop.stock).toBe(5);
  });

  it('debería reflejar el stock descontado cuando se consulta el catálogo tras una compra', async () => {
    await productRepository.decrementStock(laptopId, 4);
    const products = await productRepository.findAll();
    expect(products.find(product => product.id === laptopId)?.stock).toBe(1);
  });

  it('debería volver al estado semilla cuando se crea una instancia nueva', async () => {
    await productRepository.decrementStock(laptopId, 5);
    const [laptopFromNewInstance] = await new InMemoryProductRepository().findByIds([laptopId]);
    expect(laptopFromNewInstance.stock).toBe(5);
  });
});
