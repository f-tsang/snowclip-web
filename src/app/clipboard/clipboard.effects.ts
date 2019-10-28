import {Injectable} from '@angular/core'
import {Actions, Effect, ofType} from '@ngrx/effects'
import {Store} from '@ngrx/store'
import {
  catchError,
  filter,
  map,
  mapTo,
  mergeMap,
  pluck,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators'

import {ClipboardService} from '../clipboard.service'
import {fromIdbRequest, TABLE_NAMES} from '../database'
import {DatabaseService} from '../database.service'
import {
  ActionTypes,
  AddToHistory,
  Clip,
  ClipboardState,
  getHistory,
  SetClipboard,
  SetEditingClipboard
} from './clipboard'

@Injectable()
export class ClipboardEffects {
  @Effect()
  setClipboard$ = this.actions.pipe(
    ofType<SetClipboard>(ActionTypes.SetClipboard),
    pluck('clip'),
    filter<Clip>(Boolean),
    withLatestFrom(
      this.store.select(getHistory).pipe(
        filter(Boolean),
        map(clips => new Clip(clips[0]))
      )
    ),
    tap(clips => console.log(clips)),
    filter(([{text: newText}, {text: oldText}]) => newText !== oldText),
    switchMap(([clip]) =>
      this.clipboard.writeText(clip.text).pipe(
        mergeMap(() => this.db.transaction),
        mergeMap(tx => {
          const historyStore = tx.objectStore(TABLE_NAMES.history)
          const addRequest = historyStore.add(clip)
          return fromIdbRequest(addRequest)
        }),
        mapTo(new AddToHistory(clip)),
        catchError(err => {
          console.log(err)
          return [new SetClipboard(null), new SetEditingClipboard(false)]
        })
      )
    )
  )

  constructor(
    private clipboard: ClipboardService,
    private db: DatabaseService,
    private store: Store<ClipboardState>,
    private actions: Actions
  ) {}
}
