import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'

import {BinRoutingModule} from './bin-routing.module'
import {BinComponent} from './bin.component'

@NgModule({
  declarations: [BinComponent],
  imports: [BinRoutingModule, CommonModule]
})
export class BinModule {}
