import {
  AfterViewInit,
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core'
import {combineLatest} from 'rxjs'
import {filter, take, tap} from 'rxjs/operators'

import {AppBar} from '../app-bar.service'
import {AppService} from '../app.service'
import {
  ClipFavouritesComponent
} from './clip-favourites/clip-favourites.component'

@Component({
  selector: 'clip-clipboard',
  template: `
    <clip-editor></clip-editor>
    <clip-list></clip-list>

    <ng-template #favouritesButton>
      <!-- TODO - Show favourites -->
      <button
        class="icon-button"
        title="Show favourites"
        (click)="showFavourites()"
      >
        <i class="material-icons">favorite_border</i>
      </button>
    </ng-template>
  `,
  styleUrls: ['./clipboard.component.scss']
})
export class ClipboardComponent implements AfterViewInit {
  @ViewChild('viewContainer', {read: ViewContainerRef, static: false})
  viewContainerRef: ViewContainerRef
  @ViewChild('favouritesButton', {read: TemplateRef, static: false})
  favouritesButton: TemplateRef<ElementRef>

  constructor(private app: AppService, private appbar: AppBar) {}
  ngAfterViewInit() {
    this.appbar.clearControls()
    this.appbar.addControl(this.favouritesButton)
  }

  showFavourites() {
    const menuTargetName = 'ClipFavouritesComponent'
    const favouritesComponentRef = this.app.replaceBackdrop(
      ClipFavouritesComponent
    )
    combineLatest([this.appbar.title, favouritesComponentRef])
      .pipe(
        take(1),
        tap(() => {
          this.appbar.addMenuTarget(menuTargetName)
          this.appbar.clearControls()
          this.appbar.setTitle('Favourites')
        })
      )
      .subscribe(([title, componentRef]) => {
        const menuToggleSub = this.appbar.menuToggle$
          .pipe(filter(target => target === menuTargetName))
          .subscribe(
            () => componentRef.instance && componentRef.instance.close()
          )
        componentRef.onDestroy(() => {
          menuToggleSub.unsubscribe()
          this.appbar.removeMenuTarget(menuTargetName)
          this.appbar.setTitle(title)
          this.appbar.addControl(this.favouritesButton)
        })
        componentRef.instance.destroy = () => componentRef.destroy()
      })
  }
}
