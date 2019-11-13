import {Component, OnDestroy, OnInit} from '@angular/core'
import {Store} from '@ngrx/store'
import {getPosition, SetBackdropTitle} from 'ft-backdrop'
import {filter} from 'rxjs/operators'

import {AppBar} from '../app-bar.service'

/**
 * TODO
 *  - Read values from a constants file
 *  - Get version details using the service worker
 */
@Component({
  selector: 'clip-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {
  private backdropPositionSub = this.store
    .select(getPosition)
    .pipe(filter(position => position === 'down'))
    .subscribe(() => this.appbar.toggleMenu())

  constructor(private appbar: AppBar, private store: Store<any>) {}
  ngOnInit() {
    this.store.dispatch(new SetBackdropTitle('About'))
  }
  ngOnDestroy() {
    this.backdropPositionSub.unsubscribe()
    this.store.dispatch(new SetBackdropTitle(null))
  }
}
