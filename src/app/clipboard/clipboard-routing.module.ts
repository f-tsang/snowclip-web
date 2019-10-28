import {NgModule} from '@angular/core'
import {RouterModule, Routes} from '@angular/router'

import {ClipboardComponent} from './clipboard.component'

const routes: Routes = [{path: '', component: ClipboardComponent}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClipboardRoutingModule {}
