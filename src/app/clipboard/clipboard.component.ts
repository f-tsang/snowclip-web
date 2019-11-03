import {Component} from '@angular/core'

@Component({
  selector: 'clip-clipboard',
  /* TODO - Backdrop content
    Favourites --> | Send to device | Profile Picture
    ---
    .
    .
    .
  */
  template: `
    <clip-app-bar [title]="title"></clip-app-bar>
    <ft-backdrop>
      <main>
        <clip-editor></clip-editor>
        <clip-list></clip-list>
      </main>
    </ft-backdrop>
  `,
  styleUrls: ['./clipboard.component.scss']
})
export class ClipboardComponent {
  title = 'Snowclip'
}
