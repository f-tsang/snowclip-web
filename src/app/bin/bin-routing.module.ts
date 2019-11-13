import {NgModule} from '@angular/core'
import {RouterModule, Routes} from '@angular/router'

import {BinComponent} from './bin.component'

const routes: Routes = [{path: '', component: BinComponent}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BinRoutingModule {}
