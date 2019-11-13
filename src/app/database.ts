import {
  fromEvent,
  merge,
  Observable,
  pipe,
  Subject,
  throwError,
  UnaryFunction
} from 'rxjs'
import {map, mergeMap, pluck, take, takeUntil, tap} from 'rxjs/operators'

export interface IDBEvent extends Event {
  target: IDBEventTarget
}
export interface IDBEventTarget extends EventTarget {
  result: IDBCursorWithValue | any
}

export enum DatabaseInfo {
  name = 'SnowclipDB',
  version = 1
}

export const TABLE_NAMES = {
  appdata: 'appdata',
  bin: 'bin',
  history: 'history' // NOTE: Index populates on add, so fav's can't be indexed.
}
export const TABLE_PRIMAY_KEYS = {
  [TABLE_NAMES.appdata]: {keyPath: 'key'},
  [TABLE_NAMES.bin]: {keyPath: 'id'},
  [TABLE_NAMES.history]: {keyPath: 'id', autoIncrement: true}
}
export const TABLE_INDEXES = {
  [TABLE_NAMES.appdata]: [['key', 'key', {unique: true}]],
  [TABLE_NAMES.bin]: [['id', 'id', {unique: true}]],
  [TABLE_NAMES.history]: [['id', 'id', {unique: true}]]
}

export class ExistingConnectionError extends Error {
  constructor(
    message = 'Existing connection found. Unable to upgrade the database.'
  ) {
    super(message)
  }
}
export class FailedConnectionError extends Error {
  constructor(message = 'Failed to connect to the database.') {
    super(message)
  }
}
export class DbCreationFailedError extends Error {
  constructor(message = 'Error creating database.') {
    super(message)
  }
}

export function fromIdbRequest<T = unknown>(request: IDBRequest<IDBValidKey>) {
  const success$: Observable<T> = fromEvent(request, 'success').pipe(
    pluck('target', 'result')
  )
  const error$: Observable<never> = fromEvent(request, 'error').pipe(
    pluck('target', 'error'),
    mergeMap((error: Error) => throwError(error))
  )
  return merge(success$, error$).pipe(take(1))
}
/**
 * Retrieves all values within the range of the provided cursor request.
 * @param request A cursor request usually retreived from ObjectStore.openCursor()
 * @param cursorPipeline For manipulating the cursor and its retrieved value. Return a non-cursor value to prevent the default action.
 */
export function fromIdbCursor<T = unknown>(
  request: IDBRequest<IDBCursorWithValue>,
  cursorPipeline: UnaryFunction<
    Observable<IDBCursorWithValue>,
    Observable<unknown>
  > = pipe()
): Observable<T> {
  const complete$ = new Subject()
  const success$ = fromEvent(request, 'success').pipe(
    pluck<Event, IDBCursorWithValue>('target', 'result'),
    tap(cursor => cursor == null && complete$.next()),
    cursorPipeline,
    map(cursor => {
      if (!(cursor instanceof IDBCursorWithValue)) {
        return cursor
      }
      cursor.continue()
      return cursor.value
    })
  )
  const error$ = fromEvent(request, 'error').pipe(
    pluck('target', 'error'),
    mergeMap((error: Error) => throwError(error))
  )
  return merge(success$, error$).pipe(takeUntil(complete$))
}
