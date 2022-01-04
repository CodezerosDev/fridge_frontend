import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElbHealthComponent } from './elb-health.component';

describe('ElbHealthComponent', () => {
  let component: ElbHealthComponent;
  let fixture: ComponentFixture<ElbHealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElbHealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElbHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
