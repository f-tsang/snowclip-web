import {Action, createFeatureSelector, createSelector} from '@ngrx/store'

export interface ClipboardState {
  permissions: {read: boolean; write: boolean}
  editing: boolean
  clip: Clip
  history: Clip[]
}
export class Clip {
  type = 'text/plain'
  text = ''
  constructor(clip?: Partial<Clip>) {
    if (clip != null) {
      Object.entries(clip).forEach(([prop, value]) => (this[prop] = value))
    }
  }
}

export const enum ActionTypes {
  SetReadPermission = '[Clipboard] SET_READ_PERMISSION',
  SetWritePermission = '[Clipboard] SET_WRITE_PERMISSION',
  SetClipboard = '[Clipboard] SET_CLIPBOARD',
  SetEditingClipboard = '[Clipboard] SET_EDITING_CLIPBOARD',
  LoadHistory = '[Clipboard] LOAD_HISTORY',
  AddToHistory = '[Clipboard] ADD_TO_HISTORY',
  NotImplemented = '[Clipboard] NOT_IMPLEMENTED'
}
export class SetReadPermission implements Action {
  readonly type = ActionTypes.SetReadPermission
  constructor(public status: boolean) {}
}
export class SetWritePermission implements Action {
  readonly type = ActionTypes.SetWritePermission
  constructor(public status: boolean) {}
}
export class SetClipboard implements Action {
  readonly type = ActionTypes.SetClipboard
  constructor(public clip: Clip | null) {}
}
export class SetEditingClipboard implements Action {
  readonly type = ActionTypes.SetEditingClipboard
  constructor(public editing: boolean) {}
}
export class NotImplemented implements Action {
  readonly type = ActionTypes.NotImplemented
  constructor(public message?: string) {}
}
export class LoadHistory implements Action {
  readonly type = ActionTypes.LoadHistory
  constructor(public history: Clip[]) {}
}
export class AddToHistory implements Action {
  readonly type = ActionTypes.AddToHistory
  constructor(public clip: Clip) {}
}

export const featureName = 'clipboard'
export const selectFeature = createFeatureSelector<ClipboardState>(featureName)

export const getCurrentClip = createSelector(
  selectFeature,
  ({clip}) => clip
)
export const getReadPermissionStatus = createSelector(
  selectFeature,
  ({permissions}) => permissions.read
)
export const getWritePermissionStatus = createSelector(
  selectFeature,
  ({permissions}) => permissions.write
)
export const getIsEditingClipboard = createSelector(
  selectFeature,
  ({editing}) => editing
)
export const getHistory = createSelector(
  selectFeature,
  ({history}) => history
)
