/** Cantidad de decimales de un monto monetario */
const MONEY_DECIMALS = 2;

/** Cantidad de decimales de una tasa expresada como fracción decimal */
const RATE_DECIMALS = 4;

/** Base decimal usada para construir el factor de redondeo */
const DECIMAL_BASE = 10;

/**
 * Función que redondea un valor a la cantidad de decimales indicada corrigiendo el error de coma flotante
 * @param {number} value - valor a redondear
 * @param {number} decimals - cantidad de decimales a conservar
 * @returns {number}
 */
const roundToDecimals = (value: number, decimals: number): number => {
  const factor = DECIMAL_BASE ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * Función que redondea un monto monetario a dos decimales; se aplica solo al construir el desglose final
 * @param {number} amount - monto con precisión completa
 * @returns {number}
 */
export const roundMoney = (amount: number): number => roundToDecimals(amount, MONEY_DECIMALS);

/**
 * Función que redondea una tasa expresada como fracción decimal a cuatro decimales
 * @param {number} rate - tasa con precisión completa
 * @returns {number}
 */
export const roundRate = (rate: number): number => roundToDecimals(rate, RATE_DECIMALS);
