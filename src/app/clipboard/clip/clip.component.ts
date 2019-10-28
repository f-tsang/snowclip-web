import {Component, HostListener, Input, Output} from '@angular/core'
import {Subject} from 'rxjs'

import {Clip} from '../clipboard'

/**
 * TBD: Controls for clips.
 *  - star
 *  - add
 *  - clear
 */
@Component({
  selector: 'clip-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss']
})
export class ClipComponent {
  @Input()
  clip: Clip
  @Output()
  use = new Subject()

  @HostListener('click')
  onClick() {
    this.use.next(this.clip.text)
  }
}
