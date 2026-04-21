import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    // Your Spreadsheet ID (correct)
    this.spreadsheetId = '1kGvCboYwCbqFM2mm9DLYjLgoEfw_4IevoQc-IbvvyKk';
    
    // Sheet names (make sure these match EXACTLY with your Google Sheet tabs)
    this.sheets = {
      offices: 'offices',           // Your sheet has "offices" tab
      employees: 'employees',       // Your sheet has "employees" tab
      documents: 'documents',       // Your sheet has "documents" tab
      officeQR: 'office_qr_codes',  // Your sheet has "office_qr_codes" tab
      employeeQR: 'employee_qr_codes' // Your sheet has "employee_qr_codes" tab
    };
  }

  async fetchSheetAsJSON(sheetName) {
    try {
      // ✅ CORRECT URL - Using the CSV export endpoint
      const url = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
      
      console.log(`Fetching ${sheetName} from:`, url);
      
      const response = await axios.get(url);
      const csvData = response.data;
      
      if (!csvData || csvData.trim() === '') {
        console.warn(`No data found in sheet: ${sheetName}`);
        return [];
      }
      
      const rows = csvData.trim().split('\n');
      if (rows.length < 2) {
        console.warn(`Sheet ${sheetName} has no data rows`);
        return [];
      }
      
      const headers = rows[0].split(',').map(h => h.replace(/"/g, '').trim());
      const data = [];
      
      for (let i = 1; i < rows.length; i++) {
        const values = this.parseCSVRow(rows[i]);
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.replace(/"/g, '').trim() || '';
        });
        data.push(row);
      }
      
      console.log(`Fetched ${data.length} rows from ${sheetName}`);
      return data;
    } catch (error) {
      console.error(`Error fetching ${sheetName}:`, error);
      return [];
    }
  }

  parseCSVRow(row) {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    result.push(currentValue);
    
    return result;
  }

  async getOffices() {
    const data = await this.fetchSheetAsJSON(this.sheets.offices);
    console.log('Offices data:', data);
    return data;
  }

  async getEmployeesByOffice(officeId) {
    const allEmployees = await this.fetchSheetAsJSON(this.sheets.employees);
    // Convert officeId to string for comparison since your ID is "01" (string)
    const filtered = allEmployees.filter(emp => String(emp.office_id) === String(officeId) && emp.status === 'Active');
    console.log(`Employees for office ${officeId}:`, filtered);
    return filtered;
  }

  async getEmployeeDetails(employeeId) {
    const allEmployees = await this.fetchSheetAsJSON(this.sheets.employees);
    return allEmployees.find(emp => emp.employee_id === employeeId) || null;
  }

  async getEmployeeDocuments(employeeId) {
    const allDocuments = await this.fetchSheetAsJSON(this.sheets.documents);
    return allDocuments.filter(doc => doc.employee_id === employeeId);
  }

  async getAllEmployees() {
    const allEmployees = await this.fetchSheetAsJSON(this.sheets.employees);
    return allEmployees.filter(emp => emp.status === 'Active');
  }

  async validateQRCode(qrCode, qrSecret) {
    const officeQRs = await this.fetchSheetAsJSON(this.sheets.officeQR);
    for (const qr of officeQRs) {
      if (qr.qr_code === qrCode && qr.qr_secret === qrSecret && qr.is_active === 'TRUE') {
        if (qr.expires_date && new Date(qr.expires_date) < new Date()) {
          return { valid: false, message: 'QR code expired' };
        }
        return {
          valid: true,
          type: 'office',
          office_id: qr.office_id,
          access_level: qr.access_level || 'standard'
        };
      }
    }
    
    const employeeQRs = await this.fetchSheetAsJSON(this.sheets.employeeQR);
    for (const qr of employeeQRs) {
      if (qr.qr_code === qrCode && qr.qr_secret === qrSecret && qr.is_active === 'TRUE') {
        if (qr.expires_date && new Date(qr.expires_date) < new Date()) {
          return { valid: false, message: 'QR code expired' };
        }
        return {
          valid: true,
          type: 'employee',
          employee_id: qr.employee_id,
          office_id: qr.office_id
        };
      }
    }
    
    return { valid: false, message: 'Invalid QR code' };
  }

  async getOfficeDetails(officeId) {
    const offices = await this.getOffices();
    return offices.find(office => String(office.office_id) === String(officeId)) || null;
  }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;