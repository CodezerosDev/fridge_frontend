import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBuyComponent } from './new-buy.component';

describe('NewBuyComponent', () => {
  let component: NewBuyComponent;
  let fixture: ComponentFixture<NewBuyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewBuyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
