import {NgModule} from '@angular/core'
import {RouterModule, Routes} from '@angular/router'

const routes: Routes = [
  {
    path: 'clipboard',
    loadChildren: () =>
      import('./clipboard/clipboard.module').then(
        ({ClipboardModule}) => ClipboardModule
      )
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'clipboard'
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
