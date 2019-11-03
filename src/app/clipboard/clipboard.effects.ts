import {Injectable} from '@angular/core'
import {Actions, Effect, ofType} from '@ngrx/effects'
import {of} from 'rxjs'
import {
  catchError,
  concatMap,
  filter,
  map,
  mapTo,
  mergeMap,
  pluck,
  switchMap
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
  SetClipboard,
  SetWritePermission,
  UpdateClip
} from './clipboard'

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
    concatMap(({id}) => this.deleteSnippet(id))
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
    return this.db.transaction.pipe(
      map(tx => [tx.objectStore(TABLE_NAMES.history)]),
      mergeMap(([historyStore]) =>
        fromIdbRequest<number>(historyStore.add(clip)).pipe(
          map(id => [historyStore, id])
        )
      ),
      mergeMap(([historyStore, id]: [IDBObjectStore, number]) => {
        const newClip = {...clip, id}
        return fromIdbRequest(historyStore.put(newClip, id)).pipe(
          mapTo(newClip)
        )
      }),
      map((newClip: Clip) => new UpdateClip(clip.id, newClip, true)),
      catchError(({message}) => of(new NotImplemented(message)))
    )
  }
  updateSnippet(id: number, clip: Clip) {
    return this.db.transaction.pipe(
      mergeMap(tx => {
        const historyStore = tx.objectStore(TABLE_NAMES.history)
        const updateRequest = historyStore.put(clip, id)
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
        return fromIdbRequest(deleteRequest)
      }),
      catchError(({message}) => of(new NotImplemented(message)))
    )
  }
}
