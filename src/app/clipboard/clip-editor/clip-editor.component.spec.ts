import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipEditorComponent } from './clip-editor.component';

describe('ClipEditorComponent', () => {
  let component: ClipEditorComponent;
  let fixture: ComponentFixture<ClipEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClipEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
