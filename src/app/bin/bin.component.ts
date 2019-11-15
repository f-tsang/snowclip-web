import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core'
import {Store} from '@ngrx/store'
import {SetBackdropTitle} from 'ft-backdrop'
import {switchMap, toArray} from 'rxjs/operators'

import {AppBar} from '../app-bar.service'
import {Clip, PurgeBin, RestoreClip} from '../clipboard/clipboard'
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
export class BinComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('purgeButton', {read: TemplateRef, static: false})
  purgeButton: TemplateRef<ElementRef>
  bin: Clip[] = []

  constructor(
    private appbar: AppBar,
    private db: DatabaseService,
    private store: Store<any>
  ) {}
  ngOnInit() {
    this.store.dispatch(new SetBackdropTitle('Recycle Bin', true))
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
  ngAfterViewInit() {
    this.appbar.addControl(this.purgeButton)
  }
  ngOnDestroy() {
    this.appbar.clearControls()
    this.store.dispatch(new SetBackdropTitle(null))
  }

  restore(clip: Clip, index: number) {
    this.bin.splice(index, 1)
    this.store.dispatch(new RestoreClip(new Clip(clip)))
  }
  purgeAll() {
    this.bin = []
    this.store.dispatch(new PurgeBin())
  }
}
