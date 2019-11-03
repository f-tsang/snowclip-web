import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import {Subject} from 'rxjs'
import {debounceTime, filter} from 'rxjs/operators'

@Component({
  selector: 'clip-scratchpad',
  templateUrl: './scratchpad.component.html',
  styleUrls: ['./scratchpad.component.scss']
})
export class ScratchpadComponent implements OnChanges, OnDestroy {
  @Input() editing = false
  @Input() value = ''
  @Output() clear = new EventEmitter<void>()
  @Output() done = new EventEmitter<string>()
  @Output() editingChange = new EventEmitter<boolean>()
  @Output() valueChange = new EventEmitter<string>()
  @ViewChild('editor', {read: ElementRef}) private editor: ElementRef
  markForResize = new Subject<void>()

  private markForResizeSub = this.markForResize // TODO - ngOnDestroy
    .pipe(
      debounceTime(100),
      filter(() => this.editor && this.editor.nativeElement)
    )
    .subscribe(() => {
      this.editor.nativeElement.style.height = `` // Excludes the old height.
      this.editor.nativeElement.style.height = `${this.editor.nativeElement.scrollHeight}px`
    })

  ngOnChanges(changes: SimpleChanges) {
    if ('value' in changes) {
      this.markForResize.next()
    }
  }
  ngOnDestroy() {
    this.markForResizeSub.unsubscribe()
  }

  reset(emitValue?: string) {
    this.setValue('')
    this.editingChange.emit(false)
    if (emitValue) {
      this.done.emit(emitValue)
    } else {
      this.clear.emit()
    }
    this.markForResize.next()
  }

  private setValue(value: string) {
    if (typeof value === 'string') {
      this.value = value
      this.valueChange.emit(value)
    }
  }

  private setValue(value: string) {
    if (typeof value === 'string') {
      this.value = value
      this.valueChange.emit(value)
    }
  }
}
