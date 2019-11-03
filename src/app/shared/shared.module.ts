import {CommonModule} from '@angular/common'
import {ModuleWithProviders, NgModule} from '@angular/core'
import {FormsModule} from '@angular/forms'

import {AppBarComponent} from './app-bar/app-bar.component'
import {ScratchpadComponent} from './scratchpad/scratchpad.component'
import {indexedDbProvider, windowProvider} from './shared.providers'

@NgModule({
  declarations: [AppBarComponent, ScratchpadComponent],
  exports: [AppBarComponent, ScratchpadComponent],
  imports: [CommonModule, FormsModule]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [windowProvider, indexedDbProvider]
    }
  }
}
