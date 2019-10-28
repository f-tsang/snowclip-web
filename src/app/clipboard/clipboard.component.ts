import {DOCUMENT} from '@angular/common'
import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  OnInit
} from '@angular/core'
import {Store} from '@ngrx/store'
import {combineLatest, merge, of} from 'rxjs'
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  pluck,
  switchMap,
  take,
  tap
} from 'rxjs/operators'

import {ClipboardService} from '../clipboard.service'
import {DatabaseService} from '../database.service'
import {
  Clip,
  ClipboardState,
  getCurrentClip,
  getHistory,
  getIsEditingClipboard,
  getReadPermissionStatus,
  SetClipboard,
  SetEditingClipboard
} from './clipboard'

const errorText = 'Requires permission to read the clipboard.'

/**
 * TBD: Consider not using the backdrop title and button.
 */
@Component({
  selector: 'clip-clipboard',
  templateUrl: './clipboard.component.html',
  styleUrls: ['./clipboard.component.scss']
})
export class ClipboardComponent implements OnInit, AfterViewInit {
  clips = this.store.select(getHistory)
  readPermission = this.store.select(getReadPermissionStatus)
  isEditing = this.store.select(getIsEditingClipboard)
  clip = this.store.select(getCurrentClip) // TODO - Use for the error state
  buffer = this.clip.pipe(
    switchMap(currentClip =>
      of(currentClip).pipe(
        pluck('text'),
        catchError(() => of(errorText))
      )
    ),
    distinctUntilChanged()
  )

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private clipboard: ClipboardService,
    private db: DatabaseService,
    private store: Store<ClipboardState>
  ) {}
  ngOnInit() {}
  ngAfterViewInit() {
    if (this.document.hasFocus()) {
      this.softRefreshClipboard()
    }
  }

  refreshClipboard() {
    this.clips
      .pipe(
        filter(Boolean),
        switchMap(() => combineLatest(this.clipboard.readText(), this.buffer)),
        take(1),
        filter(([clip, buffer]) => clip && clip.text !== buffer),
        map(([clip]) => clip)
      )
      .subscribe({
        next: (clip: Clip) => this.store.dispatch(new SetClipboard(clip)),
        error: () => {
          this.store.dispatch(new SetEditingClipboard(false))
          this.store.dispatch(new SetClipboard(null))
        }
      })
  }
  editClipboard() {
    this.buffer
      .pipe(
        take(1),
        filter(text => text !== errorText)
      )
      .subscribe(() => this.store.dispatch(new SetEditingClipboard(true)))
  }
  // TBD: Show toast 'Copied to clipboard'.
  writeToClipboard(text = '') {
    const setClipboard$ = this.buffer.pipe(
      take(1),
      filter(buffer => buffer !== text),
      tap(() => this.store.dispatch(new SetClipboard(new Clip({text}))))
    )
    const setIsEditing$ = this.isEditing.pipe(
      take(1),
      filter(Boolean),
      tap(() => this.store.dispatch(new SetEditingClipboard(false)))
    )
    merge(setClipboard$, setIsEditing$).subscribe()
  }

  @HostListener('window:focus')
  private softRefreshClipboard() {
    this.clipboard
      .getReadPermission()
      .pipe(filter(state => state === 'granted'))
      .subscribe(() => this.refreshClipboard())
  }
}
