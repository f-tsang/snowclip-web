import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core'

import {Clip} from '../clipboard'

/**
 * TODO - Controls for clips
 *  - long press favourite
 *  - swipe to delete
 *  - mouseover for both options
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
