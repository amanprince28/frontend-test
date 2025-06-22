import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanCheckComponent } from './loan-check.component';

describe('LoanCheckComponent', () => {
  let component: LoanCheckComponent;
  let fixture: ComponentFixture<LoanCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoanCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
