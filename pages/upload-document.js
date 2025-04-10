import fs from 'fs';
import path from 'path';

export class UploadPDF {
    constructor(page) {
        this.page = page;

        // **Locators**
        this.viewCaseDetailButton = page.locator('a.btn.outline[href^="/dashboard/claim/submit"]');
        this.claimDocuments = page.getByRole('button', { name: 'Instagram Claim Documents' });
        this.dragFilesArea = page.getByText('Drag your files here or click');
        this.uploadInput = page.locator('.uploadFile');
        this.progressBar = page.locator('.progress-bar-box');
        this.submitButton = page.getByRole('button', { name: 'Submit Information' });
        this.uploadStatus = page.locator('.status-tag.complete', { hasText: 'Uploaded' });
        this.diagnosingButton = page.getByRole('button', { name: 'Screenshot of Diagnosing' })
        this.treatmentButtom = page.getByRole('button', { name: 'Screenshot of Treatment' })
    }

    async viewCaseDetail() {
        await this.viewCaseDetailButton.waitFor({ state: 'visible' });
        await this.viewCaseDetailButton.click();
    }

    async clickDiagnosingButton() {
        await this.diagnosingButton.waitFor({ state: 'visible' });
        await this.diagnosingButton.click();
      }

    async clickTreatmentButton() {
        await this.treatmentButtom.waitFor({ state: 'visible' });
        await this.treatmentButtom.click();
      }

    async clickClaimDocumentButton(){
        await this.claimDocuments.waitFor({ state: 'visible' });
        await this.claimDocuments.click();
    }
    
    
    async uploadDocuments() {
        // **File Paths**
        const files = [
            path.resolve(process.cwd(), 'uploads', 'document.pdf'),
            path.resolve(process.cwd(), 'uploads', 'document.docx'),
            path.resolve(process.cwd(), 'uploads', 'image.png')
        ];

        // **Ensure files exist**
        files.forEach(file => {
            if (!fs.existsSync(file)) {
                throw new Error(`File not found: ${file}`);
            }
        });

        // **Click to open file selector**
        const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.dragFilesArea.click()
        ]);

        // **Upload Files**
        await fileChooser.setFiles(files);

        // **Verify Upload by Checking Progress Bar**
        await this.progressBar.first().waitFor({ state: 'visible' });

        // **Submit Uploaded Documents**
        await this.submitButton.waitFor({ state: 'visible' });
        await this.submitButton.click();

        // **More Robust Upload Status Check**
        await this.page.waitForSelector('.status-tag.complete', { timeout: 30000 });
        console.log("✅ Files uploaded successfully!");
    }
}