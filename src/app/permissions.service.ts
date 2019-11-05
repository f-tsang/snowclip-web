import {Injectable} from '@angular/core'
import {Observable, of, throwError} from 'rxjs'
import {catchError, mergeMap} from 'rxjs/operators'

export class NotSupportedError extends Error {
  constructor(message = 'Permissions API not supported.') {
    super(message)
  }
}

/**
 * TODO - Move into CoreModule
 * NOTE: PermissionDescriptor incorrectly lists clipboard instead of clipboard-read.
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private permissions: Observable<Permissions>

  constructor(private window: Window) {
    if ('navigator' in this.window && 'permissions' in this.window.navigator) {
      this.permissions = of(this.window.navigator.permissions)
    } else {
      this.permissions = throwError(new NotSupportedError())
    }
  }

  query(
    queryOptions: PermissionDescriptor | any,
    continueUnsupported?: boolean
  ) {
    return this.permissions.pipe(
      mergeMap(permissions => permissions.query(queryOptions)),
      continueIfUnsupported(continueUnsupported)
    )
  }
  /**
   * NOTE: Do not use. Not supported by default (even on Chrome).
   */
  revoke(
    queryOptions: PermissionDescriptor | any,
    continueUnsupported?: boolean
  ) {
    return this.permissions.pipe(
      mergeMap(permissions => {
        if (!('revoke' in permissions)) {
          throw new NotSupportedError()
        }
        // @ts-ignore
        return permissions.revoke(queryOptions)
      }),
      continueIfUnsupported(continueUnsupported)
    )
  }
}

function continueIfUnsupported(continueUnsupported: boolean, state = 'prompt') {
  return catchError(err => {
    if (!(continueUnsupported && err instanceof NotSupportedError)) {
      throw err
    }
    return of({state, onchange: null})
  })
}
