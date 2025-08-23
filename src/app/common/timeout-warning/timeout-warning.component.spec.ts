import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeoutWarningComponent } from './timeout-warning.component';

describe('TimeoutWarningComponent', () => {
  let component: TimeoutWarningComponent;
  let fixture: ComponentFixture<TimeoutWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeoutWarningComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeoutWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
