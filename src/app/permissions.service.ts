import {Injectable} from '@angular/core'
import {Observable, of, throwError} from 'rxjs'
import {catchError, mergeMap} from 'rxjs/operators'

export class NotSupportedError extends Error {
  constructor(message = 'Permissions API not supported.') {
    super(message)
  }
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  // @ts-ignore
  private permissions: Observable<Permissions>

  constructor(private window: Window) {
    if ('navigator' in this.window && 'permissions' in this.window.navigator) {
      // @ts-ignore
      this.permissions = of(this.window.navigator.permissions)
    } else {
      this.permissions = throwError(new NotSupportedError())
    }
  }

  // NOTE: Descripter includes clipboard instead of clipboard-read.
  query(
    // @ts-ignore
    queryOptions: PermissionDescriptor | any,
    continueUnsupported?: boolean
  ) {
    const continueIfUnsupported = catchError(err => {
      if (!(continueUnsupported && err instanceof NotSupportedError)) {
        throw err
      }
      return of({
        state: 'granted',
        onchange: null
      })
    })
    return this.permissions.pipe(
      mergeMap(permissions => permissions.query(queryOptions)),
      continueIfUnsupported
    )
  }
}
