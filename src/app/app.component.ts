import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core'
import {filter} from 'rxjs/operators'

import {AppBar} from './app-bar.service'
import {AppMenuComponent} from './app-menu/app-menu.component'
import {AppService} from './app.service'

/**
 * TODO
 *  - Move app-bar component out of SharedModule
 *  - Denote hot Observables with a '$' suffix
 *  - Global app styles imported using styleUrls instead of SCSS
 *  - Shared clip styles (i.e. _clip.scss)
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
export class AppComponent implements OnDestroy, AfterViewInit {
  @ViewChild('viewContainer', {read: ViewContainerRef, static: false})
  viewContainerRef: ViewContainerRef
  title = 'Snowclip' // TBD: Move to a constants file.

  private menuToggleSub = this.appbar.menuToggle$
    .pipe(filter(target => target == null))
    .subscribe(() => this.showMenu())

  constructor(private app: AppService, private appbar: AppBar) {}
  ngAfterViewInit() {
    this.appbar.setTitle(this.title)
    this.app.bindView(this.viewContainerRef)
  }
  ngOnDestroy() {
    this.menuToggleSub.unsubscribe()
  }

  showMenu() {
    this.app.replaceBackdrop(AppMenuComponent).subscribe(componentRef => {
      componentRef.instance.destroy = () => componentRef.destroy()
    })
  }
}
