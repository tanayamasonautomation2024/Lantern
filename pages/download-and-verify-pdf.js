import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

export class DownloadAndVerifyPDF {
    constructor(page) {
        this.page = page;

        // **Locators**
        this.acceptButton = page.getByRole('button', { name: 'Accept All' });
        this.viewCaseDetailButton = page.locator('a.btn.outline[href^="/dashboard/claim/submit"]');
        this.releaseElement = page.locator('.text .case', { hasText: 'Release' });
        this.openCloseIcon = page.locator('span.open-close-icon');
        this.viewEsignAgreementButton = page.locator('button.btn.outline', { hasText: 'View E-sign Agreement' });
        this.defaultWorkflowButton = page.locator('.case', { hasText: 'Default workFlow' });
        this.automationCaseAgreement = page.locator('h4', { hasText: 'Automation Case Attorney Client Agreement' });

        // **Reference Document Locators**
        this.downloadDocumentSection = page.locator('.text .case', { hasText: 'Download Document' });
        this.downloadDocumentButton = page.locator('button.btn.outline', { hasText: 'Download Document' });

        // **Download Directories**
        this.releaseDocDir = path.join(process.cwd(), 'release-document');
        this.acaDocDir = path.join(process.cwd(), 'aca-document');
        this.referenceDocDir = path.join(process.cwd(), 'reference-document');
    }

    async acceptCookieButton() {
        try {
            await this.acceptButton.waitFor({ state: 'visible', timeout: 5000 });
            if (await this.acceptButton.isVisible()) {
                await this.acceptButton.click();
            }
        } catch (error) {
            console.log('Consent popup not found, continuing...');
        }
    }

    async downloadSignedReleaseAgreement() {
        if (!fs.existsSync(this.releaseDocDir)) {
            fs.mkdirSync(this.releaseDocDir, { recursive: true });
        }

        await this.releaseElement.click();
        await this.openCloseIcon.click();

        console.log(`Waiting for Signed Release Agreement download event...`);
        const downloadPromise = this.page.waitForEvent('download');

        await this.viewEsignAgreementButton.waitFor({ state: 'visible' });
        await this.viewEsignAgreementButton.click();
        console.log(`Clicked View E-sign Agreement.`);

        const download = await downloadPromise;
        const releasePath = path.join(this.releaseDocDir, 'signed_release_agreement.pdf');
        await download.saveAs(releasePath);
        console.log(`✅ Signed Release Agreement downloaded: ${releasePath}`);

        return releasePath;
    }

    async downloadACAgreement() {
        if (!fs.existsSync(this.acaDocDir)) {
            fs.mkdirSync(this.acaDocDir, { recursive: true });
        }

        await this.defaultWorkflowButton.waitFor({ state: 'visible' });
        await this.defaultWorkflowButton.click();
        await this.automationCaseAgreement.waitFor({ state: 'visible' });
        await this.automationCaseAgreement.click();

        console.log(`Waiting for ACA Agreement download event...`);
        const downloadPromise = this.page.waitForEvent('download');

        await this.viewEsignAgreementButton.waitFor({ state: 'visible' });
        await this.viewEsignAgreementButton.click();
        console.log(`Clicked View E-sign Agreement.`);

        const download = await downloadPromise;
        const acaPath = path.join(this.acaDocDir, 'aca_agreement.pdf');
        await download.saveAs(acaPath);
        console.log(`✅ ACA Agreement downloaded: ${acaPath}`);

        return acaPath;
    }

    async downloadACAgreementFromReminderLink() {
        if (!fs.existsSync(this.acaDocDir)) {
            fs.mkdirSync(this.acaDocDir, { recursive: true });
        }

        // await this.defaultWorkflowButton.waitFor({ state: 'visible' });
        // await this.defaultWorkflowButton.click();
        await this.automationCaseAgreement.waitFor({ state: 'visible' });
        await this.automationCaseAgreement.click();

        console.log(`Waiting for ACA Agreement download event...`);
        const downloadPromise = this.page.waitForEvent('download');

        await this.viewEsignAgreementButton.waitFor({ state: 'visible' });
        await this.viewEsignAgreementButton.click();
        console.log(`Clicked View E-sign Agreement.`);

        const download = await downloadPromise;
        const acaPath = path.join(this.acaDocDir, 'aca_agreement.pdf');
        await download.saveAs(acaPath);
        console.log(`✅ ACA Agreement downloaded: ${acaPath}`);

        return acaPath;
    }

    async downloadReferenceDocument() {
        if (!fs.existsSync(this.referenceDocDir)) {
            fs.mkdirSync(this.referenceDocDir, { recursive: true });
        }
    
        await this.downloadDocumentSection.click();
    
        console.log(`Waiting for Reference Document download event...`);
        const downloadPromise = this.page.waitForEvent('download');
    
        await this.downloadDocumentButton.waitFor({ state: 'visible' });
        await this.downloadDocumentButton.click();
        console.log(`Clicked Download Document.`);
    
        const download = await downloadPromise;
    
        // Get the actual downloaded filename
        const actualFilename = download.suggestedFilename();
        console.log(`📂 Actual downloaded filename: ${actualFilename}`);
    
        // **Check if the downloaded file matches the expected name**
        const expectedFilename = `Automation Case_7251390_Reference Document.pdf`;
        if (actualFilename !== expectedFilename) {
            throw new Error(`❌ Filename mismatch! Expected: ${expectedFilename}, but got: ${actualFilename}`);
        }
        console.log(`✅ Filename matches the expected value.`);
    
        // Save the file in the reference-document folder
        await download.saveAs(path.join(this.referenceDocDir, actualFilename));
        console.log(`✅ Reference Document downloaded successfully.`);
    }
    
    async verifyPDF(pdfPath) {
        try {
            if (!pdfPath) {
                throw new Error('PDF path is undefined or missing.');
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
            console.log(`Full Name Count: ${fullNameMatches}`);
            console.log(`Email (Exact - Email:testEmail) Count: ${emailExactMatches}`);
            console.log(`Email (Loose - testEmail appearing) Count: ${emailLooseMatches}`);
            console.log(`Date Count: ${dateCount}`);

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
            } else if (pdfPath.includes('reference_document.pdf')) {
                console.log('🔹 Validating Reference Document...');
                if (fullNameMatches >= 5 && dateCount >= 1 && emailLooseMatches >= 1) {
                    console.log('✅ Reference Document validation passed.');
                    return true;
                }
            }

            console.error(`❌ Validation failed for: ${pdfPath}`);
            throw new Error(`${pdfPath} content does not match expected values.`);
        } catch (error) {
            console.error('Error while verifying PDF:', error);
            throw error;
        }
    }

    async verifyPDFReminderLink(pdfPath,email) {
        try {
            if (!pdfPath) {
                throw new Error('PDF path is undefined or missing.');
            }

            const pdfBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(pdfBuffer);
            const pdfText = data.text;

            const testData = JSON.parse(fs.readFileSync(path.join(__dirname, '../test_data/login.json')));
            const fullName = `${testData.fname} ${testData.lname}`;
           // const email = fs.readFileSync('test-email.txt', 'utf-8').trim();

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
            console.log(`Full Name Count: ${fullNameMatches}`);
            console.log(`Email (Exact - Email:testEmail) Count: ${emailExactMatches}`);
            console.log(`Email (Loose - testEmail appearing) Count: ${emailLooseMatches}`);
            console.log(`Date Count: ${dateCount}`);

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
            } else if (pdfPath.includes('reference_document.pdf')) {
                console.log('🔹 Validating Reference Document...');
                if (fullNameMatches >= 5 && dateCount >= 1 && emailLooseMatches >= 1) {
                    console.log('✅ Reference Document validation passed.');
                    return true;
                }
            }

            console.error(`❌ Validation failed for: ${pdfPath}`);
            throw new Error(`${pdfPath} content does not match expected values.`);
        } catch (error) {
            console.error('Error while verifying PDF:', error);
            throw error;
        }
    }
}