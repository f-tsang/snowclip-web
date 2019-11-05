import {DOCUMENT} from '@angular/common'
import {AfterViewInit, Component, HostListener, Inject} from '@angular/core'
import {Store} from '@ngrx/store'
import {combineLatest} from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  pluck,
  share,
  take
} from 'rxjs/operators'
import {ClipboardService} from 'src/app/clipboard.service'

import {
  Clip,
  getAllowReadClipboard,
  getCurrentClip,
  getHistory,
  getIsEditingClipboard,
  getIsLoading,
  getReadPermissionAvailibility,
  getReadPermissionStatus,
  InsertClip,
  SetAllowClipboardRead,
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
  readAvailable = this.store.select(getReadPermissionAvailibility)
  readPermission = this.store.select(getReadPermissionStatus)
  readAllowed = this.store.select(getAllowReadClipboard)
  clipboardReadable = combineLatest([
    this.readAllowed,
    this.readPermission
  ]).pipe(map(([allowed, permissible]) => allowed && permissible))

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

  toggleClipboard() {
    this.readAllowed.pipe(take(1)).subscribe(allowed => {
      if (allowed) {
        this.store.dispatch(new SetAllowClipboardRead(false))
      } else {
        this.store.dispatch(new SetAllowClipboardRead(true))
        this.refreshClipboard()
      }
    })
  }
  refreshClipboard() {
    const readText$ = this.clipboard.readText().pipe(share())
    combineLatest([readText$, this.isEditing])
      .pipe(
        take(1),
        filter(([_, editing]) => !editing),
        pluck(0, 'text')
      )
      .subscribe(text => this.store.dispatch(new SetEditingText(text)))
    combineLatest([readText$, this.buffer])
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
    combineLatest([
      this.readAllowed,
      this.isLoading,
      this.isEditing,
      this.clipboard.getReadPermission()
    ])
      .pipe(
        take(1),
        filter(
          ([readable, loading, editing, state]) =>
            readable && !loading && !editing && state === 'granted'
        )
      )
      .subscribe(() => this.refreshClipboard())
  }
}
