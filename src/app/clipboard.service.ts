import {Injectable} from '@angular/core'
import {Store} from '@ngrx/store'
import {combineLatest, EMPTY, merge, Observable, of, throwError} from 'rxjs'
import {
  catchError,
  filter,
  map,
  mapTo,
  mergeMap,
  switchMap,
  take,
  tap,
  throwIfEmpty,
  toArray
} from 'rxjs/operators'

import {
  Clip,
  ClipboardState,
  getReadPermissionStatus,
  getWritePermissionStatus,
  LoadHistory,
  SetClipboard,
  SetEditingText,
  SetReadAvailibility,
  SetReadPermission,
  SetWriteAvailibility,
  SetWritePermission
} from './clipboard/clipboard'
import {fromIdbCursor, TABLE_NAMES} from './database'
import {DatabaseService} from './database.service'
import {PermissionsService} from './permissions.service'

/**
 * TODO - Move into CoreModule
 * TODO - UWA version must provide a native version for this service.
 * TBD: Set onchange permission query to dispatch set clipboard permission.
 */
@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
  private permissionsApiError: boolean
  private clipboard: Observable<Clipboard>

  readPermission = this.store.select(getReadPermissionStatus)
  writePermission = this.store.select(getWritePermissionStatus)

  constructor(
    private permissions: PermissionsService,
    private db: DatabaseService,
    private window: Window,
    private store: Store<ClipboardState>
  ) {
    if ('navigator' in this.window && 'clipboard' in this.window.navigator) {
      this.clipboard = of(this.window.navigator.clipboard)
      // TBD: Consider moving the loading of past states elsewhere.
      this.db.transaction
        .pipe(
          mergeMap(tx => {
            const historyStore = tx.objectStore(TABLE_NAMES.history)
            const cursorRequest = historyStore.openCursor(null, 'prev')
            return fromIdbCursor<Partial<Clip>>(cursorRequest)
          }),
          // take(10), // TODO - Load more clips on scroll
          map(serializedClip => new Clip(serializedClip)),
          toArray()
        )
        .subscribe(clips => {
          this.store.dispatch(
            new SetEditingText((clips[0] && clips[0].text) || '')
          )
          this.store.dispatch(new SetClipboard(new Clip(clips[0]), true))
          this.store.dispatch(new LoadHistory(clips))
        })
      // Gets the current clipboard read and write permissions.
      merge(this.getReadPermission(), this.getWritePermission()).subscribe()
    } else {
      this.clipboard = throwError(new Error('Clipboard API not supported.'))
    }
  }

  getReadPermission() {
    return this.permissions.query({name: 'clipboard-read'}).pipe(
      switchMap(({state}) => this.setReadPermission(state)),
      catchError(err => {
        if (!(err instanceof TypeError)) {
          throw err
        }
        this.store.dispatch(new SetReadAvailibility(false))
        return EMPTY
      })
    )
  }
  getWritePermission() {
    return this.permissions.query({name: 'clipboard-write'}).pipe(
      switchMap(({state}) => this.setWritePermission(state)),
      catchError(err => {
        if (!(err instanceof TypeError)) {
          throw err
        }
        this.store.dispatch(new SetWriteAvailibility(false))
        return EMPTY
      })
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

  /**
   * NOTE: Only Chrome supports reading from the clipboard.
   */
  readText(skipCheck?: boolean) {
    if (skipCheck) {
      return this.clipboard.pipe(
        mergeMap(clipboard => clipboard.readText()),
        map(text => new Clip({text}))
      )
    }
    const isReadable$ = this.getReadPermission().pipe(
      filter(state => this.isPermissible(state)),
      catchError(this.continueWithWarning.bind(this)),
      throwIfEmpty(() => new Error('Clipboard read permission denied.'))
    )
    const textClip$ = combineLatest([this.clipboard, isReadable$]).pipe(
      take(1),
      mergeMap(([clipboard]) => clipboard.readText()),
      map(text => new Clip({text}))
    )
    return textClip$
  }
  // TBD: If no permission, select text and document.execCommand('copy').
  writeText(text: string, skipCheck?: boolean) {
    if (typeof text !== 'string') {
      return EMPTY
    }
    if (skipCheck) {
      return this.clipboard.pipe(
        take(1),
        mergeMap(clipboard => clipboard.writeText(text))
      )
    }
    const isWritable$ = this.getWritePermission().pipe(
      filter(state => this.isPermissible(state)),
      catchError(this.continueWithWarning.bind(this)),
      throwIfEmpty(() => new Error('Clipboard write permission denied.'))
    )
    const writeToClipboard$ = combineLatest([this.clipboard, isWritable$]).pipe(
      take(1),
      mergeMap(([clipboard]) => clipboard.writeText(text))
    )
    return writeToClipboard$
  }

  // /**
  //  * Not implemented.
  //  * NOTE: Only works in Chrome?
  //  */
  // read() {
  //   // @ts-ignore
  //   this.window.navigator.permissions
  //     .query({name: 'clipboard-read'} as any)
  //     .then(result => {
  //       if (result.state === 'granted' || result.state === 'prompt') {
  //         this.clipboard
  //           .pipe(
  //             mergeMap((clipboard: any) => clipboard.read()),
  //             mergeAll(),
  //             filter(({types}) => types.includes('text/plain')),
  //             mergeMap((data: any) => data.getType('text/plain')),
  //             mergeMap((blob: any) => blob.text())
  //           )
  //           .subscribe(text => console.log(`Clipboard: ${text}`))
  //       }
  //     })
  // }

  private isPermissible(state: string) {
    return String.prototype.match.call(state, /(granted)|(prompt)/) != null
  }
  private continueWithWarning({message}: Error) {
    if (!this.permissionsApiError) {
      this.permissionsApiError = true
      console.warn(message)
    }
    return of(true)
  }
  private setReadPermission(state: string) {
    return this.readPermission.pipe(
      take(1),
      tap(readable => {
        const permission = state === 'granted'
        if (permission !== readable) {
          this.store.dispatch(new SetReadPermission(permission))
        }
      }),
      mapTo(state)
    )
  }
  private setWritePermission(state: string) {
    return this.readPermission.pipe(
      take(1),
      tap(writable => {
        const permission = state === 'granted'
        if (permission !== writable) {
          this.store.dispatch(new SetWritePermission(permission))
        }
      }),
      mapTo(state)
    )
  }
}
