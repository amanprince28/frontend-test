import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  form = this.fb.group({
    reportType: [''],
    fromDate: [null],
    toDate: [null]
  });

  selectedReportType: 'loan' | 'payment' | null = null;
  showTable = false;
  isLoading = false;
  errorMessage = '';

  loanDisplayedColumns = [
    'sucessDate',
    'loanId',
    'customerName',
    'loanAmount',
    'out',
    'deposit',
    'onHand',
    'paymentDate',
    'amount',
    'status',
    'estimatedProfit',
    'actualProfit'
  ];

  paymentDisplayedColumns = [
    'loanCreatedDate',
    'loanId',
    'agentName',
    'customerName',
    'totalPaymentIn',
    'totalPaymentOut',
    'bankAgentAccountNo'
  ];

  loanReportData: any[] = [];
  paymentReportData: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient,private dataService:DataService) {}

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
  
    const formattedFromDate = fromDate ? new Date(fromDate).toISOString().split('T')[0] : undefined;
    const formattedToDate = toDate ? new Date(toDate).toISOString().split('T')[0] : undefined;
  
    this.dataService.getReport(this.selectedReportType, formattedFromDate, formattedToDate).subscribe({
      next: (response: any) => {
        if (this.selectedReportType === 'loan') {
          this.loanReportData = response && response.length > 0 ? 
            response.map((loan:any) => {
              const totalPayments = loan.loanData.payment
                  .filter((p:any) => p.type === 'In')
                  .reduce((sum:any, p:any) => sum + Number(p.amount), 0);
              
              const outAmount = Number(loan.out.replace(/[^0-9.]/g, ''));
              const depositAmount = Number(loan.deposit.replace(/[^0-9.]/g, ''));
              const onHandAmount = (outAmount - depositAmount).toFixed(2);
  
              return {
                  ...loan,
                  paymentStatus: totalPayments >= outAmount ? 'Fully Paid' : 
                               totalPayments > 0 ? 'Partial Paid' : 'Unpaid',
                  onHand: onHandAmount
              };
            }) : [];
        } else {
          this.paymentReportData = response && response.length > 0 ? response : [];
        }
        
        this.showTable = true;
        this.isLoading = false;
        
        // Show message if no data
        if ((this.selectedReportType === 'loan' && this.loanReportData.length === 0) ||
            (this.selectedReportType === 'payment' && this.paymentReportData.length === 0)) {
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
  
    const data = this.selectedReportType === 'loan' ? this.loanReportData : this.paymentReportData;
    if (data.length === 0) {
      this.errorMessage = 'No data available to export, please select different dates.';

      return;
    }
  
    try {
      const exportData = this.selectedReportType === 'loan' 
        ? this.prepareLoanExportData() 
        : this.preparePaymentExportData();
  
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
      const workbook: XLSX.WorkBook = {
        Sheets: { data: worksheet },
        SheetNames: ['data']
      };
    
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, `${this.selectedReportType}-report`);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Error exporting data';
      console.error('Export error:', error);
    }
  }
  
  private prepareLoanExportData(): any[] {
    return this.loanReportData.map(loan => {
      // Get all payment dates and amounts
      const payments = loan.loanData.payment
        .filter((p: any) => p.type === 'In')
        .map((p: any) => ({
          date: p.payment_date ? new Date(p.payment_date).toISOString().split('T')[0] : '',
          amount: `RM ${p.amount}.00`
        }));
  
      // Combine payment dates and amounts into strings
      const paymentDates = payments.map((p:any) => p.date).join('\n');
      const paymentAmounts = payments.map((p:any) => p.amount).join('\n');
  
      return {
        'SUCCESS DATE': loan.loanCreatedDate ? new Date(loan.loanCreatedDate).toISOString().split('T')[0] : '',
        'LOAN ID': loan.loanId,
        'NAME': loan.customerName,
        'LOAN AMOUNT': `RM ${loan.loanAmount}`,
        'OUT': `RM ${loan.out}`,
        'DEPOSIT': `RM ${loan.deposit}`,
        'ON HAND': `RM ${loan.onHand}`,
        'PAYMENT DATE': paymentDates,
        'AMOUNT': paymentAmounts,
        'STATUS': loan.paymentStatus,
        'Estimated Profit': `RM ${loan.estimatedProfit}`,
        'Actual Profit': `RM ${loan.actualProfit}`
      };
    });
  }
  
  private preparePaymentExportData(): any[] {
    return this.paymentReportData.map(payment => ({
      'Loan Created Date': payment.loanCreatedDate ? new Date(payment.loanCreatedDate).toISOString().split('T')[0] : '',
      'Loan ID': payment.loanId,
      'Agent': payment.agentName,
      'Customer Name': payment.customerName,
      'Payment In': payment.totalPaymentIn,
      'Payment Out': payment.totalPaymentOut,
      'Bank A/C No.': payment.bankAgentAccountNo
    }));
  }
  
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    FileSaver.saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}