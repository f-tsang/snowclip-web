import {Provider} from '@angular/core'

export class IndexedDb extends IDBFactory {}
export const indexedDbProvider: Provider = {
  provide: IndexedDb,
  useFactory() {
    return indexedDB
  }
}

export const windowProvider: Provider = {
  provide: Window,
  useFactory() {
    return window || {}
  }
}
