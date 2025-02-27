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

    async downloadSignedReleaseAgreement() {
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
    
        console.log(`📥 Waiting for Signed Release Agreement download event...`);
        const downloadPromise = this.page.waitForEvent('download');
    
        await this.viewEsignAgreementButton.waitFor({ state: 'visible' });
        await this.viewEsignAgreementButton.click();
        console.log(`📥 Clicked View E-sign Agreement.`);
    
        const download = await downloadPromise;
        const releasePath = path.join(this.downloadsDir, 'signed_release_agreement.pdf');
        await download.saveAs(releasePath);
        console.log(`✅ Signed Release Agreement downloaded: ${releasePath}`);
    
        return releasePath;
    }
    
    async downloadACAgreement() {
        if (!fs.existsSync(this.downloadsDir)) {
            fs.mkdirSync(this.downloadsDir, { recursive: true });
        }
    
        // **Navigate to ACA Agreement**
        await this.defaultWorkflowButton.waitFor({ state: 'visible' });
        await this.defaultWorkflowButton.click();
        await this.automationCaseAgreement.waitFor({ state: 'visible' });
        await this.automationCaseAgreement.click();
    
        console.log(`📥 Waiting for ACA Agreement download event...`);
        const downloadPromise = this.page.waitForEvent('download');
    
        await this.viewEsignAgreementButton.waitFor({ state: 'visible' });
        await this.viewEsignAgreementButton.click();
        console.log(`📥 Clicked View E-sign Agreement.`);
    
        const download = await downloadPromise;
        const acaPath = path.join(this.downloadsDir, 'aca_agreement.pdf');
        await download.saveAs(acaPath);
        console.log(`✅ ACA Agreement downloaded: ${acaPath}`);
    
        return acaPath;
    }    
    
    async verifyPDF(pdfPath) {
        try {
            if (!pdfPath) {
                throw new Error('⚠️ PDF path is undefined or missing.');
            }
    
            const pdfBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(pdfBuffer);
            const pdfText = data.text;
    
            const testData = JSON.parse(fs.readFileSync(path.join(__dirname, '../test_data/login.json')));
            const fullName = `${testData.fname} ${testData.lname}`;
            const email = fs.readFileSync('test-email.txt', 'utf-8').trim();
    
            const today = new Date();
            const dateFormats = [
                today.toLocaleDateString('en-US'), // MM/DD/YYYY
                today.toISOString().split('T')[0], // YYYY-MM-DD
            ];
            const dateCount = dateFormats.reduce((count, date) => count + (pdfText.match(new RegExp(date, 'g')) || []).length, 0);
    
            const fullNameMatches = (pdfText.match(new RegExp(fullName, 'g')) || []).length;
            const emailExactMatches = (pdfText.match(new RegExp(`Email:${email}`, 'g')) || []).length;
            const emailLooseMatches = (pdfText.match(new RegExp(email, 'g')) || []).length;
    
            console.log(`🔍 Checking PDF: ${pdfPath}`);
            console.log(`✅ Full Name Count: ${fullNameMatches}`);
            console.log(`✅ Email (Exact - Email:testEmail) Count: ${emailExactMatches}`);
            console.log(`✅ Email (Loose - testEmail appearing) Count: ${emailLooseMatches}`);
            console.log(`✅ Date Count: ${dateCount}`);
    
            if (pdfPath.includes('signed_release_agreement.pdf')) {
                console.log('🔹 Validating Signed Release Agreement...');
                if (fullNameMatches === 10 && dateCount > 2 && emailExactMatches === 1) {
                    console.log('✅ Signed Release Agreement validation passed.');
                    return true;
                }
            } else if (pdfPath.includes('aca_agreement.pdf')) {
                console.log('🔹 Validating ACA Agreement...');
                if (fullNameMatches === 14 && dateCount > 3 && emailExactMatches === 1 && emailLooseMatches > 1) {
                    console.log('✅ ACA Agreement validation passed.');
                    return true;
                }
            }
    
            console.error(`❌ Validation failed for: ${pdfPath}`);
            throw new Error(`${pdfPath} content does not match expected values.`);
        } catch (error) {
            console.error('⚠️ Error while verifying PDF:', error);
            throw error;
        }
    }    
}