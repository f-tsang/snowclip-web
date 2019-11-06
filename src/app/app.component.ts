import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef
} from '@angular/core'

import {AppBar} from './app-bar.service'
import {AppService} from './app.service'

/**
 * TODO
 *  - Move app-bar component out of SharedModule
 *  - Denote hot Observables with a '$' suffix
 */
@Component({
  selector: 'clip-root',
  template: `
    <clip-app-bar [title]="title"></clip-app-bar>

    <div class="backdrop">
      <div class="backdrop-back-layer">
        <ng-container #viewContainer></ng-container>
      </div>
      <ft-backdrop>
        <router-outlet></router-outlet>
      </ft-backdrop>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('viewContainer', {read: ViewContainerRef, static: false})
  viewContainerRef: ViewContainerRef
  title = 'Snowclip'

  constructor(private app: AppService, private appbar: AppBar) {}
  ngAfterViewInit() {
    this.appbar.setTitle(this.title)
    this.app.bindView(this.viewContainerRef)
  }
}
