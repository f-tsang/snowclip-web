import {Injectable} from '@angular/core'
import {BehaviorSubject} from 'rxjs'
import {filter, map, take} from 'rxjs/operators'

import {
  DatabaseInfo,
  DbCreationFailedError,
  ExistingConnectionError,
  FailedConnectionError,
  TABLE_INDEXES,
  TABLE_NAMES,
  TABLE_PRIMAY_KEYS
} from './database'
import {IndexedDb} from './shared/shared.providers'

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private idb$ = new BehaviorSubject<IDBDatabase>(null)

  constructor(private indexedDb: IndexedDb) {
    if (this.indexedDb != null) {
      this.openDatabaseConnection(this.indexedDb)
    } else {
      this.idb$.error(new Error('IndexedDB API not supported.'))
    }
  }

  get transaction() {
    return this.idb$.pipe(
      filter<IDBDatabase>(Boolean),
      take(1),
      map(database =>
        database.transaction(Array.from(database.objectStoreNames), 'readwrite')
      )
    )
  }

  private openDatabaseConnection(database: IndexedDb) {
    const request = database.open(DatabaseInfo.name, DatabaseInfo.version)
    request.onsuccess = () => this.idb$.next(request.result)
    request.onerror = () => this.idb$.error(new FailedConnectionError())
    request.onblocked = () => this.idb$.error(new ExistingConnectionError())
    request.onupgradeneeded = this.onUpgradeCallback
  }
  private onUpgradeCallback(event: IDBVersionChangeEvent) {
    const {result: db} = event.target as IDBRequest<IDBDatabase>
    db.onerror = () => this.idb$.error(new DbCreationFailedError())
    // ---
    console.log(`Upgrading to version ${db.version}.`)
    // ---
    for (const tableName in TABLE_NAMES) {
      if (typeof tableName === 'string') {
        const store = db.createObjectStore(
          tableName,
          TABLE_PRIMAY_KEYS[tableName]
        )
        const storeIndexes = TABLE_INDEXES[tableName]
        if (Array.isArray(storeIndexes)) {
          storeIndexes.forEach(index => store.createIndex.apply(store, index))
        }
      }
    }
  }
}
