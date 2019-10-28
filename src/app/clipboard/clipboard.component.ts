import {DOCUMENT} from '@angular/common'
import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core'
import {Store} from '@ngrx/store'
import {combineLatest, of} from 'rxjs'
import {
  catchError,
  distinctUntilChanged,
  filter,
  pluck,
  publishLast,
  refCount,
  switchMap,
  take
} from 'rxjs/operators'

import {ClipboardService} from '../clipboard.service'
import {
  AddToHistory,
  Clip,
  ClipboardState,
  getCurrentClip,
  getEditingText,
  getHistory,
  getIsEditingClipboard,
  getIsLoading,
  getReadPermissionStatus,
  SetClipboard,
  SetEditingClipboard,
  SetEditingText
} from './clipboard'

/**
 * TBD: Handle saving duplicates?
 */
@Component({
  selector: 'clip-clipboard',
  templateUrl: './clipboard.component.html',
  styleUrls: ['./clipboard.component.scss']
})
export class ClipboardComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = this.store.select(getIsLoading)
  clips = this.store.select(getHistory)
  readPermission = this.store.select(getReadPermissionStatus)
  isEditing = this.store.select(getIsEditingClipboard)
  editingText = this.store.select(getEditingText)
  clip = this.store.select(getCurrentClip) // TODO - Use for the error state
  buffer = this.clip.pipe(
    switchMap(currentClip =>
      of(currentClip).pipe(
        pluck('text'),
        catchError(() => of(''))
      )
    ),
    distinctUntilChanged()
  )

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private clipboard: ClipboardService,
    private store: Store<ClipboardState>
  ) {}
  ngOnInit() {}
  ngAfterViewInit() {
    if (this.document.hasFocus()) {
      this.softRefreshClipboard()
    }
  }
  ngOnDestroy() {}

  refreshClipboard() {
    const readText$ = this.clipboard.readText().pipe(
      publishLast(),
      refCount()
    )
    combineLatest(readText$, this.isEditing)
      .pipe(
        take(1),
        filter(([_, editing]) => !editing),
        pluck(0, 'text')
      )
      .subscribe(text => this.store.dispatch(new SetEditingText(text)))
    combineLatest(readText$, this.buffer)
      .pipe(
        take(1),
        filter(([clip, buffer]) => clip && clip.text !== buffer),
        pluck(0)
      )
      .subscribe({
        next: (clip: Clip) => {
          this.store.dispatch(new SetClipboard(clip, true))
          this.store.dispatch(new AddToHistory(clip))
        },
        error: () => this.store.dispatch(new SetClipboard(null))
      })
  }

  useSnippet(text = '') {
    combineLatest(this.isEditing, this.editingText)
      .pipe(
        take(1),
        filter(([isEditing, editingText]) => !isEditing && editingText !== text)
      )
      .subscribe({
        next: () => this.store.dispatch(new SetEditingText(text))
      })
    this.buffer
      .pipe(
        take(1),
        filter(buffer => buffer !== text)
      )
      .subscribe(() => this.store.dispatch(new SetClipboard(new Clip({text}))))
  }
  // TODO - Show toast 'Copied to clipboard'.
  saveSnippet(text = '') {
    const clip = new Clip({text})
    if (text !== '') {
      this.store.dispatch(new AddToHistory(clip))
    }
    this.buffer
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

  @HostListener('window:focus')
  private softRefreshClipboard() {
    combineLatest(
      this.isLoading,
      this.isEditing,
      this.clipboard.getReadPermission()
    )
      .pipe(
        take(1),
        filter(
          ([loading, editing, state]) =>
            !loading && !editing && state === 'granted'
        )
      )
      .subscribe(() => this.refreshClipboard())
  }
}
