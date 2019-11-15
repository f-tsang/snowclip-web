import {Component, Input} from '@angular/core'

import {ClipService} from '../clip.service'
import {Clip} from '../clipboard'

/**
 * TODO - Hints and animations for swipe controls
 */
@Component({
  selector: 'clip-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss']
})
export class ClipComponent {
  @Input() clip: Clip

  constructor(private clipService: ClipService) {}

  use(text = '') {
    this.clipService.useSnippet(text)
  }
  delete(input?: HammerInput) {
    if (input && input.pointerType === 'mouse') {
      return
    }
    this.clipService.deleteSnippet(this.clip)
  }
  favourite(input?: HammerInput) {
    if (input && input.pointerType === 'mouse') {
      return
    }
    this.clipService.toggleFavouriteSnippet(this.clip)
  }
}
