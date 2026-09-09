/** Fábrica bajo prueba */
import { DiscountStrategyFactory } from './discount-strategy.factory';

/** Estrategias */
import { CategoryDiscountStrategy } from './strategies/category-discount.strategy';
import { CouponDiscountStrategy } from './strategies/coupon-discount.strategy';
import { MaxDiscountCapStrategy } from './strategies/max-discount-cap.strategy';
import { VolumeDiscountStrategy } from './strategies/volume-discount.strategy';

describe('DiscountStrategyFactory: construcción de la cadena de reglas en orden de precedencia', () => {
  it('debería devolver las cuatro estrategias en orden categoría, volumen, cupón y tope cuando se crea la cadena', () => {
    const chain = DiscountStrategyFactory.createChain();
    expect(chain).toHaveLength(4);
    expect(chain[0]).toBeInstanceOf(CategoryDiscountStrategy);
    expect(chain[1]).toBeInstanceOf(VolumeDiscountStrategy);
    expect(chain[2]).toBeInstanceOf(CouponDiscountStrategy);
    expect(chain[3]).toBeInstanceOf(MaxDiscountCapStrategy);
  });

  it('debería colocar el tope como última estrategia cuando se crea la cadena', () => {
    const chain = DiscountStrategyFactory.createChain();
    expect(chain[chain.length - 1]).toBeInstanceOf(MaxDiscountCapStrategy);
  });

  it('debería devolver instancias nuevas cuando se crea la cadena más de una vez', () => {
    expect(DiscountStrategyFactory.createChain()[0]).not.toBe(DiscountStrategyFactory.createChain()[0]);
  });
});
