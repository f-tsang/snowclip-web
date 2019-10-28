import {Injectable} from '@angular/core'
import {Actions, Effect, ofType} from '@ngrx/effects'
import {EMPTY} from 'rxjs'
import {
  catchError,
  concatMap,
  filter,
  mergeMap,
  pluck,
  switchMap
} from 'rxjs/operators'

import {ClipboardService} from '../clipboard.service'
import {fromIdbRequest, TABLE_NAMES} from '../database'
import {DatabaseService} from '../database.service'
import {
  ActionTypes,
  AddToHistory,
  Clip,
  SetClipboard,
  SetWritePermission
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
  @Effect({dispatch: false})
  saveSnippet$ = this.actions.pipe(
    ofType<AddToHistory>(ActionTypes.AddToHistory),
    concatMap(({clip}) => this.saveSnippet(clip))
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
  saveSnippet(clip: Clip) {
    return this.db.transaction.pipe(
      mergeMap(tx => {
        const historyStore = tx.objectStore(TABLE_NAMES.history)
        return fromIdbRequest<number>(historyStore.add(clip)).pipe(
          mergeMap(id => fromIdbRequest(historyStore.put({...clip, id}, id)))
        )
      }),
      catchError(
        err => (console.error('IndexedDB: transaction aborted', err), EMPTY)
      )
    )
  }
}
