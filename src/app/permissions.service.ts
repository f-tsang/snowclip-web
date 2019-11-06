import {Injectable} from '@angular/core'
import {Observable, of, throwError} from 'rxjs'
import {mergeMap, tap} from 'rxjs/operators'

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

  query(queryOptions: PermissionDescriptor | any) {
    return this.permissions.pipe(
      checkSupport('query'),
      mergeMap(permissions => permissions.query(queryOptions))
    )
  }
  /**
   * NOTE: Do not use. Not supported by default (even on Chrome).
   */
  revoke(queryOptions: PermissionDescriptor | any) {
    return this.permissions.pipe(
      checkSupport('revoke'),
      // @ts-ignore
      mergeMap(permissions => permissions.revoke(queryOptions))
    )
  }
}

function checkSupport(featureName: string) {
  return tap((permissions: Permissions) => {
    if (!(featureName in permissions)) {
      throw new NotSupportedError()
    }
  })
}
