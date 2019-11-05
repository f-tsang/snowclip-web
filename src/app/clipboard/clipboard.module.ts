import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {EffectsModule} from '@ngrx/effects'
import {Action, StoreModule} from '@ngrx/store'
import {BackdropModule} from 'ft-backdrop'

import {SharedModule} from '../shared/shared.module'
import {ClipEditorComponent} from './clip-editor/clip-editor.component'
import {ClipListComponent} from './clip-list/clip-list.component'
import {ClipComponent} from './clip/clip.component'
import {
  ActionTypes,
  ClipboardState,
  DeleteClip,
  InsertClip,
  LoadHistory,
  selectClipboard,
  SetAllowClipboardRead,
  SetClipboard,
  SetEditingClipboard,
  SetEditingText,
  SetReadAvailibility,
  SetReadPermission,
  SetWriteAvailibility,
  SetWritePermission,
  UpdateClip
} from './clipboard'
import {ClipboardRoutingModule} from './clipboard-routing.module'
import {ClipboardComponent} from './clipboard.component'
import {ClipboardEffects} from './clipboard.effects';
import { ClipListComponent } from './clip-list/clip-list.component';
import { ClipEditorComponent } from './clip-editor/clip-editor.component'

@NgModule({
  declarations: [
    ClipboardComponent,
    ClipComponent,
    ClipListComponent,
    ClipEditorComponent
  ],
  imports: [
    ClipboardRoutingModule,
    CommonModule,
    SharedModule,
    StoreModule.forFeature(selectClipboard, reducer),
    EffectsModule.forFeature([ClipboardEffects]),
    BackdropModule
  ]
})
export class ClipboardModule {}

const initialState: ClipboardState = {
  readPermission: {available: true, granted: false},
  writePermission: {available: true, granted: false},
  clip: null,
  editing: false,
  editingText: '',
  history: [],
  isLoading: true,
  allowReadClipboard: true
}
export function reducer(state = initialState, action: Action): ClipboardState {
  switch (action.type) {
    case ActionTypes.SetReadAvailibility: {
      const {available} = action as SetReadAvailibility
      return {...state, readPermission: {...state.readPermission, available}}
    }
    case ActionTypes.SetWriteAvailibility: {
      const {available} = action as SetWriteAvailibility
      return {...state, writePermission: {...state.writePermission, available}}
    }
    case ActionTypes.SetReadPermission: {
      const {status: granted} = action as SetReadPermission
      return {...state, readPermission: {...state.readPermission, granted}}
    }
    case ActionTypes.SetWritePermission: {
      const {status: granted} = action as SetWritePermission
      return {...state, writePermission: {...state.writePermission, granted}}
    }
    case ActionTypes.SetClipboard: {
      const {clip} = action as SetClipboard
      return {...state, clip}
    }
    case ActionTypes.SetEditingClipboard: {
      const {editing} = action as SetEditingClipboard
      return {...state, editing}
    }
    case ActionTypes.SetEditingText: {
      const {text} = action as SetEditingText
      return {...state, editingText: text}
    }
    case ActionTypes.LoadHistory: {
      const {history} = action as LoadHistory
      return {...state, history, isLoading: false}
    }
    case ActionTypes.InsertClip: {
      const {clip} = action as InsertClip
      return {...state, history: [clip, ...state.history]}
    }
    case ActionTypes.UpdateClip: {
      const {id, clip: newClip} = action as UpdateClip
      const history = state.history.map(clip =>
        clip.id === id ? newClip : clip
      )
      return {...state, history}
    }
    case ActionTypes.DeleteClip: {
      const {id} = action as DeleteClip
      const history = state.history.filter(clip => clip.id !== id)
      return {...state, history}
    }
    case ActionTypes.SetAllowClipboardRead: {
      const {allowed: allowReadClipboard} = action as SetAllowClipboardRead
      return {...state, allowReadClipboard}
    }
    default:
      return state
  }
}
