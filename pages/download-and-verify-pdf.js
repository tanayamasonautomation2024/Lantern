import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

export class DownloadAndVerifyPDF {
    constructor(page) {
        this.page = page;

        // **Locators for completeSignReleaseProcess**
        this.acceptButton = page.getByRole('button', { name: 'Accept All' });
        this.viewCaseDetailButton = page.locator('a.btn.outline[href^="/dashboard/claim/submit"]');
        this.releaseElement = page.locator('.text .case', { hasText: 'Release' });
        this.openCloseIcon = page.locator('span.open-close-icon');
        this.viewEsignAgreementButton = page.locator('button.btn.outline', { hasText: 'View E-sign Agreement' });
        this.defaultWorkflowButton = page.locator('.case', { hasText: 'Default workFlow' }),
        this.automationCaseAgreement = page.locator('h4', { hasText: 'Automation Case Attorney Client Agreement' }),
        // **PDF Download Directory**
        this.downloadsDir = path.join(process.cwd(), 'downloads');
    }

    async downloadEsignedAgreements() {
        await this.page.waitForLoadState('networkidle');
    
        try {
            await this.acceptButton.waitFor({ state: 'visible', timeout: 5000 });
            if (await this.acceptButton.isVisible()) {
                await this.acceptButton.click();
            }
        } catch (error) {
            console.log('Consent popup not found, continuing...');
        }
    
        await this.viewCaseDetailButton.waitFor({ state: 'visible' });
        await this.viewCaseDetailButton.click();
        await this.releaseElement.click();
        await this.openCloseIcon.click();
    
        if (!fs.existsSync(this.downloadsDir)) {
            fs.mkdirSync(this.downloadsDir, { recursive: true });
        }
    
        // **Download Signed Release Agreement**
        let downloadPromise = this.page.waitForEvent('download');
    
        await this.viewEsignAgreementButton.click();
        console.log(`Clicked View E-sign Agreement.`);
    
        let download = await downloadPromise;
        const releasePath = path.join(this.downloadsDir, 'signed_release_agreement.pdf');
        await download.saveAs(releasePath);
        console.log(`Signed Release Agreement downloaded: ${releasePath}`);
    
        // **Download ACA Agreement**
        await this.defaultWorkflowButton.click();
        await this.automationCaseAgreement.click();
    
        downloadPromise = this.page.waitForEvent('download');
        await this.viewEsignAgreementButton.click();
        download = await downloadPromise;
        const acaPath = path.join(this.downloadsDir, 'aca_agreement.pdf');
        await download.saveAs(acaPath);
        console.log(`ACA Agreement downloaded: ${acaPath}`);
    
        return { releasePath, acaPath };
    }        

    async verifyPDF(pdfPath, pdfName, testEmail) {
        try {
            console.log(`Verifying ${pdfName}: ${pdfPath}`);
    
            if (!fs.existsSync(pdfPath)) {
                console.error(`${pdfName} file does not exist: ${pdfPath}`);
                throw new Error(`${pdfName} not found.`);
            }
    
            const pdfBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(pdfBuffer);
            const pdfText = data.text;
    
            const testData = JSON.parse(fs.readFileSync(path.join(__dirname, '../test_data/login.json')));
            const fullName = `${testData.fname} ${testData.lname}`;
    
            console.log(`Checking Full Name: ${fullName}`);
            console.log(`Checking Email: ${testEmail}`);
    
            // Count occurrences of Full Name
            const fullNameMatches = (pdfText.match(new RegExp(fullName, 'g')) || []).length;
    
            // Count occurrences of "Email:(testEmail)" in exact format
            const formattedEmailMatches = (pdfText.match(new RegExp(`Email:\\s*${testEmail}`, 'g')) || []).length;
    
            // Count occurrences of testEmail appearing anywhere
            const emailMatches = (pdfText.match(new RegExp(testEmail, 'g')) || []).length;
    
            // Count occurrences of different date formats (not unique)
            const today = new Date();
            const dateFormats = [
                today.toLocaleDateString('en-US'), // MM/DD/YYYY
                today.toISOString().split('T')[0], // YYYY-MM-DD
            ];
            let dateCount = 0;
    
            dateFormats.forEach(format => {
                const matches = pdfText.match(new RegExp(format, 'g')) || [];
                dateCount += matches.length;
            });
    
            console.log(`${pdfName} - Full Name Count: ${fullNameMatches}`);
            console.log(`${pdfName} - Formatted Email Count (Email: testEmail): ${formattedEmailMatches}`);
            console.log(`${pdfName} - Email Occurrences: ${emailMatches}`);
            console.log(`${pdfName} - Total Date Count: ${dateCount}`);
    
            if (pdfName === 'Signed Release Agreement') {
                if (fullNameMatches === 10 && dateCount > 2 && formattedEmailMatches === 1) {
                    console.log(`${pdfName} validation passed.`);
                    return true;
                }
            } else if (pdfName === 'ACA Agreement') {
                if (fullNameMatches === 14 && dateCount > 3 && formattedEmailMatches === 1 && emailMatches > 1) {
                    console.log(`${pdfName} validation passed.`);
                    return true;
                }
            }
    
            console.error(`${pdfName} validation failed.`);
            throw new Error(`${pdfName} content does not match expected values.`);
    
        } catch (error) {
            console.error('Error while verifying PDFs:', error);
            throw error;
        }
    }     
}