import {Component} from '@angular/core'

@Component({
  selector: 'clip-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'snowclip'
}
