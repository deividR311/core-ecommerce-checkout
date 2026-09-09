/** Dependencias NestJS */
import { Inject, Injectable } from '@nestjs/common';

/** Contratos compartidos */
import type { IProduct } from '@cec/shared';

/** Puertos */
import { PRODUCT_REPOSITORY } from '../../domain/ports/product-repository.port';
import type { IProductRepository } from '../../domain/ports/product-repository.port';

/**
 * @class GetProductsUseCase
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Injectable()
export class GetProductsUseCase {
  /**
   * @constructor
   * @param {IProductRepository} productRepository - puerto del catálogo de productos
   */
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly _productRepository: IProductRepository,
  ) {}

  /**
   * Función que obtiene el catálogo completo con el stock actual
   * @returns {Promise<IProduct[]>}
   */
  execute(): Promise<IProduct[]> {
    return this._productRepository.findAll();
  }
}
