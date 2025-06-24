import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoanCheckService {
  getAgents() {
    return of(['Sky', 'Charles']);
  }

  getInstallments(agents: string[], from: Date, to: Date) {

    
    const mockData = [
      {
        agent: 'Sky',
        customerName: 'Phy',
        customerIC: '123',
        dueDate: '2025-06-14',
        dueAmount: 500,
        status: 'NOT PAID',
        remark: 'Charles | 13/06/2025 | L1001'
      },
      {
        agent: 'Sky',
        customerName: 'Phy',
        customerIC: '123',
        dueDate: '2025-06-16',
        dueAmount: 500,
        status: 'NOT PAID',
        remark: ''
      },
      {
        agent: 'Charles',
        customerName: 'Jess',
        customerIC: '123',
        dueDate: '2025-06-14',
        dueAmount: 500,
        status: 'NOT PAID',
        remark: ''
      }
    ];

    // const fromDate = new Date(from);
    // const toDate = new Date(to);
    return of(
      mockData.filter(
        (item) =>
          agents.includes(item.agent)
      )
    );
  }
}
