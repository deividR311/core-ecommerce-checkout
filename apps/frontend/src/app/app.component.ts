/** Dependencias Angular */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * @class AppComponent
 * @author Johan Rodriguez – jcendales@soysentinel.com
 * @copyright Sentinel-2026
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
