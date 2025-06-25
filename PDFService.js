const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs').promises;
const dayjs = require('dayjs');

class PDFService {
  static async generateProposalPDF(proposal, templatePath = 'views/proposal-view.ejs') {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
      // Read the EJS template file
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      // Render the EJS template with data
      const html = ejs.render(templateContent, {
        proposal,
        dayjs // Make dayjs available in template
      });

      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { 
          top: '20px',    
          bottom: '20px', 
          left: '20px', 
          right: '20px' 
        }
      });

      await browser.close();
      return pdf;
      
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  static generateFilename(businessName) {
    return `${businessName.replace(/[^a-zA-Z0-9]/g, '-')}-proposal-${dayjs().format('YYYY-MM-DD')}.pdf`;
  }
}

module.exports = PDFService;