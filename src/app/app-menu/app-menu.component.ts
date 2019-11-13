import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core'
import {Store} from '@ngrx/store'
import {getPosition, HideBackdrop, ShowBackdrop} from 'ft-backdrop'
import {filter, take} from 'rxjs/operators'

import {AppBar} from '../app-bar.service'

@Component({
  selector: 'clip-app-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  destroy: () => void

  private menuTargetName = 'AppMenuComponent'
  private menuToggleSub = this.appbar.menuToggle$
    .pipe(filter(target => target === this.menuTargetName))
    .subscribe(() => this.close())

  constructor(private appbar: AppBar, private store: Store<any>) {}
  ngOnInit() {
    this.store.dispatch(new HideBackdrop()) // TODO - Partially hidden backdrop
  }
  ngAfterViewInit() {
    this.store
      .select(getPosition)
      .pipe(
        filter(position => position === 'up'),
        take(1)
      )
      .subscribe(() => {
        this.menuToggleSub.unsubscribe()
        this.appbar.removeMenuTarget(this.menuTargetName)
      })
    this.appbar.addMenuTarget(this.menuTargetName)
  }
  ngOnDestroy() {}

  close() {
    this.store.dispatch(new ShowBackdrop())
    setTimeout(() => this.destroy && this.destroy(), 300)
  }

  @HostListener('window:keydown', ['$event'])
  closeOnEscKey(event: KeyboardEvent) {
    const {isComposing, key} = event
    if (isComposing || key !== 'Escape') {
      return
    }
    event.preventDefault()
    this.close()
  }
}
