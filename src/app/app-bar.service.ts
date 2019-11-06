import {
  ElementRef,
  Injectable,
  TemplateRef,
  ViewContainerRef
} from '@angular/core'
import {BehaviorSubject, from, Observable, Subject} from 'rxjs'
import {
  filter,
  last,
  map,
  mergeAll,
  switchMap,
  take,
  toArray
} from 'rxjs/operators'

/**
 * TODO
 *  - Use NgRx Store to manage the state.
 *  - Vertical sidebar for landscape orientation
 */
@Injectable({
  providedIn: 'root'
})
export class AppBar {
  // tslint:disable-next-line: variable-name
  private _orientation: 'landscape' | 'portrait' = 'portrait'
  private targets$ = new BehaviorSubject<string[]>([])
  private menu$ = new Subject<string>()
  private title$ = new BehaviorSubject<string>('')
  private appControlsViewRef$ = new BehaviorSubject<ViewContainerRef>(null)

  /** NOTE: Only the AppBarComponent should call this. */
  bindView(view: ViewContainerRef) {
    this.appControlsViewRef$.next(view)
  }

  toggleMenu() {
    this.targets$
      .pipe(
        take(1),
        mergeAll(),
        last(null, null)
      )
      .subscribe(target => this.menu$.next(target))
  }
  addMenuTarget(target: string) {
    this.targets$
      .pipe(
        take(1),
        map(targets => [...targets, target])
      )
      .subscribe(targets => this.targets$.next(targets))
  }
  removeMenuTarget(removeTarget: string) {
    this.targets$
      .pipe(
        take(1),
        mergeAll(),
        filter(target => target !== removeTarget),
        toArray()
      )
      .subscribe(targets => this.targets$.next(targets))
  }

  setTitle(title: string) {
    this.title$.next(title)
  }
  addControl(control: TemplateRef<ElementRef>) {
    this.controls.subscribe(controls => controls.createEmbeddedView(control))
  }
  clearControls() {
    this.controls.subscribe(controls => controls.clear())
  }

  get orientation() {
    return this._orientation
  }
  set orientation(orientation) {
    this._orientation = orientation
  }

  get menuTarget$() {
    return this.targets$.pipe(
      switchMap(targets => from(targets).pipe(last(null, null)))
    )
  }
  get menuToggle$() {
    return this.menu$.asObservable()
  }
  /** NOTE: Observable (hot) */
  get title(): Observable<string> {
    return this.title$.pipe(
      map(title => (typeof title === 'string' ? title : ''))
    )
  }
  get controls(): Observable<ViewContainerRef> {
    return this.appControlsViewRef$.pipe(
      take(1),
      filter<ViewContainerRef>(Boolean)
    )
  }
}
