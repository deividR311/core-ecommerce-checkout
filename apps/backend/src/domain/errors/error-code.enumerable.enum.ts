/**
 * Códigos de error legibles por máquina con formato CEC_{MODULO}_{CONSECUTIVO}.
 * Consecutivo 1xxx: presentación; 2xxx: aplicación; 3xxx: dominio.
 */
export enum ErrorCodeEnum {
  /** Payload de cotización o checkout rechazado por la validación estructural */
  CHECKOUT_INVALID_PAYLOAD = 'CEC_CHECKOUT_1001',

  /** Cuerpo de la petición mayor al límite permitido */
  CHECKOUT_PAYLOAD_TOO_LARGE = 'CEC_CHECKOUT_1002',

  /** Identificador de orden sin formato UUID */
  ORDERS_INVALID_ID = 'CEC_ORDERS_1001',

  /** Error no controlado; el cliente recibe un mensaje genérico */
  CHECKOUT_UNEXPECTED_ERROR = 'CEC_CHECKOUT_2001',

  /** Algún producto del carrito no existe en el catálogo */
  PRODUCTS_NOT_FOUND = 'CEC_PRODUCTS_3001',

  /** Cupón inexistente o inactivo; el mensaje no distingue entre ambos */
  DISCOUNTS_INVALID_COUPON = 'CEC_DISCOUNTS_3001',

  /** Uno o más ítems superan el stock disponible */
  CHECKOUT_INSUFFICIENT_STOCK = 'CEC_CHECKOUT_3001',

  /** La orden consultada no existe */
  ORDERS_NOT_FOUND = 'CEC_ORDERS_3001',
}
