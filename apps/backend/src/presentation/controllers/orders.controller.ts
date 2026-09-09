/** Dependencias NestJS */
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

/** Contratos compartidos */
import type { IOrder } from '@cec/shared';

/** Casos de uso */
import { GetOrderByIdUseCase } from '../../application/use-cases/get-order-by-id.use-case';
import { GetOrdersUseCase } from '../../application/use-cases/get-orders.use-case';

/** Fábricas de excepciones */
import { createInvalidOrderIdException } from '../../infrastructure/http/validation-exception.factory';

/** Versión de UUID con la que se generan las órdenes */
const ORDER_ID_UUID_VERSION = '4';

/**
 * @class OrdersController
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Controller('orders')
export class OrdersController {
  /**
   * @constructor
   * @param {GetOrdersUseCase} getOrdersUseCase - caso de uso de listado de órdenes
   * @param {GetOrderByIdUseCase} getOrderByIdUseCase - caso de uso de consulta de una orden
   */
  constructor(
    private readonly _getOrdersUseCase: GetOrdersUseCase,
    private readonly _getOrderByIdUseCase: GetOrderByIdUseCase,
  ) {}

  /**
   * Función que lista las órdenes procesadas de la más reciente a la más antigua; operación de solo lectura
   * @returns {Promise<IOrder[]>}
   */
  @Get()
  getOrders(): Promise<IOrder[]> {
    return this._getOrdersUseCase.execute();
  }

  /**
   * Función que devuelve una orden por su identificador; un id sin formato UUID responde 400 antes de llegar aquí
   * @param {string} orderId - identificador UUID v4 de la orden
   * @returns {Promise<IOrder>}
   */
  @Get(':id')
  getOrderById(
    @Param('id', new ParseUUIDPipe({ version: ORDER_ID_UUID_VERSION, exceptionFactory: createInvalidOrderIdException }))
    orderId: string,
  ): Promise<IOrder> {
    return this._getOrderByIdUseCase.execute(orderId);
  }
}
