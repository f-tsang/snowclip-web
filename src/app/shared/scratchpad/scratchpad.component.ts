import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core'

@Component({
  selector: 'clip-scratchpad',
  templateUrl: './scratchpad.component.html',
  styleUrls: ['./scratchpad.component.scss']
})
export class ScratchpadComponent implements OnChanges {
  @Input() editing = false
  @Input() value = ''
  @Output() clear = new EventEmitter<void>()
  @Output() done = new EventEmitter<string>()
  @Output() editingChange = new EventEmitter<boolean>()
  @Output() valueChange = new EventEmitter<string>()

  @ViewChild('editor', {read: ElementRef, static: false})
  private editor: ElementRef

  ngOnChanges(changes: SimpleChanges) {
    if ('value' in changes) {
      setTimeout(() => this.resizeHeight()) // Resize after content changes.
    }
  }

  reset(emitValue?: string) {
    this.setValue('')
    this.editingChange.emit(false)
    if (emitValue) {
      this.done.emit(emitValue)
    } else {
      this.clear.emit()
    }
    this.resizeHeight()
  }
  resizeHeight() {
    if (this.editor && this.editor.nativeElement) {
      this.editor.nativeElement.style.height = `` // Excludes the old height.
      this.editor.nativeElement.style.height = `${this.editor.nativeElement.scrollHeight}px`
    }
  }

  private setValue(value: string) {
    if (typeof value === 'string') {
      this.value = value
      this.valueChange.emit(value)
    }
  }
}
