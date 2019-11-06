import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipFavouritesComponent } from './clip-favourites.component';

describe('ClipFavouritesComponent', () => {
  let component: ClipFavouritesComponent;
  let fixture: ComponentFixture<ClipFavouritesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClipFavouritesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipFavouritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
