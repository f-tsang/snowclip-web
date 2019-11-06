import {Injectable} from '@angular/core'
import {Store} from '@ngrx/store'
import {combineLatest} from 'rxjs'
import {distinctUntilChanged, filter, map, take} from 'rxjs/operators'

import {
  Clip,
  ClipboardState,
  DeleteClip,
  getCurrentClip,
  getEditingText,
  getIsEditingClipboard,
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

  constructor(private store: Store<ClipboardState>) {}

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
    this.store.dispatch(new DeleteClip(clip.id))
  }
  toggleFavouriteSnippet(clip: Clip) {
    this.store.dispatch(
      new UpdateClip(clip.id, {...clip, favourite: !clip.favourite})
    )
  }
}
