import {DOCUMENT} from '@angular/common'
import {AfterViewInit, Component, HostListener, Inject} from '@angular/core'
import {Store} from '@ngrx/store'
import {combineLatest} from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  pluck,
  publishLast,
  refCount,
  take
} from 'rxjs/operators'
import {ClipboardService} from 'src/app/clipboard.service'

import {
  Clip,
  getCurrentClip,
  getHistory,
  getIsEditingClipboard,
  getIsLoading,
  getReadPermissionStatus,
  InsertClip,
  SetClipboard,
  SetEditingText
} from '../clipboard'

@Component({
  selector: 'clip-list',
  templateUrl: './clip-list.component.html',
  styleUrls: ['./clip-list.component.scss']
})
export class ClipListComponent implements AfterViewInit {
  clips = this.store.select(getHistory)
  isEditing = this.store.select(getIsEditingClipboard)
  buffer = this.store.select(getCurrentClip).pipe(
    map(clip => (clip && clip.text) || ''),
    distinctUntilChanged()
  )
  isLoading = this.store.select(getIsLoading)
  readPermission = this.store.select(getReadPermissionStatus)

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private clipboard: ClipboardService,
    private store: Store<any>
  ) {}

  ngAfterViewInit() {
    if (this.document.hasFocus()) {
      this.softRefreshClipboard()
    }
  }

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
          this.store.dispatch(new InsertClip(clip))
        },
        error: () => this.store.dispatch(new SetClipboard(null))
      })
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
