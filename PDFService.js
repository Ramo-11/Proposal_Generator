const puppeteer = require('puppeteer');
const dayjs = require('dayjs');

class PDFService {
  static async generateProposalPDF(proposal) {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Create enhanced HTML content with fancy styling
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${proposal.business_name} Proposal - Sahab Solutions</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', Arial, sans-serif; 
          line-height: 1.6;
          color: #1a1a1a;
          background: white;
          margin: 0;
          padding: 0;
        }
        
        /* Main content container */
        .container {
          padding: 20px 40px; /* Added more top/bottom padding for spacing from headers/footers */
        }
        
        .page-title {
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: #571ac4;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .section { 
          margin-bottom: 35px;
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #f1f5f9;
          page-break-inside: avoid;
        }
        
        .section-title { 
          font-size: 20px; 
          font-weight: 600; 
          color: #1e293b;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .section-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #571ac4, #7c3aed);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }
        
        .info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 25px;
        }
        
        .info-item { 
          background: #f8fafc;
          padding: 15px;
          border-radius: 10px;
          border-left: 4px solid #571ac4;
        }
        
        .info-label { 
          font-weight: 600; 
          color: #475569;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .info-value { 
          color: #1e293b;
          font-size: 16px;
          font-weight: 500;
        }
        
        .features-container {
          background: linear-gradient(135deg, #571ac4 0%, #7c3aed 100%);
          padding: 30px;
          border-radius: 16px;
          color: white;
          position: relative;
          overflow: hidden;
          page-break-inside: avoid;
          margin-top: 50px;
        }
        
        .features-container::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .features-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .features-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
        }
        
        .feature-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px 20px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 16px;
          line-height: 1.5;
        }
        
        .what-you-get {
          background: linear-gradient(135deg, #571ac4 0%, #7c3aed 100%);
          padding: 30px;
          border-radius: 16px;
          color: white;
          margin-top: 30px;
          page-break-inside: avoid;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
        }
        
        .benefit-item {
          background: rgba(255, 255, 255, 0.15);
          padding: 15px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          backdrop-filter: blur(10px);
        }
        
        .benefit-icon {
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }
        
        /* Force page breaks for demonstration */
        .page-break {
          page-break-before: always;
        }
        
        /* Additional content section for demonstration */
        .additional-section {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 2px solid #e2e8f0;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .print-header, .print-footer { display: flex !important; }
        }
      </style>
    </head>
    <body>
      <!-- Main Content -->
      <div class="container">
        <div class="page-title">${proposal.business_name} Project Proposal</div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">
              <div class="section-icon">👤</div>
              Client Information
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Business Name</div>
                <div class="info-value">${proposal.business_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Contact Person</div>
                <div class="info-value">${proposal.contact_person || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-value">${proposal.contact_email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${proposal.contact_phone || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">
              <div class="section-icon">📋</div>
              Project Details
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Project Type</div>
                <div class="info-value">${proposal.project_type}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Timeline</div>
                <div class="info-value">${proposal.timeline || 'To be discussed'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Budget</div>
                <div class="info-value">${proposal.budget ? '$' + parseFloat(proposal.budget).toLocaleString() : 'To be discussed'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Proposal Date</div>
                <div class="info-value">${dayjs(proposal.created_at).format('MMMM DD, YYYY')}</div>
              </div>
            </div>
          </div>
          
          ${proposal.features ? `
          <div class="features-container">
            <div class="features-title">
              Project Features
            </div>
            <div class="features-content">
              ${proposal.features.split('\n').filter(feature => feature.trim()).map(feature => 
                `<div class="feature-item">${feature.trim()}</div>`
              ).join('')}
            </div>
          </div>
          ` : ''}
          
          <!-- Force a page break for demonstration -->
          <div class="page-break"></div>
          
          <div class="additional-section">
            <div class="what-you-get">
              <div class="features-title">
                What You Will Get
              </div>
              <div class="benefits-grid">
                <div class="benefit-item">
                  <div class="benefit-icon">✓</div>
                  <span>Professional Development</span>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">✓</div>
                  <span>24/7 Technical Support</span>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">✓</div>
                  <span>Modern Design & UI/UX</span>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">✓</div>
                  <span>Mobile Responsive</span>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">✓</div>
                  <span>SEO Optimized</span>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">✓</div>
                  <span>Security Features</span>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">✓</div>
                  <span>Performance Optimization</span>
                </div>
                <div class="benefit-item">
                  <div class="benefit-icon">✓</div>
                  <span>Documentation & Training</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">
                <div class="section-icon">🎯</div>
                Project Scope & Deliverables
              </div>
              <div class="info-item">
                <div class="info-label">Deliverables</div>
                <div class="info-value">
                  Complete project delivery including source code, documentation, testing, deployment, and post-launch support. All deliverables will be provided according to the agreed timeline and specifications.
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">
                <div class="section-icon">📞</div>
                Next Steps
              </div>
              <div class="info-item">
                <div class="info-label">Contact Information</div>
                <div class="info-value">
                  Please review this proposal and contact us to discuss the project details, timeline, and any questions you may have. We look forward to working with you on this exciting project.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { 
        top: '120px',    // Increased space for header + padding
        bottom: '100px', // Increased space for footer + padding
        left: '20px', 
        right: '20px' 
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; font-family: 'Inter', Arial, sans-serif; font-size: 14px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); height: 80px; border-bottom: 3px solid #571ac4; margin-bottom: 40px;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #571ac4, #7c3aed); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 16px; box-shadow: 0 4px 12px rgba(87, 26, 196, 0.3);">SS</div>
            <div style="color: #571ac4; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">SAHAB SOLUTIONS</div>
          </div>
          <div style="color: #64748b; font-weight: 500;">${proposal.business_name} Proposal</div>
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 15px 40px; font-family: 'Inter', Arial, sans-serif; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; height: 60px; border-top: 2px solid rgba(255, 255, 255, 0.1); margin-top: 40px;">
          <div style="font-size: 12px; opacity: 0.8;">
            <div>Sahab Solutions - Technology Solutions</div>
            <div>Generated on ${dayjs().format('MMMM DD, YYYY')}</div>
          </div>
          <div style="font-size: 14px; font-weight: 600;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        </div>
      `
    });

    await browser.close();
    return pdf;
  }

  static generateFilename(businessName) {
    return `${businessName.replace(/[^a-zA-Z0-9]/g, '-')}-proposal-${dayjs().format('YYYY-MM-DD')}.pdf`;
  }
}

module.exports = PDFService;