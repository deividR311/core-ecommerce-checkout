/** Servicio bajo prueba */
import { StockValidator } from './stock-validator';

/** Mocks */
import {
  coffeeMakerProductMock,
  deskLampProductMock,
  laptopProductMock,
} from '../../application/use-cases/mocks/product-repository.mock';

describe('StockValidator: comparación de cantidades solicitadas contra el stock', () => {
  let stockValidator: StockValidator;
  const products = [laptopProductMock, coffeeMakerProductMock, deskLampProductMock];

  /** Tres unidades de lámpara ya sumadas por consolidateCartItems; el stock de la semilla es 2 */
  const consolidatedLampQuantity = 3;

  beforeEach(() => {
    stockValidator = new StockValidator();
  });

  it('debería devolver una lista vacía cuando todas las cantidades son menores al stock', () => {
    const consolidatedItems = [
      { productId: laptopProductMock.id, quantity: 4 },
      { productId: coffeeMakerProductMock.id, quantity: 1 },
    ];
    expect(stockValidator.validate(consolidatedItems, products)).toEqual([]);
  });

  it('debería devolver una lista vacía cuando la cantidad agota exactamente el stock', () => {
    const consolidatedItems = [{ productId: deskLampProductMock.id, quantity: 2 }];
    expect(stockValidator.validate(consolidatedItems, products)).toEqual([]);
  });

  it('debería devolver un conflicto con solicitado y disponible cuando un ítem supera el stock', () => {
    const consolidatedItems = [
      { productId: laptopProductMock.id, quantity: 6 },
      { productId: coffeeMakerProductMock.id, quantity: 1 },
    ];
    expect(stockValidator.validate(consolidatedItems, products)).toEqual([
      { productId: laptopProductMock.id, requested: 6, available: 5 },
    ]);
  });

  it('debería devolver todos los conflictos en el orden de los ítems cuando varios superan el stock', () => {
    const consolidatedItems = [
      { productId: deskLampProductMock.id, quantity: 3 },
      { productId: coffeeMakerProductMock.id, quantity: 8 },
      { productId: laptopProductMock.id, quantity: 10 },
    ];
    expect(stockValidator.validate(consolidatedItems, products)).toEqual([
      { productId: deskLampProductMock.id, requested: 3, available: 2 },
      { productId: laptopProductMock.id, requested: 10, available: 5 },
    ]);
  });

  it('debería evaluar la cantidad consolidada cuando el mismo producto llega ya sumado', () => {
    const consolidatedItems = [{ productId: deskLampProductMock.id, quantity: consolidatedLampQuantity }];
    expect(stockValidator.validate(consolidatedItems, products)).toHaveLength(1);
  });

  it('debería reportar disponibilidad cero cuando el producto tiene stock cero', () => {
    const soldOutLamp = { ...deskLampProductMock, stock: 0 };
    const consolidatedItems = [{ productId: soldOutLamp.id, quantity: 1 }];
    expect(stockValidator.validate(consolidatedItems, [soldOutLamp])).toEqual([
      { productId: soldOutLamp.id, requested: 1, available: 0 },
    ]);
  });

  it('debería reportar disponibilidad cero cuando el producto no está entre los resueltos', () => {
    const consolidatedItems = [{ productId: laptopProductMock.id, quantity: 1 }];
    expect(stockValidator.validate(consolidatedItems, [coffeeMakerProductMock])).toEqual([
      { productId: laptopProductMock.id, requested: 1, available: 0 },
    ]);
  });

  it('debería devolver una lista vacía cuando el carrito está vacío', () => {
    expect(stockValidator.validate([], products)).toEqual([]);
  });
});
