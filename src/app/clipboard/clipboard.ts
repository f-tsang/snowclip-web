import {Action, createFeatureSelector, createSelector} from '@ngrx/store'

// TODO - Save the allowReadClipboard state
export interface ClipboardState {
  permissions: {read: boolean; write: boolean}
  editing: boolean // Manages editing state for clip-scratchpad.
  clip: Clip // Last known clipboard state.
  history: Clip[]
  editingText: string // Manages content state for clip-scratchpad.
  isLoading: boolean // Ensures clipboard is not read before history is loaded.
  allowReadClipboard: boolean // Pseudo revoke permission.
}
export class Clip {
  id = Date.now() // TBD: Async action instead of giving a temporary ID?
  type = 'text/plain'
  text = ''
  favourite: boolean
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
  SetEditingText = '[Clipboard] SET_EDITING_TEXT',
  LoadHistory = '[Clipboard] LOAD_HISTORY',
  InsertClip = '[Clipboard] INSERT_CLIP',
  UpdateClip = '[Clipboard] UPDATE_CLIP',
  DeleteClip = '[Clipboard] DELETE_CLIP',
  SetAllowClipboardRead = '[Clipboard] SET_ALLOW_CLIPBOARD_READ',
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
  constructor(public clip: Clip | null, public stopEffects?: boolean) {}
}
export class SetEditingClipboard implements Action {
  readonly type = ActionTypes.SetEditingClipboard
  constructor(public editing: boolean) {}
}
export class SetEditingText implements Action {
  readonly type = ActionTypes.SetEditingText
  constructor(public text: string) {}
}
export class LoadHistory implements Action {
  readonly type = ActionTypes.LoadHistory
  constructor(public history: Clip[]) {}
}
export class InsertClip implements Action {
  readonly type = ActionTypes.InsertClip
  constructor(public clip: Clip) {}
}
export class UpdateClip implements Action {
  readonly type = ActionTypes.UpdateClip
  constructor(
    public id: number,
    public clip: Clip,
    public stopEffects?: boolean
  ) {}
}
export class DeleteClip implements Action {
  readonly type = ActionTypes.DeleteClip
  constructor(public id: number) {}
}
export class SetAllowClipboardRead implements Action {
  readonly type = ActionTypes.SetAllowClipboardRead
  constructor(public allowed: boolean) {}
}
export class NotImplemented implements Action {
  readonly type = ActionTypes.NotImplemented
  constructor(public message?: string) {}
}

export const selectClipboard = 'clipboard'
export const selectClipboardState = createFeatureSelector<ClipboardState>(
  selectClipboard
)

export const getCurrentClip = createSelector(
  selectClipboardState,
  ({clip}) => clip
)
export const getReadPermissionStatus = createSelector(
  selectClipboardState,
  ({permissions}) => permissions.read
)
export const getWritePermissionStatus = createSelector(
  selectClipboardState,
  ({permissions}) => permissions.write
)
export const getIsEditingClipboard = createSelector(
  selectClipboardState,
  ({editing}) => editing
)
export const getHistory = createSelector(
  selectClipboardState,
  ({history}) => history
)
export const getEditingText = createSelector(
  selectClipboardState,
  ({editingText}) => editingText
)
export const getIsLoading = createSelector(
  selectClipboardState,
  ({isLoading}) => isLoading
)
export const getAllowReadClipboard = createSelector(
  selectClipboardState,
  ({allowReadClipboard}) => allowReadClipboard
)
