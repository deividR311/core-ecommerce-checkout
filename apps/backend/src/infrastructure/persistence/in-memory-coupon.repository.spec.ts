/** Repositorio bajo prueba */
import { InMemoryCouponRepository } from './in-memory-coupon.repository';

describe('InMemoryCouponRepository: búsqueda de cupones activos por código', () => {
  let couponRepository: InMemoryCouponRepository;

  beforeEach(() => {
    couponRepository = new InMemoryCouponRepository();
  });

  it('debería devolver el cupón del enunciado cuando se busca WELCOME2026', async () => {
    expect(await couponRepository.findActiveByCode('WELCOME2026')).toEqual({
      code: 'WELCOME2026',
      discountRate: 0.15,
      isActive: true,
    });
  });

  it('debería devolver el cupón de demostración cuando se busca DEMO30', async () => {
    expect(await couponRepository.findActiveByCode('DEMO30')).toEqual({
      code: 'DEMO30',
      discountRate: 0.3,
      isActive: true,
    });
  });

  it('debería devolver null cuando el cupón existe pero está inactivo', async () => {
    expect(await couponRepository.findActiveByCode('SUMMER2025')).toBeNull();
  });

  it('debería devolver null cuando el código no existe', async () => {
    expect(await couponRepository.findActiveByCode('NOEXISTE')).toBeNull();
  });

  it('debería devolver null cuando el código no está normalizado en mayúsculas', async () => {
    expect(await couponRepository.findActiveByCode('welcome2026')).toBeNull();
  });

  it('debería devolver una copia cuando se busca un cupón para que el consumidor no altere el estado interno', async () => {
    const welcomeCoupon = await couponRepository.findActiveByCode('WELCOME2026');
    if (welcomeCoupon) {
      welcomeCoupon.discountRate = 0.99;
    }
    expect((await couponRepository.findActiveByCode('WELCOME2026'))?.discountRate).toBe(0.15);
  });
});
