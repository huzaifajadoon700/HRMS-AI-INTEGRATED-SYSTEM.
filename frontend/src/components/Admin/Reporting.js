import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import "./simple-admin.css";

const ReportingAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);
  const [reportData, setReportData] = useState({
    totalBookings: 156,
    totalRevenue: 45780,
    totalUsers: 89,
    averageOrderValue: 520,
    monthlyGrowth: 12.5,
    popularItems: [
      { name: "Deluxe Room", bookings: 45, revenue: 22500 },
      { name: "Standard Room", bookings: 67, revenue: 16750 },
      { name: "Suite Room", bookings: 23, revenue: 18400 },
      { name: "Family Room", bookings: 21, revenue: 12600 }
    ],
    recentOrders: [
      { id: "ORD001", customer: "John Doe", amount: 750, date: "2024-01-15", status: "Completed" },
      { id: "ORD002", customer: "Jane Smith", amount: 450, date: "2024-01-14", status: "Pending" },
      { id: "ORD003", customer: "Mike Johnson", amount: 890, date: "2024-01-13", status: "Completed" },
      { id: "ORD004", customer: "Sarah Wilson", amount: 320, date: "2024-01-12", status: "Cancelled" }
    ]
  });

  // Export to PDF function
  const handleExportPDF = async () => {
    if (downloading) return;

    try {
      setDownloading(true);
      toast.info("Generating PDF report...");

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210 - 20; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add title page
      pdf.setFontSize(20);
      pdf.text('Business Analytics Report', 105, 30, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

      // Add the report content
      pdf.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);

      // Save the PDF
      pdf.save(`business-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Export to Excel function
  const handleExportExcel = () => {
    try {
      toast.info("Generating Excel report...");

      // Prepare data for Excel
      const summaryData = [
        ['Business Analytics Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        [''],
        ['SUMMARY STATISTICS'],
        ['Metric', 'Value'],
        ['Total Bookings', reportData.totalBookings],
        ['Total Revenue', `Rs. ${reportData.totalRevenue.toLocaleString()}`],
        ['Total Users', reportData.totalUsers],
        ['Average Order Value', `Rs. ${reportData.averageOrderValue}`],
        ['Monthly Growth', `${reportData.monthlyGrowth}%`],
        [''],
        ['POPULAR ITEMS'],
        ['Item Name', 'Bookings', 'Revenue'],
        ...reportData.popularItems.map(item => [
          item.name,
          item.bookings,
          `Rs. ${item.revenue.toLocaleString()}`
        ]),
        [''],
        ['RECENT ORDERS'],
        ['Order ID', 'Customer', 'Amount', 'Date', 'Status'],
        ...reportData.recentOrders.map(order => [
          order.id,
          order.customer,
          `Rs. ${order.amount}`,
          order.date,
          order.status
        ])
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(summaryData);

      // Style the header
      ws['A1'] = { v: 'Business Analytics Report', t: 's', s: { font: { bold: true, sz: 16 } } };

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Business Report');

      // Save the file
      XLSX.writeFile(wb, `business-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel report downloaded successfully!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Failed to generate Excel report. Please try again.');
    }
  };

  // Print function
  const handlePrint = () => {
    try {
      const printContent = reportRef.current;
      const printWindow = window.open('', '_blank');

      printWindow.document.write(`
        <html>
          <head>
            <title>Business Analytics Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .simple-table-container { border: 1px solid #e5e7eb; margin: 20px 0; padding: 20px; }
              .simple-table { width: 100%; border-collapse: collapse; }
              .simple-table th, .simple-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
              .simple-table th { background-color: #f9fafb; font-weight: bold; }
              .simple-status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
              .simple-status-completed { background-color: #d1fae5; color: #065f46; }
              .simple-status-pending { background-color: #fef3c7; color: #92400e; }
              .simple-status-cancelled { background-color: #fee2e2; color: #991b1b; }
              h1, h2, h3 { color: #000000; }
              p { color: #000000; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Business Analytics Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            ${printContent.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      toast.success('Print dialog opened!');
    } catch (error) {
      console.error('Error printing:', error);
      toast.error('Failed to open print dialog. Please try again.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [navigate]);

  if (loading) return <div className="simple-admin-container"><p>Loading...</p></div>;

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Business Analytics & Reports</h1>
        <p>Comprehensive overview of your business performance</p>
      </div>

      <div className="simple-admin-controls">
        <button
          className="simple-btn simple-btn-primary"
          onClick={handleExportPDF}
          disabled={downloading}
        >
          {downloading ? 'Generating PDF...' : 'Export PDF'}
        </button>
        <button
          className="simple-btn simple-btn-secondary"
          onClick={handleExportExcel}
          disabled={downloading}
        >
          Export Excel
        </button>
        <button
          className="simple-btn simple-btn-secondary"
          onClick={handlePrint}
          disabled={downloading}
        >
          Print Report
        </button>
      </div>

      {/* Report Content - This will be captured for PDF/Print */}
      <div ref={reportRef}>
        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="simple-table-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>{reportData.totalBookings}</h3>
          <p style={{ color: '#000000', margin: 0 }}>Total Bookings</p>
        </div>
        
        <div className="simple-table-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>Rs. {reportData.totalRevenue.toLocaleString()}</h3>
          <p style={{ color: '#000000', margin: 0 }}>Total Revenue</p>
        </div>
        
        <div className="simple-table-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>{reportData.totalUsers}</h3>
          <p style={{ color: '#000000', margin: 0 }}>Total Users</p>
        </div>
        
        <div className="simple-table-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>Rs. {reportData.averageOrderValue}</h3>
          <p style={{ color: '#000000', margin: 0 }}>Average Order Value</p>
        </div>
      </div>

      {/* Popular Items */}
      <div className="simple-table-container">
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#000000' }}>Popular Items Performance</h3>
        </div>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Bookings</th>
              <th className="hide-mobile">Revenue</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {reportData.popularItems.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.bookings}</td>
                <td className="hide-mobile">Rs. {item.revenue.toLocaleString()}</td>
                <td>
                  <span className="simple-status simple-status-available">
                    {item.bookings > 40 ? 'Excellent' : item.bookings > 25 ? 'Good' : 'Average'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Orders */}
      <div className="simple-table-container" style={{ marginTop: '30px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#000000' }}>Recent Orders</h3>
        </div>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th className="hide-mobile">Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.recentOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>Rs. {order.amount}</td>
                <td className="hide-mobile">{order.date}</td>
                <td>
                  <span className={`simple-status simple-status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Insights */}
      <div className="simple-table-container" style={{ marginTop: '30px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#000000' }}>Key Business Insights</h3>
        </div>
        <div style={{ padding: '20px' }}>
          <ul style={{ color: '#000000', lineHeight: '1.8' }}>
            <li><strong>Revenue Growth:</strong> Monthly growth rate of {reportData.monthlyGrowth}% indicates strong business performance</li>
            <li><strong>Popular Services:</strong> Deluxe and Standard rooms are the most booked items</li>
            <li><strong>Customer Base:</strong> {reportData.totalUsers} active users with average order value of Rs. {reportData.averageOrderValue}</li>
            <li><strong>Order Status:</strong> Most orders are completed successfully with minimal cancellations</li>
          </ul>
        </div>
      </div>
      </div> {/* End of reportRef */}
    </div>
  );
};

export default ReportingAnalytics;
