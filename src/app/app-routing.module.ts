import {NgModule} from '@angular/core'
import {RouterModule, Routes} from '@angular/router'

const routes: Routes = [
  {
    path: 'snowclip',
    loadChildren: () =>
      import('./clipboard/clipboard.module').then(
        ({ClipboardModule}) => ClipboardModule
      )
  },
  {
    path: 'snowclip/bin',
    loadChildren: () =>
      import('./bin/bin.module').then(({BinModule}) => BinModule)
  },
  {
    path: 'snowclip/about',
    loadChildren: () =>
      import('./about/about.module').then(({AboutModule}) => AboutModule)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'snowclip'
  },
  {path: '**', redirectTo: 'snowclip'}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
