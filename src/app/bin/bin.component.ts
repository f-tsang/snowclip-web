import {Component, OnDestroy, OnInit} from '@angular/core'
import {Store} from '@ngrx/store'
import {getPosition, SetBackdropTitle} from 'ft-backdrop'
import {filter, switchMap, toArray} from 'rxjs/operators'

import {AppBar} from '../app-bar.service'
import {Clip, RestoreClip} from '../clipboard/clipboard'
import {fromIdbCursor, TABLE_NAMES} from '../database'
import {DatabaseService} from '../database.service'

/**
 * TODO - Manage state in NgRx Store
 */
@Component({
  selector: 'clip-bin',
  templateUrl: './bin.component.html',
  styleUrls: ['./bin.component.scss']
})
export class BinComponent implements OnInit, OnDestroy {
  bin: Clip[] = []

  private backdropPositionSub = this.store
    .select(getPosition)
    .pipe(filter(position => position === 'down'))
    .subscribe(() => this.appbar.toggleMenu())

  constructor(
    private appbar: AppBar,
    private db: DatabaseService,
    private store: Store<any>
  ) {}
  ngOnInit() {
    this.store.dispatch(new SetBackdropTitle('Recycle Bin'))
    this.db.transaction
      .pipe(
        switchMap(tx => {
          const binStore = tx.objectStore(TABLE_NAMES.bin)
          const cursorRequest = binStore.openCursor(null, 'prev')
          return fromIdbCursor<Clip>(cursorRequest)
        }),
        toArray()
      )
      .subscribe(bin => (this.bin = bin))
  }
  ngOnDestroy() {
    this.backdropPositionSub.unsubscribe()
    this.store.dispatch(new SetBackdropTitle(null))
  }

  restore(clip: Clip, index: number) {
    this.bin.splice(index, 1)
    this.store.dispatch(new RestoreClip(new Clip(clip)))
  }
}
