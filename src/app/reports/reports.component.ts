import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { DataService } from '../data.service';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    HttpClientModule,
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements AfterViewInit {
  form = this.fb.group({
    reportType: [''],
    fromDate: [''],
    toDate: [''],
    paymentFromDate: [''],
    paymentToDate: ['']
  }, {
    validators: [
      this.validateDatePair('fromDate', 'toDate'),
      this.validateDatePair('paymentFromDate', 'paymentToDate')
    ]
  });

  validateDatePair(startKey: string, endKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get(startKey)?.value;
      const end = group.get(endKey)?.value;
      if (start && !end) {
        group.get(endKey)?.setErrors({ required: true });
        return { datePairInvalid: true };
      }
      group.get(endKey)?.setErrors(null); // clear errors if valid
      return null;
    };
  }

  selectedReportType: 'loan' | 'payment' | null = null;
  showTable = false;
  isLoading = false;
  errorMessage = '';

  loanDisplayedColumns = [
    'sucessDate',
    'loanId',
    'agent',
    'customerName',
    'loanAmount',
    'out',
    'deposit',
    'onHand',
    'paymentDate',
    'installmentDate',
    'payableAmount',
    'amount',
    'status',
    'estimatedProfit',
    'actualProfit',
  ];

  paymentDisplayedColumns = [
    'paymntin_out',
    'type',
    'agentName',
    'loanId',
    'customerName',
    'totalPaymentIn',
    'totalPaymentOut',
    'bankAgentAccountNo',
    'remarks',
  ];

  loanDataSource = new MatTableDataSource<any>();
  paymentDataSource = new MatTableDataSource<any>();

  @ViewChild('loanPaginator') loanPaginator!: MatPaginator;
  @ViewChild('paymentPaginator') paymentPaginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;
  due_amount: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dataService: DataService
  ) {}

  ngAfterViewInit(): void {
    this.loanDataSource.sort = this.sort;
    this.paymentDataSource.sort = this.sort;
  }

  // onSubmit() {
  //   if (!this.form.value.reportType) {
  //     this.showTable = false;
  //     return;
  //   }

  //   this.selectedReportType = this.form.value.reportType as 'loan' | 'payment';
  //   this.isLoading = true;
  //   this.errorMessage = '';
  //   this.showTable = false;

  //   const { fromDate, toDate,paymentFromDate,paymentToDate } = this.form.value;

  //   const formattedFromDate = fromDate
  //     ? new Date(fromDate).toISOString().split('T')[0]
  //     : undefined;
  //   const formattedToDate = toDate
  //     ? new Date(toDate).toISOString().split('T')[0]
  //     : undefined;

  //     const formattedPaymentFromDate = paymentFromDate
  //     ? new Date(paymentFromDate).toISOString().split('T')[0]
  //     : undefined;
  //   const formattedPaymentToDate = paymentToDate
  //     ? new Date(paymentToDate).toISOString().split('T')[0]
  //     : undefined;

  //   this.dataService
  //     .getReport(this.selectedReportType, formattedFromDate, formattedToDate,formattedPaymentFromDate,formattedPaymentToDate)
  //     .subscribe({
  //       next: (response: any) => {
  //         if (this.selectedReportType === 'loan') {
  //           const data =
  //             response?.length > 0
  //               ? response.map((loan: any) => {
  //                   const totalPayments = loan.loanData.payment
  //                     .filter((p: any) => p.type === 'In')
  //                     .reduce(
  //                       (sum: number, p: any) => sum + Number(p.amount),
  //                       0
  //                     );
                    
  //                   const outAmount = Number(loan.out.replace(/[^0-9.]/g, ''));
  //                   const depositAmount = Number(
  //                     loan.deposit.replace(/[^0-9.]/g, '')
  //                   );
  //                   const onHandAmount = (outAmount - depositAmount).toFixed(2);
  //                   if(loan.loanData.user_2!=null){
  //                     console.log(loan.loanData.user_2,'user2');
  //                   }
  //                   return {
  //                     ...loan,
  //                     loanData: {
  //                       ...loan.loanData,
  //                       installment: loan.loanData.installment.sort(
  //                         (a: any, b: any) =>
  //                           new Date(a.installment_date).getTime() -
  //                           new Date(b.installment_date).getTime()
  //                       ),
  //                       amount_due: loan.loanData.installment
  //                         .sort(
  //                           (a: any, b: any) =>
  //                             new Date(a.installment_date).getTime() -
  //                             new Date(b.installment_date).getTime()
  //                         )
  //                         .map((i: any) => ({
  //                           due_amount: i.due_amount,
  //                         })),
  //                       payment: loan.loanData.payment.sort(
  //                         (a: any, b: any) =>
  //                           new Date(a.installmentDate).getTime() -
  //                           new Date(b.installmentDate).getTime()
  //                       ),
  //                     },
  //                     paymentStatus:
  //                       totalPayments >= outAmount
  //                         ? 'Fully Paid'
  //                         : totalPayments > 0
  //                         ? 'Partial Paid'
  //                         : 'Unpaid',
  //                     onHand: onHandAmount,
  //                   };
  //                 })
  //               : [];
  //           this.loanDataSource.data = data;
  //           setTimeout(
  //             () => (this.loanDataSource.paginator = this.loanPaginator)
  //           );
  //         } else {
  //           const data = response || [];
  //           this.paymentDataSource.data = data.filter((item:any) => item !== null);
  //           setTimeout(
  //             () => (this.paymentDataSource.paginator = this.paymentPaginator)
  //           );
  //         }

  //         this.showTable = true;
  //         this.isLoading = false;

  //         if (
  //           (this.selectedReportType === 'loan' &&
  //             this.loanDataSource.data.length === 0) ||
  //           (this.selectedReportType === 'payment' &&
  //             this.paymentDataSource.data.length === 0)
  //         ) {
  //           this.errorMessage =
  //             'No data available, please select different dates.';
  //         }
  //       },
  //       error: (error) => {
  //         this.errorMessage = 'Failed to fetch report data. Please try again.';
  //         this.isLoading = false;
  //         console.error('Error fetching report data:', error);
  //       },
  //     });
  // }

  onSubmit() {
    if (!this.form.value.reportType) {
      this.showTable = false;
      return;
    }
  
    this.selectedReportType = this.form.value.reportType as 'loan' | 'payment';
    this.isLoading = true;
    this.errorMessage = '';
    this.showTable = false;
  
    const { fromDate, toDate,paymentFromDate,paymentToDate  } = this.form.value;
  
    const formattedFromDate = fromDate ? new Date(fromDate).toISOString().split('T')[0] : undefined;
    const formattedToDate = toDate ? new Date(toDate).toISOString().split('T')[0] : undefined;
  
    const formattedPaymentFromDate = paymentFromDate ? new Date(paymentFromDate).toISOString().split('T')[0] : undefined;
    const formattedPaymentToDate = paymentToDate ? new Date(paymentToDate).toISOString().split('T')[0] : undefined;
  
    const num = (v: any) => v == null ? 0 : Number(String(v).replace(/[^0-9.-]/g, '')) || 0;
    const halfNum = (v: any) => Number((num(v) / 2).toFixed(2));
  
    this.dataService
      .getReport(
        this.selectedReportType,
        formattedFromDate,
        formattedToDate,
        formattedPaymentFromDate,
        formattedPaymentToDate
      )
      .subscribe({
        next: (response: any) => {
          if (this.selectedReportType === 'loan') {
            const data: any[] = [];
  
            (response || []).forEach((loan: any) => {
              // Parse base numeric amounts
              const outAmount = num(loan.loanAmount)-num(loan.loanData?.application_fee);
              const depositAmount = num(loan.deposit);
              const onHandAmount = outAmount - depositAmount;
  
              // Sort once
              const sortedInstallments = (loan.loanData?.installment || []).slice().sort(
                (a: any, b: any) =>
                  new Date(a.installment_date).getTime() - new Date(b.installment_date).getTime()
              );
  
              const sortedPayments = (loan.loanData?.payment || []).slice().sort(
                (a: any, b: any) =>
                  new Date(a.installmentDate).getTime() - new Date(b.installmentDate).getTime()
              );
  
              // Build normalized base (no push yet)
              const baseNormalized = {
                ...loan,
                outAmount:outAmount,
                loanData: {
                  ...loan.loanData,
                  installment: sortedInstallments,
                  // amount_due -> half for split rows; for nonsplit we keep original below
                  amount_due: sortedInstallments.map((i: any) => ({ due_amount: i.due_amount })),
                  payment: sortedPayments
                }
              };
  
              const user2 = loan?.loanData?.user_2 ?? null;
  
              // Helper to create a split row with halves applied
              const makeSplitRow = (agentValue: any) => {
                // halve payments' amount
                const paymentsHalf = (baseNormalized.loanData.payment || []).map((p: any) => ({
                  ...p,
                  amount: halfNum(p.amount)
                }));
  
                // total payments (In) based on halved amounts
                const totalPaymentsHalf = paymentsHalf
                  .filter((p: any) => p.type === 'In')
                  .reduce((sum: number, p: any) => sum + num(p.amount), 0);
  
                const outHalf = halfNum(outAmount);
                const depositHalf = halfNum(depositAmount);
                const onHandHalf = halfNum(onHandAmount);
  
                // halve amount_due
                const amountDueHalf = (baseNormalized.loanData.amount_due || []).map((d: any) => ({
                  due_amount: halfNum(d.due_amount)
                }));
  
                // Build row, halving all requested fields (both root and nested if present)
                const row: any = {
                  ...baseNormalized,
                  // root-level halves when present
                  loanAmount: baseNormalized.loanAmount != null ? halfNum(baseNormalized.loanAmount) : baseNormalized.loanAmount,
                  outAmount: outHalf,
                  deposit: depositHalf,
                  onHand: onHandHalf,
                  amount: baseNormalized.amount != null ? halfNum(baseNormalized.amount) : baseNormalized.amount,
                  estimated_profit:
                    baseNormalized.estimated_profit != null ? halfNum(baseNormalized.estimated_profit) : baseNormalized.estimated_profit,
                  estimatedProfit:
                    baseNormalized.estimatedProfit != null ? halfNum(baseNormalized.estimatedProfit) : baseNormalized.estimatedProfit,
                  actualProfit:
                    baseNormalized.actualProfit != null ? halfNum(baseNormalized.actualProfit) : baseNormalized.actualProfit,
  
                  loanData: {
                    ...baseNormalized.loanData,
                    // set/override an agent field; keep original other fields
                    agent: agentValue ?? baseNormalized.loanData.agent ?? baseNormalized.loanData.user ?? baseNormalized.agent ?? baseNormalized.user,
                    amount: baseNormalized.loanData.amount != null ? halfNum(baseNormalized.loanData.amount) : baseNormalized.loanData.amount,
                    loanAmount:
                      baseNormalized.loanData.loanAmount != null
                        ? halfNum(baseNormalized.loanData.loanAmount)
                        : baseNormalized.loanData.loanAmount,
                    estimated_profit:
                      baseNormalized.loanData.estimated_profit != null
                        ? halfNum(baseNormalized.loanData.estimated_profit)
                        : baseNormalized.loanData.estimated_profit,
                    estimatedProfit:
                      baseNormalized.loanData.estimatedProfit != null
                        ? halfNum(baseNormalized.loanData.estimatedProfit)
                        : baseNormalized.loanData.estimatedProfit,
                    actualProfit:
                      baseNormalized.loanData.actualProfit != null
                        ? halfNum(baseNormalized.loanData.actualProfit)
                        : baseNormalized.loanData.actualProfit,
                    amount_due: amountDueHalf,
                    payment: paymentsHalf
                  }
                };
  
                // payment status against halved out
                row.paymentStatus =
                  totalPaymentsHalf >= outHalf
                    ? 'Fully Paid'
                    : totalPaymentsHalf > 0
                    ? 'Partial Paid'
                    : 'Unpaid';
  
                return row;
              };
  
              if (user2) {
                // Split into two rows (replace base). Primary + user_2, both halved
                const primaryAgent =
                  baseNormalized.loanData.agent ??
                  baseNormalized.loanData.user ??
                  baseNormalized.agent ??
                  baseNormalized.user ??
                  null;
  
                const row1 = makeSplitRow(primaryAgent);
                const row2 = makeSplitRow(user2);
                row2.agent=user2?.name
  
                data.push(row1, row2);
              } else {
                // No split: keep original behavior (full amounts)
                const totalPayments = (baseNormalized.loanData.payment || [])
                  .filter((p: any) => p.type === 'In')
                  .reduce((sum: number, p: any) => sum + num(p.amount), 0);
  
                const fullRow = {
                  ...baseNormalized,
                  loanData: {
                    ...baseNormalized.loanData,
                    amount_due: baseNormalized.loanData.amount_due, // unchanged
                  },
                  paymentStatus:
                    totalPayments >= outAmount
                      ? 'Fully Paid'
                      : totalPayments > 0
                      ? 'Partial Paid'
                      : 'Unpaid',
                  onHand: onHandAmount.toFixed(2)
                };
  
                data.push(fullRow);
              }
            });
  
            this.loanDataSource.data = data;
            setTimeout(() => (this.loanDataSource.paginator = this.loanPaginator));
          } else {
            const data = response || [];
            //this.paymentDataSource.data = data.filter((item: any) => item !== null);
            //setTimeout(() => (this.paymentDataSource.paginator = this.paymentPaginator));
            const processedData = data.flatMap((item: any) => {
              if (item.agentName2 && item.agentName2.trim() !== "") {
                const totalIn = item.totalPaymentIn ? parseFloat(item.totalPaymentIn) / 2 : 0;
                const totalOut = item.totalPaymentOut ? parseFloat(item.totalPaymentOut) / 2 : 0;
            
                return [
                  {
                    ...item,
                    agentName: item.agentName,
                    totalPaymentIn: totalIn ? totalIn.toString() : "",
                    totalPaymentOut: totalOut ? totalOut.toString() : ""
                  },
                  {
                    ...item,
                    agentName: item.agentName2,
                    totalPaymentIn: totalIn ? totalIn.toString() : "",
                    totalPaymentOut: totalOut ? totalOut.toString() : ""
                  }
                ];
              } else {
                return [item];
              }
            });
            
            this.paymentDataSource.data = processedData.filter((item: any) => item !== null);
            
            setTimeout(() => {
              this.paymentDataSource.paginator = this.paymentPaginator;
            });
          }
  
          this.showTable = true;
          this.isLoading = false;
  
          if (
            (this.selectedReportType === 'loan' && this.loanDataSource.data.length === 0) ||
            (this.selectedReportType === 'payment' && this.paymentDataSource.data.length === 0)
          ) {
            this.errorMessage = 'No data available, please select different dates.';
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to fetch report data. Please try again.';
          this.isLoading = false;
          console.error('Error fetching report data:', error);
        }
      });
  }
  

  
  exportXLSX() {
    if (!this.selectedReportType) return;

    const data =
      this.selectedReportType === 'loan'
        ? this.loanDataSource.data
        : this.paymentDataSource.data;

    if (data.length === 0) {
      this.errorMessage = 'No data available to export.';
      return;
    }

    try {
      const exportData =
        this.selectedReportType === 'loan'
          ? this.prepareLoanExportData()
          : this.preparePaymentExportData();

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
      const workbook: XLSX.WorkBook = {
        Sheets: { data: worksheet },
        SheetNames: ['data'],
      };

      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, `${this.selectedReportType}-report`);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Error exporting data';
      console.error('Export error:', error);
    }
  }

  private prepareLoanExportData(): any[] {
    return this.loanDataSource.data.map((loan) => {
      const payments = loan.loanData.payment
        .sort(
          (a: any, b: any) =>
            new Date(a.installment_date).getTime() -
            new Date(b.installment_date).getTime()
        )
        .filter((p: any) => p.type === 'In')
        .map((p: any) => ({
          date: p.payment_date ? this.formatDate(p.payment_date) : '',
          amount: `${p.amount}.00`,
        }));

      const paymentDates = payments.map((p: any) => p.date).join('\n');
      const paymentAmounts = payments.map((p: any) => p.amount).join('\n');

      const installment = loan.loanData.installment
        .sort(
          (a: any, b: any) =>
            new Date(a.installment_date).getTime() -
            new Date(b.installment_date).getTime()
        )
        .map((i: any) => ({
          ins_date: this.formatDate(i.installment_date),
          payable: loan.loanData.payment_per_term,
          due_amount: i.due_amount,
        }));

      const ins_date = installment.map((i: any) => i.ins_date).join('\n');
      const payable = installment.map((i: any) => i.payable).join('\n');
      this.due_amount = installment.map((i: any) => i.due_amount).join('\n');

      return {
        // 'SUCCESS DATE': loan.loanCreatedDate
        //   ? this.formatDate(loan.loanCreatedDate)
        //   : '',
        // 'LOAN ID': loan.loanId,
        // 'AGENT Name': loan.loanData.user.name,
        // NAME: loan.customerName,
        // 'LOAN AMOUNT': `RM ${loan.loanAmount}`,
        // OUT: `RM ${loan.out}`,
        // DEPOSIT: `RM ${loan.deposit}`,
        // 'ON HAND': `RM ${loan.onHand}`,
        // 'PAYMENT DATE': paymentDates,
        // 'INSTALLMENT DATE': ins_date,
        // 'PAYABLE AMOUNT': this.due_amount,
        // AMOUNT: paymentAmounts,
        // STATUS: loan.paymentStatus,
        // 'Estimated Profit': `RM ${loan.estimatedProfit}`,
        // 'Actual Profit': `RM ${loan.actualProfit}`,
        'SUCCESS DATE': loan.loanCreatedDate
        ? this.formatDate(loan.loanCreatedDate)
        : '',
      'LOAN ID': loan.loanId,
      'AGENT Name': loan.agent,
      NAME: loan.customerName,
      'LOAN AMOUNT': Number(loan.loanAmount),
      'OUT(RM)': Number(loan.outAmount),
      'DEPOSIT(RM)': Number(loan.deposit),
      'ON HAND': Number(loan.onHand),
      'PAYMENT DATE': paymentDates,
      'INSTALLMENT DATE': ins_date,
      'PAYABLE AMOUNT': this.due_amount.includes('\n') ? this.due_amount : Number(this.due_amount),
      'AMOUNT(RM)': paymentAmounts.includes('\n') ? paymentAmounts : Number(paymentAmounts),
      STATUS: loan.paymentStatus,
      'Estimated Profit': Number(loan.estimatedProfit),
      'Actual Profit': Number(loan.actualProfit),
      };
    });
  }

  private preparePaymentExportData(): any[] {
    return this.paymentDataSource.data.map((payment) => ({
      'Payment In/Out': payment.paymntin_out
        ? this.formatDate(payment.paymntin_out)
        : '',
      Type: payment.paymentType,
      Agent: payment.agentName,
      'Loan ID': payment.loanId,
      'Customer Name': payment.customerName,
      'Payment In(RM)': Number(payment.totalPaymentIn),
      'Payment Out(RM)': Number(payment.totalPaymentOut),
      'Bank A/C No.': payment.bankAgentAccountNo,
      Remarks: payment.remarks,
    }));
  }

  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    FileSaver.saveAs(
      blob,
      `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  }
}
