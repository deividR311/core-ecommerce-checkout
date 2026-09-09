/** Dependencias Angular */
import { ComponentFixture, TestBed } from '@angular/core/testing';

/** Componentes */
import { CheckoutPageComponent } from './checkout-page.component';

describe('CheckoutPageComponent: pantalla inicial del módulo de checkout', () => {
  let fixture: ComponentFixture<CheckoutPageComponent>;
  let pageElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CheckoutPageComponent] }).compileComponents();
    fixture = TestBed.createComponent(CheckoutPageComponent);
    await fixture.whenStable();
    pageElement = fixture.nativeElement as HTMLElement;
  });

  it('debería renderizar el contenedor de la página cuando se crea el componente', () => {
    expect(pageElement.querySelector('[data-test="div-checkout-page"]')).not.toBeNull();
  });

  it('debería mostrar el título Checkout cuando se renderiza la pantalla inicial', () => {
    const titleElement = pageElement.querySelector('[data-test="div-checkout-page"] h1');
    expect(titleElement?.textContent?.trim()).toBe('Checkout');
  });
});
