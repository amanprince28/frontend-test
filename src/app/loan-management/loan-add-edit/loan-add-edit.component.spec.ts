import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAddEditComponent } from './loan-add-edit.component';

describe('LoanAddEditComponent', () => {
  let component: LoanAddEditComponent;
  let fixture: ComponentFixture<LoanAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoanAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
