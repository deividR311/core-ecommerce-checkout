/** Dependencias Angular */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * @class CheckoutPageComponent
 * @author Johan Rodriguez – jcendales@soysentinel.com
 * @copyright Sentinel-2026
 */
@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent {}
