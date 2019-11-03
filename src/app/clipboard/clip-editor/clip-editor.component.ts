import {Component} from '@angular/core'
import {Store} from '@ngrx/store'
import {distinctUntilChanged, filter, map, take} from 'rxjs/operators'

import {
  Clip,
  ClipboardState,
  getCurrentClip,
  getEditingText,
  InsertClip,
  SetClipboard,
  SetEditingClipboard,
  SetEditingText
} from '../clipboard'

@Component({
  selector: 'clip-editor',
  template: `
    <clip-scratchpad
      [value]="editingText | async"
      (valueChange)="updateEditingValue($event)"
      (editingChange)="updateEditingState($event)"
      (done)="saveSnippet($event)"
    ></clip-scratchpad>
  `
})
export class ClipEditorComponent {
  editingText = this.store.select(getEditingText)
  clipboardText = this.store.select(getCurrentClip).pipe(
    map(clip => (clip && clip.text) || ''),
    distinctUntilChanged()
  )

  constructor(private store: Store<ClipboardState>) {}

  // TODO - Show toast 'Copied to clipboard'.
  saveSnippet(text = '') {
    const clip = new Clip({text})
    if (text !== '') {
      this.store.dispatch(new InsertClip(clip))
    }
    this.clipboardText
      .pipe(
        take(1),
        filter(buffer => buffer !== text)
      )
      .subscribe(() => this.store.dispatch(new SetClipboard(clip)))
  }

  updateEditingValue(text = '') {
    this.store.dispatch(new SetEditingText(text))
  }
  updateEditingState(isEditing = false) {
    this.store.dispatch(new SetEditingClipboard(isEditing))
  }
}
