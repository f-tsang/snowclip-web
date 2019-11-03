import {Component, Input} from '@angular/core'

/**
 * TODO - Try putting the logo closer (underneath) the menu button
 */
@Component({
  selector: 'clip-app-bar',
  templateUrl: './app-bar.component.html',
  styleUrls: ['./app-bar.component.scss']
})
export class AppBarComponent {
  @Input() title: string
}
