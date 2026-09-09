/** Dependencias NestJS */
import { Test } from '@nestjs/testing';

/** Servicio bajo prueba */
import { CartResolver } from './cart-resolver.service';

/** Errores */
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';

/** Puertos */
import { COUPON_REPOSITORY } from '../../domain/ports/coupon-repository.port';
import type { ICouponRepository } from '../../domain/ports/coupon-repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/product-repository.port';
import type { IProductRepository } from '../../domain/ports/product-repository.port';

/** Mocks */
import { welcomeCouponMock } from '../../domain/discounts/mocks/discount-context.mock';
import { createCouponRepositoryMock } from '../use-cases/mocks/coupon-repository.mock';
import {
  coffeeMakerProductMock,
  createProductRepositoryMock,
  laptopProductMock,
} from '../use-cases/mocks/product-repository.mock';

/** UUID con formato válido que no existe en el catálogo */
const UNKNOWN_UUID = '00000000-0000-4000-8000-000000000000';

describe('CartResolver: resolución de ítems y cupón desde los puertos', () => {
  let cartResolver: CartResolver;
  let productRepositoryMock: jest.Mocked<IProductRepository>;
  let couponRepositoryMock: jest.Mocked<ICouponRepository>;

  beforeEach(async () => {
    productRepositoryMock = createProductRepositoryMock();
    couponRepositoryMock = createCouponRepositoryMock();
    const testingModule = await Test.createTestingModule({
      providers: [
        CartResolver,
        { provide: PRODUCT_REPOSITORY, useValue: productRepositoryMock },
        { provide: COUPON_REPOSITORY, useValue: couponRepositoryMock },
      ],
    }).compile();
    cartResolver = testingModule.get(CartResolver);
  });

  describe('resolveItems', () => {
    it('debería consolidar los ítems repetidos y resolver cada producto cuando todos existen', async () => {
      const resolvedCart = await cartResolver.resolveItems([
        { productId: laptopProductMock.id, quantity: 1 },
        { productId: coffeeMakerProductMock.id, quantity: 2 },
        { productId: laptopProductMock.id, quantity: 1 },
      ]);
      expect(resolvedCart.consolidatedItems).toEqual([
        { productId: laptopProductMock.id, quantity: 2 },
        { productId: coffeeMakerProductMock.id, quantity: 2 },
      ]);
      expect(resolvedCart.products).toEqual([laptopProductMock, coffeeMakerProductMock]);
      expect(resolvedCart.resolvedItems).toEqual([
        { product: laptopProductMock, quantity: 2 },
        { product: coffeeMakerProductMock, quantity: 2 },
      ]);
      expect(resolvedCart.discountableItems).toEqual([
        { unitPrice: 1299.99, category: laptopProductMock.category, quantity: 2 },
        { unitPrice: 45.5, category: coffeeMakerProductMock.category, quantity: 2 },
      ]);
    });

    it('debería consultar el catálogo una sola vez sin repetir identificadores cuando el mismo producto llega varias veces', async () => {
      await cartResolver.resolveItems([
        { productId: laptopProductMock.id, quantity: 1 },
        { productId: laptopProductMock.id, quantity: 3 },
      ]);
      expect(productRepositoryMock.findByIds.mock.calls).toHaveLength(1);
      expect(productRepositoryMock.findByIds.mock.calls[0][0]).toEqual([laptopProductMock.id]);
    });

    it('debería lanzar ProductNotFoundError con todos los faltantes cuando algún producto no existe', async () => {
      productRepositoryMock.findByIds.mockResolvedValue([laptopProductMock]);
      const secondUnknownUuid = '11111111-1111-4111-8111-111111111111';
      const rejection = cartResolver.resolveItems([
        { productId: UNKNOWN_UUID, quantity: 1 },
        { productId: laptopProductMock.id, quantity: 1 },
        { productId: secondUnknownUuid, quantity: 1 },
      ]);
      await expect(rejection).rejects.toBeInstanceOf(ProductNotFoundError);
      await expect(rejection).rejects.toMatchObject({ missingProductIds: [UNKNOWN_UUID, secondUnknownUuid] });
    });

    it('debería devolver un carrito vacío sin consultar productos inexistentes cuando no hay ítems', async () => {
      productRepositoryMock.findByIds.mockResolvedValue([]);
      const resolvedCart = await cartResolver.resolveItems([]);
      expect(resolvedCart).toEqual({ consolidatedItems: [], products: [], resolvedItems: [], discountableItems: [] });
    });

    it('debería no invocar operaciones de escritura cuando resuelve ítems', async () => {
      await cartResolver.resolveItems([{ productId: laptopProductMock.id, quantity: 1 }]);
      expect(productRepositoryMock.decrementStock.mock.calls).toHaveLength(0);
    });
  });

  describe('resolveCoupon', () => {
    it('debería devolver código y cupón nulos sin consultar el repositorio cuando no se envía cupón', async () => {
      expect(await cartResolver.resolveCoupon(undefined)).toEqual({ couponCode: null, coupon: null });
      expect(couponRepositoryMock.findActiveByCode.mock.calls).toHaveLength(0);
    });

    it('debería devolver el cupón activo junto al código cuando el repositorio lo encuentra', async () => {
      expect(await cartResolver.resolveCoupon('WELCOME2026')).toEqual({
        couponCode: 'WELCOME2026',
        coupon: welcomeCouponMock,
      });
      expect(couponRepositoryMock.findActiveByCode.mock.calls[0][0]).toBe('WELCOME2026');
    });

    it('debería devolver el código con cupón nulo cuando el repositorio no lo encuentra', async () => {
      couponRepositoryMock.findActiveByCode.mockResolvedValue(null);
      expect(await cartResolver.resolveCoupon('NOEXISTE')).toEqual({ couponCode: 'NOEXISTE', coupon: null });
    });
  });
});
