import {Component, OnDestroy, OnInit} from '@angular/core'
import {Store} from '@ngrx/store'
import {SetBackdropTitle} from 'ft-backdrop'

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
  constructor(private store: Store<any>) {}
  ngOnInit() {
    this.store.dispatch(new SetBackdropTitle('About', true))
  }
  ngOnDestroy() {
    this.store.dispatch(new SetBackdropTitle(null))
  }
}
