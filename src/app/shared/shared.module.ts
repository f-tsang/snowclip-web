import {CommonModule} from '@angular/common'
import {ModuleWithProviders, NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'

import {ScratchpadComponent} from './scratchpad/scratchpad.component'
import {indexedDbProvider, windowProvider} from './shared.providers'

@NgModule({
  declarations: [ScratchpadComponent],
  exports: [ScratchpadComponent],
  imports: [CommonModule, FormsModule]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [windowProvider, indexedDbProvider]
    }
  }
}
