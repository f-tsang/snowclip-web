import {Component, Input} from '@angular/core'

import {ClipService} from '../clip.service'
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

  constructor(private clipService: ClipService) {}

  use(text = '') {
    this.clipService.useSnippet(text)
  }
  delete() {
    this.clipService.deleteSnippet(this.clip)
  }
  favourite() {
    this.clipService.toggleFavouriteSnippet(this.clip)
  }
}
