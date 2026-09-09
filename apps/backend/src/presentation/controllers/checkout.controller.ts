/** Dependencias NestJS */
import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';

/** Contratos compartidos */
import type { IDiscountBreakdown, IOrder } from '@cec/shared';

/** Casos de uso */
import { ProcessCheckoutUseCase } from '../../application/use-cases/process-checkout.use-case';
import { QuoteCartUseCase } from '../../application/use-cases/quote-cart.use-case';

/** DTOs */
import { CheckoutRequestDto } from '../dto/checkout-request.dto';

/**
 * @class CheckoutController
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Controller('checkout')
export class CheckoutController {
  /** Logger del controlador; registra id de orden y total, nunca el payload del cliente */
  private readonly _logger = new Logger(CheckoutController.name);

  /**
   * @constructor
   * @param {QuoteCartUseCase} quoteCartUseCase - caso de uso de cotización sin mutación de estado
   * @param {ProcessCheckoutUseCase} processCheckoutUseCase - caso de uso de procesamiento de la compra
   */
  constructor(
    private readonly _quoteCartUseCase: QuoteCartUseCase,
    private readonly _processCheckoutUseCase: ProcessCheckoutUseCase,
  ) {}

  /**
   * Función que cotiza el carrito y devuelve el desglose completo; no modifica stock ni persiste órdenes
   * @param {CheckoutRequestDto} checkoutRequest - ítems y cupón opcional ya validados
   * @returns {Promise<IDiscountBreakdown>}
   */
  @Post('quote')
  @HttpCode(HttpStatus.OK)
  quoteCart(@Body() checkoutRequest: CheckoutRequestDto): Promise<IDiscountBreakdown> {
    return this._quoteCartUseCase.execute(checkoutRequest);
  }

  /**
   * Función que procesa la compra y devuelve la orden persistida con estado 201
   * @param {CheckoutRequestDto} checkoutRequest - ítems y cupón opcional ya validados
   * @returns {Promise<IOrder>}
   */
  @Post()
  async processCheckout(@Body() checkoutRequest: CheckoutRequestDto): Promise<IOrder> {
    const order = await this._processCheckoutUseCase.execute(checkoutRequest);
    this._logger.log(
      `CheckoutController > processCheckout - orden creada ${JSON.stringify({ orderId: order.id, finalTotal: order.finalTotal })}`,
    );
    return order;
  }
}
