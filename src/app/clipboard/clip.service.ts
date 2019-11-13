import {Injectable} from '@angular/core'
import {Store} from '@ngrx/store'
import {combineLatest, merge, pipe} from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  publish,
  take,
  tap,
  toArray
} from 'rxjs/operators'

import {fromIdbCursor, fromIdbRequest, TABLE_NAMES} from '../database'
import {DatabaseService} from '../database.service'
import {
  Clip,
  ClipboardState,
  DeleteClip,
  getCurrentClip,
  getEditingText,
  getIsEditingClipboard,
  LoadHistory,
  SetAllowClipboardRead,
  SetClipboard,
  SetEditingText,
  UpdateClip
} from './clipboard'

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  isEditing = this.store.select(getIsEditingClipboard)
  editingText = this.store.select(getEditingText)
  buffer = this.store.select(getCurrentClip).pipe(
    map(clip => (clip && clip.text) || ''),
    distinctUntilChanged()
  )

  private loadReadToggle = pipe(
    mergeMap((tx: IDBTransaction) => {
      const appStore = tx.objectStore(TABLE_NAMES.appdata)
      const getRequest = appStore.get('allowClipboardRead')
      return fromIdbRequest(getRequest)
    }),
    filter(Boolean),
    tap(({value}) => this.store.dispatch(new SetAllowClipboardRead(value)))
  )
  private loadHistory = pipe(
    mergeMap((tx: IDBTransaction) => {
      const historyStore = tx.objectStore(TABLE_NAMES.history)
      const cursorRequest = historyStore.openCursor(null, 'prev')
      return fromIdbCursor<Partial<Clip>>(cursorRequest)
    }),
    // take(10), // TODO - Load more clips on scroll
    map(serializedClip => new Clip(serializedClip)),
    toArray(),
    tap(clips => {
      this.store.dispatch(new SetEditingText((clips[0] && clips[0].text) || ''))
      this.store.dispatch(new SetClipboard(new Clip(clips[0]), true))
      this.store.dispatch(new LoadHistory(clips))
    })
  )

  constructor(
    private db: DatabaseService,
    private store: Store<ClipboardState>
  ) {
    this.db.transaction
      .pipe(
        publish(multicastedTx$ =>
          merge(
            multicastedTx$.pipe(this.loadReadToggle),
            multicastedTx$.pipe(this.loadHistory)
          )
        )
      )
      .subscribe()
  }

  useSnippet(text = '') {
    combineLatest([this.isEditing, this.editingText])
      .pipe(
        take(1),
        filter(([isEditing, editingText]) => !isEditing && editingText !== text)
      )
      .subscribe(() => this.store.dispatch(new SetEditingText(text)))
    this.buffer
      .pipe(
        take(1),
        filter(buffer => buffer !== text)
      )
      .subscribe(() => this.store.dispatch(new SetClipboard(new Clip({text}))))
  }
  deleteSnippet(clip: Clip) {
    this.store.dispatch(new DeleteClip(clip.id, clip))
  }
  toggleFavouriteSnippet(clip: Clip) {
    this.store.dispatch(
      new UpdateClip(clip.id, {...clip, favourite: !clip.favourite})
    )
  }
}
