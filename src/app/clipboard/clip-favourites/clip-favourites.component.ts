import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core'
import {Store} from '@ngrx/store'
import {
  getPosition,
  getTitle,
  HideBackdrop,
  SetBackdropTitle,
  ShowBackdrop
} from 'ft-backdrop'
import {combineLatest} from 'rxjs'
import {filter, pluck, take, tap} from 'rxjs/operators'

import {getFavouriteClips} from '../clipboard'

@Component({
  selector: 'clip-favourites',
  template: `
    <div
      class="clip-list"
      *ngIf="(clips | async)?.length > 0; else emptyFavState"
      (mousedown)="$event.preventDefault()"
      (touchend)="$event.preventDefault()"
      (click)="close()"
    >
      <clip-clip *ngFor="let clip of clips | async" [clip]="clip"></clip-clip>
    </div>
    <ng-template #emptyFavState></ng-template>
  `,
  styleUrls: ['./clip-favourites.component.scss']
})
export class ClipFavouritesComponent implements OnInit, AfterViewInit {
  destroy: () => void
  clips = this.store.select(getFavouriteClips)

  constructor(private store: Store<any>) {}
  ngOnInit() {
    this.store.dispatch(new HideBackdrop())
  }
  ngAfterViewInit() {
    setTimeout(() => this.revertChangesOnClose())
  }

  close() {
    this.store.dispatch(new ShowBackdrop())
    setTimeout(() => this.destroy && this.destroy(), 300)
  }

  @HostListener('window:keydown', ['$event'])
  closeOnEscKey(event: KeyboardEvent) {
    const {isComposing, key} = event
    if (isComposing || key !== 'Escape') {
      return
    }
    event.preventDefault()
    this.close()
  }

  private revertChangesOnClose() {
    const onClose$ = this.store
      .select(getPosition)
      .pipe(filter(position => position === 'up'))
    const previousTitle = this.store.select(getTitle).pipe(
      take(1),
      tap(() => this.store.dispatch(new SetBackdropTitle('Show snippets')))
    )
    combineLatest([onClose$, previousTitle])
      .pipe(
        take(1),
        pluck(1),
        tap(title => this.store.dispatch(new SetBackdropTitle(title)))
      )
      .subscribe(() => this.close && this.close())
  }
}
