import {Component} from '@angular/compiler/src/core'
import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  Type,
  ViewContainerRef
} from '@angular/core'
import {BehaviorSubject, Subject} from 'rxjs'
import {filter, map, publishLast, refCount, take, tap} from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AppService {
  backdropEvent$ = new Subject<ComponentRef<Component>>()

  private backdropViewContainerRef$ = new BehaviorSubject<ViewContainerRef>(
    null
  )

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  /** NOTE: Only the AppComponent should call this. */
  bindView(viewContainerRef: ViewContainerRef) {
    this.backdropViewContainerRef$.next(viewContainerRef)
  }

  replaceBackdrop<T>(component: Type<T>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      component
    )
    const componentRef$ = this.backdropViewContainerRef$.pipe(
      filter<ViewContainerRef>(Boolean),
      take(1),
      tap(backdropView => backdropView.clear()),
      map(backdropView =>
        backdropView.createComponent(componentFactory, undefined, this.injector)
      ),
      publishLast(),
      refCount<ComponentRef<T>>()
    )
    componentRef$.subscribe(componentRef =>
      this.backdropEvent$.next(componentRef)
    )
    return componentRef$
  }
}
