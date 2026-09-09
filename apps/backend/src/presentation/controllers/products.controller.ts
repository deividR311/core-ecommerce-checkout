/** Dependencias NestJS */
import { Controller, Get } from '@nestjs/common';

/** Contratos compartidos */
import type { IProduct } from '@cec/shared';

/** Casos de uso */
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';

/**
 * @class ProductsController
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Controller('products')
export class ProductsController {
  /**
   * @constructor
   * @param {GetProductsUseCase} getProductsUseCase - caso de uso de consulta del catálogo
   */
  constructor(private readonly _getProductsUseCase: GetProductsUseCase) {}

  /**
   * Función que expone el catálogo de productos con su stock actual; operación de solo lectura
   * @returns {Promise<IProduct[]>}
   */
  @Get()
  getProducts(): Promise<IProduct[]> {
    return this._getProductsUseCase.execute();
  }
}
