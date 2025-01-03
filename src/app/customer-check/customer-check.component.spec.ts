import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCheckComponent } from './customer-check.component';

describe('CustomerCheckComponent', () => {
  let component: CustomerCheckComponent;
  let fixture: ComponentFixture<CustomerCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
