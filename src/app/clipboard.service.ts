import {Clipboard as CdkClipboard} from '@angular/cdk/clipboard'
import {Injectable} from '@angular/core'
import {Store} from '@ngrx/store'
import {EMPTY, merge, Observable, of, pipe, throwError} from 'rxjs'
import {
  catchError,
  filter,
  map,
  mapTo,
  mergeAll,
  mergeMap,
  pluck,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs/operators'

import {
  Clip,
  ClipboardState,
  getReadPermissionStatus,
  getWritePermissionStatus,
  SetReadAvailibility,
  SetReadPermission,
  SetWriteAvailibility,
  SetWritePermission
} from './clipboard/clipboard'
import {PermissionsService} from './permissions.service'

/**
 * TODO
 *  - Move into CoreModule
 *  - UWA version must provide a native version for this service.
 * TBD: Set onchange permission query to dispatch set clipboard permission.
 */
@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
  readPermission = this.store.select(getReadPermissionStatus)
  writePermission = this.store.select(getWritePermissionStatus)

  private clipboard: Observable<Clipboard>

  constructor(
    private permissions: PermissionsService,
    private window: Window,
    private cdkClipboard: CdkClipboard,
    private store: Store<ClipboardState>
  ) {
    if ('navigator' in this.window && 'clipboard' in this.window.navigator) {
      this.clipboard = of(this.window.navigator.clipboard)
      merge(this.checkReadPermission(), this.checkWritePermission()).subscribe()
    } else {
      this.clipboard = throwError(new Error('Clipboard API not supported.'))
    }
  }

  checkReadPermission() {
    const checkReadAvailability = pipe(
      tap((clipboard: Clipboard) => {
        if (!('readText' in clipboard)) {
          this.store.dispatch(new SetReadAvailibility(false))
        }
      }),
      mapTo('prompt')
    )
    return this.permissions.query({name: 'clipboard-read'}).pipe(
      switchMap(({state}) => this.setReadPermission(state)),
      catchError(() => this.clipboard.pipe(checkReadAvailability))
    )
  }
  checkWritePermission() {
    const checkWriteAvailability = pipe(
      tap((clipboard: Clipboard) => {
        if (!('writeText' in clipboard)) {
          this.store.dispatch(new SetWriteAvailibility(false))
        }
      }),
      mapTo('prompt')
    )
    return this.permissions.query({name: 'clipboard-write'}).pipe(
      switchMap(({state}) => this.setWritePermission(state)),
      catchError(() => this.clipboard.pipe(checkWriteAvailability))
    )
  }
  revokeReadPermission() {
    return this.permissions
      .revoke({name: 'clipboard-read'})
      .pipe(switchMap(({state}) => this.setReadPermission(state)))
  }
  revokeWritePermission() {
    return this.permissions
      .revoke({name: 'clipboard-write'})
      .pipe(switchMap(({state}) => this.setWritePermission(state)))
  }

  /** NOTE: Only Chrome supports reading from the clipboard. */
  readText(): Observable<Clip> {
    return this.getClipboardWithPermission(this.readPermission).pipe(
      mergeMap(clipboard => clipboard.readText()),
      map(text => new Clip({text}))
    )
  }
  writeText(text: string): Observable<void> {
    if (typeof text !== 'string') {
      return throwError(new Error('Clipboard write failed: Type error.'))
    }
    return this.getClipboardWithPermission(this.writePermission).pipe(
      tap(clipboard => {
        if (!('writeText' in clipboard)) {
          // Fallback method:
          // textarea + HTMLInputElement.select() + Document.execCommand('copy')
          throw new Error(`Falling back to document.execCommand('copy')`)
        }
      }),
      mergeMap(clipboard => clipboard.writeText(text)),
      catchError(() => (this.cdkClipboard.copy(text), EMPTY))
    )
  }

  /**
   * Do not use (for now).
   * NOTE: Only works in Chrome.
   */
  read() {
    return this.getClipboardWithPermission(this.readPermission).pipe(
      mergeMap((clipboard: any) => clipboard.read()),
      mergeAll(),
      filter(({types}) => types.includes('text/plain')),
      mergeMap((data: any) => data.getType('text/plain')),
      mergeMap((blob: any) => blob.text()),
      map((text: string) => new Clip({text}))
    )
  }

  private getClipboardWithPermission(permission: Observable<boolean>) {
    return permission.pipe(
      take(1),
      filter(Boolean),
      withLatestFrom(this.clipboard),
      pluck(1)
    )
  }
  private setReadPermission(state: string) {
    return this.readPermission.pipe(
      take(1),
      tap(readable => {
        const permission = state.match(/(prompt)|(granted)/g) != null
        if (permission !== readable) {
          this.store.dispatch(new SetReadPermission(permission))
        }
      }),
      mapTo(state)
    )
  }
  private setWritePermission(state: string) {
    return this.writePermission.pipe(
      take(1),
      tap(writable => {
        const permission = state.match(/(prompt)|(granted)/g) != null
        if (permission !== writable) {
          this.store.dispatch(new SetWritePermission(permission))
        }
      }),
      mapTo(state)
    )
  }
}
