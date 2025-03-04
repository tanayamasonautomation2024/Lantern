import fs from 'fs';
import path from 'path';

export class UploadPDF {
    constructor(page) {
        this.page = page;

        // **Locators**
        this.viewCaseDetailButton = page.locator('a.btn.outline[href^="/dashboard/claim/submit"]');
        this.companyNameInput = page.locator('input[name="data[whatIsYourCompanyName]"]');
        this.supportDocumentButton = page.getByRole('button', { name: 'Support Document 1 required' });
        this.dragFilesArea = page.getByText('Drag your files here or click');
        this.uploadInput = page.locator('.uploadFile');
        this.progressBar = page.locator('.progress-bar-box');
        this.submitButton = page.getByRole('button', { name: 'Submit Information' });
        this.uploadStatus = page.locator('.status-tag.complete', { hasText: 'Uploaded' });
        this.nextButton = page.locator('button.next-workflow');
    }

    async viewCaseDetail() {
        await this.viewCaseDetailButton.waitFor({ state: 'visible' });
        await this.viewCaseDetailButton.click();
    }

    async fillCompanyName(companyName) {
        await this.companyNameInput.waitFor({ state: 'visible' });
        await this.companyNameInput.fill(companyName);
    }

    async clickNextButton() {
    
        // Wait for the "Next" button to be visible and enabled
        await (this.nextButton).waitFor({ state: 'visible' });
    
        // Optionally, you can check if the button is enabled
        await expect(this.nextButton).not.toBeDisabled();
    
        // Click the "Next" button
        await this.nextButton.click();
      }

    async clicksupportDocumentButton(){
        await this.supportDocumentButton.waitFor({ state: 'visible' });
        await this.supportDocumentButton.click();
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
        const statusText = await this.uploadStatus.innerText();
        if (statusText.trim() !== "Uploaded") {
            throw new Error("❌ Upload status not detected properly.");
        }

        console.log("✅ Files uploaded successfully!");
    }
}