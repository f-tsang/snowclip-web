import {Component, OnDestroy, OnInit} from '@angular/core'
import {Store} from '@ngrx/store'
import {getPosition, SetBackdropTitle} from 'ft-backdrop'
import {Observable} from 'rxjs'
import {filter, switchMap, toArray} from 'rxjs/operators'

import {AppBar} from '../app-bar.service'
import {Clip} from '../clipboard/clipboard'
import {fromIdbCursor, TABLE_NAMES} from '../database'
import {DatabaseService} from '../database.service'

@Component({
  selector: 'clip-bin',
  templateUrl: './bin.component.html',
  styleUrls: ['./bin.component.scss']
})
export class BinComponent implements OnInit, OnDestroy {
  bin: Observable<Clip[]> = this.db.transaction.pipe(
    switchMap(tx => {
      const binStore = tx.objectStore(TABLE_NAMES.bin)
      const cursorRequest = binStore.openCursor(null, 'prev')
      return fromIdbCursor<Clip>(cursorRequest)
    }),
    toArray()
  )

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
  }
  ngOnDestroy() {
    this.backdropPositionSub.unsubscribe()
    this.store.dispatch(new SetBackdropTitle(null))
  }

  noop() {
    console.log('Not implemented.')
  }
}
