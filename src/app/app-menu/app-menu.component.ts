import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewContainerRef
} from '@angular/core'
import {Store} from '@ngrx/store'
import {
  getIsAnimating,
  getPosition,
  HideBackdrop,
  ShowBackdrop
} from 'ft-backdrop'
import {combineLatest, from, of, range} from 'rxjs'
import {
  defaultIfEmpty,
  filter,
  map,
  mapTo,
  mergeMap,
  pluck,
  take,
  toArray,
  withLatestFrom
} from 'rxjs/operators'

import {AppBar} from '../app-bar.service'

@Component({
  selector: 'clip-app-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent implements OnInit, AfterViewInit {
  destroy: () => void

  private menuTargetName = 'AppMenuComponent'
  private menuToggleSub = this.appbar.menuToggle$
    .pipe(filter(target => target === this.menuTargetName))
    .subscribe(() => this.close())

  constructor(
    private appbar: AppBar,
    private store: Store<any>,
    private elementRef: ElementRef
  ) {}
  ngOnInit() {
    this.cleanupOnClose()
  }
  ngAfterViewInit() {
    const translateY = `${this.elementRef.nativeElement.offsetHeight}px`
    this.store.dispatch(new HideBackdrop({translateY}))
    this.appbar.addMenuTarget(this.menuTargetName)
  }

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

  private cleanupOnClose() {
    const detachControls = mergeMap((viewContainerRef: ViewContainerRef) =>
      combineLatest([
        of(viewContainerRef),
        range(1, viewContainerRef.length).pipe(
          map(() => viewContainerRef.detach()),
          toArray()
        )
      ]).pipe(take(1))
    )
    const waitUntilMenuClose = mergeMap(controls =>
      this.store.select(getPosition).pipe(
        filter(position => position === 'up'),
        take(1),
        mapTo(controls)
      )
    )
    const reattachControls = mergeMap(([viewContainerRef, viewRefs]) =>
      from(viewRefs).pipe(map(viewRef => viewContainerRef.insert(viewRef)))
    )
    this.store
      .select(getIsAnimating)
      .pipe(
        filter(Boolean),
        take(1),
        withLatestFrom(this.appbar.controls),
        pluck(1),
        detachControls,
        waitUntilMenuClose,
        reattachControls,
        defaultIfEmpty()
      )
      .subscribe(() => {
        this.menuToggleSub.unsubscribe()
        this.appbar.removeMenuTarget(this.menuTargetName)
      })
  }
}
