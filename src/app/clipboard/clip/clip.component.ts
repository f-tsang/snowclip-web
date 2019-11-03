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
 *  - swipe left to favourite
 *  - swipe right to delete
 */
@Component({
  selector: 'clip-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss']
})
export class ClipComponent {
  @Input() clip: Clip
  @Output() use = new EventEmitter<string>()
  @Output() delete = new EventEmitter<void>()
  @Output() favourite = new EventEmitter<void>()
  mouseover = false

  @HostListener('mouseenter')
  onMouseEnter() {
    this.mouseover = true
  }
  @HostListener('mouseleave')
  onMouseLeave() {
    this.mouseover = false
  }
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (!this.mouseover) {
      event.preventDefault()
      this.mouseover = true
    }
  }
}
