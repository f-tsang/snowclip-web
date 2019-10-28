import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core'

import {Clip} from '../clipboard'

/**
 * TBD: Controls for clips.
 *  - star
 *  - add
 *  - delete
 */
@Component({
  selector: 'clip-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss']
})
export class ClipComponent {
  @Input() clip: Clip
  @Output() use = new EventEmitter()

  @HostListener('click')
  onClick() {
    this.use.emit(this.clip.text)
  }
}
