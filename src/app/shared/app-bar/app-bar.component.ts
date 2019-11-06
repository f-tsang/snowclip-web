import {
  AfterViewInit,
  Component,
  Input,
  ViewChild,
  ViewContainerRef
} from '@angular/core'
import {map} from 'rxjs/operators'
import {AppBar} from 'src/app/app-bar.service'

/**
 * TODO - Show menu
 */
@Component({
  selector: 'clip-app-bar',
  template: `
    <header class="icon-menu">
      <button
        class="icon-button"
        [title]="(icon$ | async) ? 'Main menu' : 'Close'"
        (click)="toggleMenu()"
      >
        <ng-container
          *ngIf="icon$ | async; then menuIcon; else closeIcon"
        ></ng-container>
        <ng-template #menuIcon>
          <i class="material-icons">menu</i>
        </ng-template>
        <ng-template #closeIcon>
          <i class="material-icons">close</i>
        </ng-template>
      </button>
      <img
        class="app-icon"
        src="../../../assets/icons/shrike-alternate.svg"
        alt="Shrike logo"
      />
    </header>
    <span class="title">{{ title$ | async }}</span>
    <div class="controls">
      <ng-container #controls></ng-container>
    </div>
  `,
  styleUrls: ['./app-bar.component.scss']
})
export class AppBarComponent implements AfterViewInit {
  @ViewChild('controls', {read: ViewContainerRef, static: false})
  controlsViewContainerRef: ViewContainerRef
  title$ = this.appbar.title
  icon$ = this.appbar.menuTarget$.pipe(map(fn => fn == null))

  constructor(private appbar: AppBar) {}
  ngAfterViewInit() {
    this.appbar.bindView(this.controlsViewContainerRef)
  }

  toggleMenu() {
    this.appbar.toggleMenu()
  }

  @Input()
  set title(title: string) {
    this.appbar.setTitle(title)
  }
}
