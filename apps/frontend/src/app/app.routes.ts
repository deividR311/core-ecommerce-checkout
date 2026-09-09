/** Dependencias Angular */
import { Routes } from '@angular/router';

/** Componentes */
import { CheckoutPageComponent } from './checkout/components/checkout-page/checkout-page.component';

/** Rutas de la aplicación: el checkout es la única pantalla y cualquier ruta desconocida vuelve a ella */
export const routes: Routes = [
  { path: '', component: CheckoutPageComponent },
  { path: '**', redirectTo: '' },
];
