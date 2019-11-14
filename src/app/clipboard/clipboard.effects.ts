import {Injectable} from '@angular/core'
import {Actions, Effect, ofType} from '@ngrx/effects'
import {of, pipe} from 'rxjs'
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  mergeMap,
  pluck,
  switchMap,
  tap
} from 'rxjs/operators'

import {ClipboardService} from '../clipboard.service'
import {fromIdbRequest, TABLE_NAMES} from '../database'
import {DatabaseService} from '../database.service'
import {
  ActionTypes,
  Clip,
  DeleteClip,
  InsertClip,
  NotImplemented,
  PurgeBin,
  RestoreClip,
  SetAllowClipboardRead,
  SetClipboard,
  SetWritePermission,
  UpdateClip
} from './clipboard'

// TBD: Return toast actions.
@Injectable()
export class ClipboardEffects {
  @Effect({dispatch: false})
  setClipboard$ = this.actions.pipe(
    ofType<SetClipboard>(ActionTypes.SetClipboard),
    filter(({stopEffects}) => !stopEffects),
    pluck('clip', 'text'),
    filter<string>(Boolean),
    switchMap(text => this.writeToClipboard(text))
  )
  @Effect()
  insertSnippet$ = this.actions.pipe(
    ofType<InsertClip>(ActionTypes.InsertClip),
    concatMap(({clip}) => this.insertSnippet(clip))
  )
  @Effect({dispatch: false})
  updateSnippet$ = this.actions.pipe(
    ofType<UpdateClip>(ActionTypes.UpdateClip),
    filter(({stopEffects}) => !stopEffects),
    concatMap(({id, clip}) => this.updateSnippet(id, clip))
  )
  @Effect({dispatch: false})
  deleteSnippet$ = this.actions.pipe(
    ofType<DeleteClip>(ActionTypes.DeleteClip),
    concatMap(({id, clip}) =>
      this.deleteSnippet(id).pipe(this.moveToTrash(clip))
    )
  )
  @Effect({dispatch: false})
  purgeBin$ = this.actions.pipe(
    ofType<PurgeBin>(ActionTypes.PurgeBin),
    switchMap(() => this.purgeBin())
  )
  @Effect()
  restoreClip$ = this.actions.pipe(
    ofType<RestoreClip>(ActionTypes.RestoreClip),
    pluck('clip'),
    concatMap(clip => this.restoreClip(clip))
  )
  @Effect({dispatch: false})
  recordReadToggle$ = this.actions.pipe(
    ofType<SetAllowClipboardRead>(ActionTypes.SetAllowClipboardRead),
    pluck('allowed'),
    distinctUntilChanged(),
    concatMap(allowed => this.recordReadToggle(allowed))
  )

  constructor(
    private clipboard: ClipboardService,
    private db: DatabaseService,
    private actions: Actions
  ) {}

  writeToClipboard(text: string) {
    return this.clipboard.writeText(text).pipe(
      catchError(err => {
        console.error('Clipboard API: write error', err)
        return [new SetWritePermission(false), new SetClipboard(null)]
      })
    )
  }
  insertSnippet(clip: Clip) {
    const newClip = {...clip}
    delete newClip.id
    return this.db.transaction.pipe(
      mergeMap(tx => {
        const historyStore = tx.objectStore(TABLE_NAMES.history)
        return fromIdbRequest<number>(historyStore.add(newClip))
      }),
      map(id => new UpdateClip(clip.id, {...newClip, id}, true)),
      catchError(({message}) => of(new NotImplemented(message)))
    )
  }
  // TBD: Open cursor on ID, update cursor with clip.
  updateSnippet(id: number, clip: Clip) {
    return this.db.transaction.pipe(
      mergeMap(tx => {
        const historyStore = tx.objectStore(TABLE_NAMES.history)
        const updateRequest = historyStore.put(clip)
        return fromIdbRequest(updateRequest)
      }),
      catchError(({message}) => of(new NotImplemented(message)))
    )
  }
  deleteSnippet(id: number) {
    return this.db.transaction.pipe(
      mergeMap(tx => {
        const historyStore = tx.objectStore(TABLE_NAMES.history)
        const deleteRequest = historyStore.delete(id)
        return fromIdbRequest(deleteRequest).pipe(mapTo(tx))
      }),
      catchError(({message}) => of(new NotImplemented(message)))
    )
  }
  moveToTrash(clip?: Clip) {
    return pipe(
      tap(res => {
        if (res instanceof Error) {
          throw res
        }
      }),
      filter(() => !!clip),
      concatMap((tx: IDBTransaction) => {
        const binStore = tx.objectStore(TABLE_NAMES.bin)
        const addRequest = binStore.add(clip)
        return fromIdbRequest(addRequest)
      }),
      catchError(({message}) => of(new NotImplemented(message)))
    )
  }
  purgeBin() {
    return this.db.transaction.pipe(
      mergeMap(tx => fromIdbRequest(tx.objectStore(TABLE_NAMES.bin).clear())),
      catchError(({message}) => of(new NotImplemented(message)))
    )
  }
  restoreClip(clip: Clip) {
    return this.db.transaction.pipe(
      mergeMap(tx => {
        const binStore = tx.objectStore(TABLE_NAMES.bin)
        const deleteRequest = binStore.delete(clip.id)
        return fromIdbRequest(deleteRequest)
      }),
      mapTo(new InsertClip(clip)),
      catchError(({message}) => of(new NotImplemented(message)))
    )
  }
  recordReadToggle(allowed: boolean) {
    return this.db.transaction.pipe(
      concatMap(tx => {
        const appStore = tx.objectStore(TABLE_NAMES.appdata)
        const data = {key: 'allowClipboardRead', value: allowed}
        const putRequest = appStore.put(data)
        return fromIdbRequest(putRequest)
      })
    )
  }
}
