import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
    fromDate: [null],
    toDate: [null],
  });

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

  onSubmit() {
    if (!this.form.value.reportType) {
      this.showTable = false;
      return;
    }

    this.selectedReportType = this.form.value.reportType as 'loan' | 'payment';
    this.isLoading = true;
    this.errorMessage = '';
    this.showTable = false;

    const { fromDate, toDate } = this.form.value;

    const formattedFromDate = fromDate
      ? new Date(fromDate).toISOString().split('T')[0]
      : undefined;
    const formattedToDate = toDate
      ? new Date(toDate).toISOString().split('T')[0]
      : undefined;

    this.dataService
      .getReport(this.selectedReportType, formattedFromDate, formattedToDate)
      .subscribe({
        next: (response: any) => {
          if (this.selectedReportType === 'loan') {
            const data =
              response?.length > 0
                ? response.map((loan: any) => {
                    const totalPayments = loan.loanData.payment
                      .filter((p: any) => p.type === 'In')
                      .reduce(
                        (sum: number, p: any) => sum + Number(p.amount),
                        0
                      );

                    const outAmount = Number(loan.out.replace(/[^0-9.]/g, ''));
                    const depositAmount = Number(
                      loan.deposit.replace(/[^0-9.]/g, '')
                    );
                    const onHandAmount = (outAmount - depositAmount).toFixed(2);

                    return {
                      ...loan,
                      loanData: {
                        ...loan.loanData,
                        installment: loan.loanData.installment.sort(
                          (a: any, b: any) =>
                            new Date(a.installment_date).getTime() -
                            new Date(b.installment_date).getTime()
                        ),
                        amount_due: loan.loanData.installment
                          .sort(
                            (a: any, b: any) =>
                              new Date(a.installment_date).getTime() -
                              new Date(b.installment_date).getTime()
                          )
                          .map((i: any) => ({
                            due_amount: i.due_amount,
                          })),
                        payment: loan.loanData.payment.sort(
                          (a: any, b: any) =>
                            new Date(a.installmentDate).getTime() -
                            new Date(b.installmentDate).getTime()
                        ),
                      },
                      paymentStatus:
                        totalPayments >= outAmount
                          ? 'Fully Paid'
                          : totalPayments > 0
                          ? 'Partial Paid'
                          : 'Unpaid',
                      onHand: onHandAmount,
                    };
                  })
                : [];
            this.loanDataSource.data = data;
            setTimeout(
              () => (this.loanDataSource.paginator = this.loanPaginator)
            );
          } else {
            const data = response || [];
            this.paymentDataSource.data = data;
            setTimeout(
              () => (this.paymentDataSource.paginator = this.paymentPaginator)
            );
          }

          this.showTable = true;
          this.isLoading = false;

          if (
            (this.selectedReportType === 'loan' &&
              this.loanDataSource.data.length === 0) ||
            (this.selectedReportType === 'payment' &&
              this.paymentDataSource.data.length === 0)
          ) {
            this.errorMessage =
              'No data available, please select different dates.';
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to fetch report data. Please try again.';
          this.isLoading = false;
          console.error('Error fetching report data:', error);
        },
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
          amount: `RM ${p.amount}.00`,
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
        'SUCCESS DATE': loan.loanCreatedDate
          ? this.formatDate(loan.loanCreatedDate)
          : '',
        'LOAN ID': loan.loanId,
        'AGENT Name': loan.loanData.user.name,
        NAME: loan.customerName,
        'LOAN AMOUNT': `RM ${loan.loanAmount}`,
        OUT: `RM ${loan.out}`,
        DEPOSIT: `RM ${loan.deposit}`,
        'ON HAND': `RM ${loan.onHand}`,
        'PAYMENT DATE': paymentDates,
        'INSTALLMENT DATE': ins_date,
        'PAYABLE AMOUNT': this.due_amount,
        AMOUNT: paymentAmounts,
        STATUS: loan.paymentStatus,
        'Estimated Profit': `RM ${loan.estimatedProfit}`,
        'Actual Profit': `RM ${loan.actualProfit}`,
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
      'Payment In': payment.totalPaymentIn,
      'Payment Out': payment.totalPaymentOut,
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
