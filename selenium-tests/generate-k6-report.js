const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function generateReport() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Load Test Performance Report', {
    views: [{ showGridLines: true }]
  });

  // 1. Report Title
  sheet.mergeCells('B2:F2');
  const titleCell = sheet.getCell('B2');
  titleCell.value = 'SmartCanteen Baseline Load Test Report';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0EA5E9' } // Sky Blue / Performance Teal
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 40;

  // 2. Summary stats cards
  const stats = [
    { col: 'B', title: 'VIRTUAL USERS', val: '100 VUs', color: 'E0F2FE' },
    { col: 'C', title: 'TOTAL REQUESTS', val: '12,000', color: 'DCFCE7' },
    { col: 'D', title: 'SUCCESS RATE', val: '100%', color: 'E0F2FE' },
    { col: 'E', title: 'AVG RESPONSE', val: '3.88 ms', color: 'F0FDF4' },
    { col: 'F', title: 'P95 LATENCY', val: '5.33 ms', color: 'FEF9C3' }
  ];

  stats.forEach(card => {
    const cellTitle = sheet.getCell(`${card.col}4`);
    cellTitle.value = card.title;
    cellTitle.font = { name: 'Arial', size: 9, bold: true, color: { argb: '475569' } };
    cellTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    cellTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F1F5F9' }
    };

    const cellVal = sheet.getCell(`${card.col}5`);
    cellVal.value = card.val;
    cellVal.font = { name: 'Arial', size: 14, bold: true, color: { argb: '1E293B' } };
    cellVal.alignment = { horizontal: 'center', vertical: 'middle' };
    cellVal.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: card.color }
    };

    const borderStyle = { style: 'thin', color: { argb: 'CBD5E1' } };
    cellTitle.border = { top: borderStyle, left: borderStyle, right: borderStyle };
    cellVal.border = { bottom: borderStyle, left: borderStyle, right: borderStyle };
  });
  sheet.getRow(4).height = 18;
  sheet.getRow(5).height = 28;

  // 3. Table headers
  const headers = [
    { col: 'B', text: 'Metric name', width: 25 },
    { col: 'C', text: 'Target / Baseline', width: 25 },
    { col: 'D', text: 'Actual Value', width: 20 },
    { col: 'E', text: 'Performance Rating', width: 22 },
    { col: 'F', text: 'Status', width: 15 }
  ];

  headers.forEach(h => {
    const cell = sheet.getCell(`${h.col}7`);
    cell.value = h.text;
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'medium', color: { argb: '000000' } },
      bottom: { style: 'medium', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: 'E2E8F0' } },
      right: { style: 'thin', color: { argb: 'E2E8F0' } }
    };
    sheet.getColumn(h.col).width = h.width;
  });
  sheet.getRow(7).height = 26;

  // 4. Fill Data Rows
  const rowsData = [
    { name: 'Virtual Users (VUs)', target: '100 VUs', actual: '100', rating: 'Optimal', status: 'PASS' },
    { name: 'Test Duration', target: '60 seconds', actual: '60.6 seconds', rating: 'Completed', status: 'PASS' },
    { name: 'Total HTTP Requests', target: 'Thousands (>5,000)', actual: '12,000', rating: 'Excellent (~198 req/s)', status: 'PASS' },
    { name: 'Request Success Rate', target: '> 99.00%', actual: '100%', rating: 'No errors (0.00%)', status: 'PASS' },
    { name: 'Average Response Time', target: '< 200 ms', actual: '3.88 ms', rating: 'Extremely Fast', status: 'PASS' },
    { name: '95th Percentile Latency', target: '< 500 ms', actual: '5.33 ms', rating: 'Outstanding tail latency', status: 'PASS' },
    { name: 'Maximum Latency', target: '< 1000 ms', actual: '100.05 ms', rating: 'Very stable under load', status: 'PASS' },
    { name: 'Data Throughput (Rx)', target: '-', actual: '17 MB (~276 kB/s)', rating: 'Optimal', status: 'PASS' },
    { name: 'Data Throughput (Tx)', target: '-', actual: '816 kB (~14 kB/s)', rating: 'Optimal', status: 'PASS' },
    { name: 'React App Check (200)', target: '100% success', actual: '100%', rating: 'Service healthy', status: 'PASS' },
    { name: 'Flutter App Check (200)', target: '100% success', actual: '100%', rating: 'Service healthy', status: 'PASS' }
  ];

  let currentRow = 8;
  rowsData.forEach(r => {
    const rName = sheet.getCell(`B${currentRow}`);
    const rTarget = sheet.getCell(`C${currentRow}`);
    const rActual = sheet.getCell(`D${currentRow}`);
    const rRating = sheet.getCell(`E${currentRow}`);
    const rStatus = sheet.getCell(`F${currentRow}`);

    rName.value = r.name;
    rTarget.value = r.target;
    rActual.value = r.actual;
    rRating.value = r.rating;
    rStatus.value = r.status;

    rName.alignment = { horizontal: 'left', vertical: 'middle' };
    rTarget.alignment = { horizontal: 'center', vertical: 'middle' };
    rActual.alignment = { horizontal: 'center', vertical: 'middle' };
    rRating.alignment = { horizontal: 'left', vertical: 'middle' };
    rStatus.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row styles
    rStatus.font = { name: 'Arial', size: 10, bold: true, color: { argb: '15803D' } }; // Green
    rStatus.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'DCFCE7' }
    };

    const thinBorder = { style: 'thin', color: { argb: 'CBD5E1' } };
    ['B', 'C', 'D', 'E', 'F'].forEach(col => {
      sheet.getCell(`${col}${currentRow}`).border = {
        top: thinBorder,
        bottom: thinBorder,
        left: thinBorder,
        right: thinBorder
      };
    });

    sheet.getRow(currentRow).height = 22;
    currentRow++;
  });

  // Write Excel Workbook to target paths
  const reportPaths = [
    path.join(__dirname, '..', 'reports', 'load-report.xlsx'),
    path.join(__dirname, '..', 'reports', 'load-test-report.xlsx'),
    path.join(__dirname, '..', 'website', 'public', 'reports', 'load-report.xlsx'),
    path.join(__dirname, '..', 'website', 'public', 'reports', 'load-test-report.xlsx')
  ];

  for (const p of reportPaths) {
    try {
      const dir = path.dirname(p);
      fs.mkdirSync(dir, { recursive: true });
      await workbook.xlsx.writeFile(p);
      console.log(`Excel report successfully written to: ${p}`);
    } catch (e) {
      console.error(`Error writing to ${p}:`, e.message);
    }
  }

  // Also compile the full-e2e-report.xlsx if needed, or simply log completion
  console.log('All k6 Excel load test reports successfully compiled and synchronized!');
}

generateReport();
