import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {EffectsModule} from '@ngrx/effects'
import {Action, StoreModule} from '@ngrx/store'
import {BackdropModule} from 'ft-backdrop'

import {SharedModule} from '../shared/shared.module'
import {ClipComponent} from './clip/clip.component'
import {
  ActionTypes,
  AddToHistory,
  ClipboardState,
  featureName as clipboardFeature,
  LoadHistory,
  SetClipboard,
  SetEditingClipboard,
  SetEditingText,
  SetReadPermission,
  SetWritePermission
} from './clipboard'
import {ClipboardRoutingModule} from './clipboard-routing.module'
import {ClipboardComponent} from './clipboard.component'
import {ClipboardEffects} from './clipboard.effects';
import { ClipListComponent } from './clip-list/clip-list.component';
import { ClipEditorComponent } from './clip-editor/clip-editor.component'

@NgModule({
  declarations: [ClipboardComponent, ClipComponent, ClipListComponent, ClipEditorComponent],
  imports: [
    ClipboardRoutingModule,
    CommonModule,
    SharedModule,
    StoreModule.forFeature(clipboardFeature, clipboardReducer),
    EffectsModule.forFeature([ClipboardEffects]),
    BackdropModule
  ]
})
export class ClipboardModule {}

const initialState: ClipboardState = {
  permissions: {read: false, write: false},
  clip: null,
  editing: false,
  editingText: '',
  history: [],
  isLoading: true
}
function clipboardReducer(
  state = initialState,
  action: Action
): ClipboardState {
  switch (action.type) {
    case ActionTypes.SetReadPermission: {
      const {status: read} = action as SetReadPermission
      return {...state, permissions: {...state.permissions, read}}
    }
    case ActionTypes.SetWritePermission: {
      const {status: write} = action as SetWritePermission
      return {...state, permissions: {...state.permissions, write}}
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
    case ActionTypes.AddToHistory: {
      const {clip} = action as AddToHistory
      return {...state, history: [clip, ...state.history]}
    }
    default:
      return state
  }
}
