/** Dependencias Angular */
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';

/** Configuración de la aplicación */
import { appConfig } from './app.config';

/** Componentes */
import { AppComponent } from './app.component';
import { CheckoutPageComponent } from './checkout/components/checkout-page/checkout-page.component';

describe('AppComponent: arranque y enrutamiento raíz de la aplicación', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: appConfig.providers,
    }).compileComponents();
  });

  it('debería crear el componente raíz cuando se inicializa la aplicación', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeInstanceOf(AppComponent);
  });

  it('debería renderizar la pantalla de checkout cuando se navega a la ruta raíz', async () => {
    const routerHarness = await RouterTestingHarness.create();
    const activatedComponent = await routerHarness.navigateByUrl('/', CheckoutPageComponent);
    expect(activatedComponent).toBeInstanceOf(CheckoutPageComponent);
  });

  it('debería redirigir a la pantalla de checkout cuando la ruta no existe', async () => {
    const routerHarness = await RouterTestingHarness.create();
    const activatedComponent = await routerHarness.navigateByUrl('/ruta-inexistente', CheckoutPageComponent);
    expect(activatedComponent).toBeInstanceOf(CheckoutPageComponent);
  });
});
