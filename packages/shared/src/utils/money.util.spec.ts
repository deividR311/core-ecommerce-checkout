/** Utilidades bajo prueba */
import { roundMoney, roundRate } from './money.util';

describe('moneyUtil: redondeo de montos y tasas del desglose de descuentos', () => {
  it('debería conservar dos decimales cuando el monto ya tiene esa precisión', () => {
    expect(roundMoney(1299.99)).toBe(1299.99);
  });

  it('debería redondear hacia arriba cuando el tercer decimal es cinco', () => {
    expect(roundMoney(944.765)).toBe(944.77);
    expect(roundMoney(1.005)).toBe(1.01);
  });

  it('debería redondear hacia abajo cuando el tercer decimal es menor a cinco', () => {
    expect(roundMoney(778.044015)).toBe(778.04);
  });

  it('debería retornar cero cuando el monto es cero', () => {
    expect(roundMoney(0)).toBe(0);
  });

  it('debería eliminar el error de coma flotante cuando el monto proviene de una resta binaria', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });

  it('debería conservar cuatro decimales cuando la tasa proviene de la cascada real', () => {
    expect(roundRate(0.27325)).toBe(0.2733);
  });

  it('debería mantener exacta la tasa del tope cuando se redondea el 35%', () => {
    expect(roundRate(0.35)).toBe(0.35);
  });
});
