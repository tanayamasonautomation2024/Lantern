const fs = require('fs');
export class AdditionalHarmPage {
  constructor(page) {
    this.page = page;

    // Page 1 Locators
    this.harmForm1Button = page.getByRole('button', { name: 'Instagram Additional Harm Form 1 1 required' });
    this.harmForm2Button = page.locator('.text').filter({ hasText: 'Instagram Additional Harm Form 2' });
    this.additionalDamagesButton = page.locator('.text').filter({ hasText: 'Additional Damages Form' });
    this.nextButtonAfterSubmit = page.getByRole('button', { name: 'Next' });
    this.submitButton = page.getByRole('button', { name: 'Submit button. Click to submit the form' });

    // Page 2 Locators
    this.depressionStartMonth = page.locator('[ref="month"]').nth(0);
    this.depressionStartYear = page.locator('[ref="year"]').nth(0);

    this.formData = JSON.parse(fs.readFileSync('test_data/additional_form.json', 'utf8'));

    // Locators
    this.accessInstagramDropdown = page.locator('.form-control').first();
    this.instagramFeaturesDropdown = page.locator('.form-control').nth(0);
    this.nextButton = page.getByRole('button', { name: 'Next button. Click to go to' });
    this.submitButton = page.getByRole('button', { name: 'Submit button. Click to' });
}

getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

getRandomElements(arr, count) {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async fillBasicClaimDetailForm() {
    // **Select Instagram Access Method**
    const selectedAccess = this.getRandomElement(this.formData.access_instagram);
  //  await this.accessInstagramDropdown.waitFor({state:'visible'});
    //await this.accessInstagramDropdown.click();
    await this.page.getByRole('option', { name: selectedAccess }).click();

   // await this.fillTextBox(this.formData.otherDeviceTextbox, this.formData.otherDevice_name);

    // **Select Random Radio Options**
    await this.page.locator('label').filter({ hasText: this.getRandomElement(this.formData.radioOptions.usageFrequency) }).click();
    await this.page.locator('label').filter({ hasText: this.getRandomElement(this.formData.radioOptions.timeSpent) }).click();
    await this.clickNextButton();

    // Page 2
    await this.page.locator('label').filter({ hasText: this.getRandomElement(this.formData.radioOptions.usageFrequency) }).click();
    await this.page.locator('label').filter({ hasText: this.getRandomElement(this.formData.radioOptions.timeSpent) }).click();
    
    // **Select Instagram Features**
    const selectedFeature = this.getRandomElement(this.formData.instagram_features);
    //await this.instagramFeaturesDropdown.click();
    await this.page.getByRole('option', { name: selectedFeature }).first().click();

    // **Select Random Checkbox Options**
    const selectedCheckboxes = this.getRandomElements(this.formData.checkboxOptions, 2);
    for (const option of selectedCheckboxes) {
        await this.page.locator('label').filter({ hasText: option }).click();
    }

    // **Select "Yes" from Yes/No Question**
    await this.page.locator('label').filter({ hasText: this.formData.select_yes }).click();
    await this.fillTextBox(this.formData.negativeTextbox, this.formData.negative_name);
    await this.clickNextButton();

    // Page 3
    // **Select 2 Random Social Media Platforms**
    const selectedPlatforms = this.getRandomElements(this.formData.other_social_media_platforms, 3);
    for (const platform of selectedPlatforms) {
        await this.page.getByRole('option', { name: platform }).click();
    }

    // **Select "Yes" for Facebook Link Question**
    await this.page.locator('label').filter({ hasText: this.formData.select_yes }).click();
    await this.fillTextBox(this.formData.facebookTextbox, this.formData.facebook_username);
    await this.clickSubmitButton();
    await this.page.waitForTimeout(2000);
}

  async form1Page1(harm_options) {
   // await this.harmForm1Button.click();
    await this.page.waitForTimeout(20000);
    for (const option of harm_options) {
      await this.page.getByRole('option', { name: option }).click();
    }
  }

  async fillDate(start_month, start_year) {
    await this.depressionStartMonth.fill(start_month);
    await this.depressionStartYear.fill(start_year);
  }

  async fillYesNoQuestions(selectYes) {
      const yesNoQuestions = [
          'Were you ever diagnosed with',
          'Did you seek treatment for',
          'Was the physician or facility',
          'Have you ever been prescribed',
          'Have you ever been hospitalized or been admitted',
          'Have you ever diagnosed with'
      ];
   
      for (const question of yesNoQuestions) {
        try {
          const questionLocator = this.page.getByLabel(question).locator('label').filter({ hasText: selectYes });
           
            await this.slowlyScrollToElement(questionLocator);
            await questionLocator.click();
            await this.page.waitForTimeout(2000);
            //console.log(`✅ Selected "${selectYes}" for: "${question}"`);
          } catch (error) {
              console.log(`⚠️ Skipping: "${question}" not found or not clickable.`);
          }
      }
    }
   
    async slowlyScrollToElement(locator) {
      const scrollStep = 300;
      const timeout = 5000;
      const checkInterval = 1000;
      const startTime = Date.now();
   
      while (Date.now() - startTime < timeout) {
          await this.page.evaluate((scrollStep) => window.scrollBy(0, scrollStep), scrollStep);
          await this.page.waitForTimeout(checkInterval);
   
          if (await locator.isVisible()) {
              return;
          }
      }
      throw new Error("⏳ Timed out waiting for the element to become visible.");
    }
   
    async fillTextBox(locator, value) {
      try {
        const textBoxLocator = this.page.getByLabel(locator).nth(0);
        await textBoxLocator.type(value);
       // console.log(`✅ Filled textbox: "${locator}"`);
      } catch (error) {
          console.log(`⚠️ Could not fill textbox: "${locator}"`);
      }
    }


  async fillAddress(details) {
    // Select all AddressLine 1, City, State, and Zip fields
    const autoCompleteFields = await this.page.locator('input[name^="data[Address"]').all();
    const streetFields = await this.page.locator('div.form-group.formio-component-textfield:has(label:has-text("AddressLine 1")) input').all();
    const cityFields = await this.page.locator('input[name^="data[City"]').all();
    const stateFields = await this.page.locator('select[name^="data[State"]').all(); // Corrected state locator
    const zipFields = await this.page.locator('input[name^="data[ZipCode"]').all();
 
    // Use the minimum count to prevent out-of-bounds errors
    const minCount = Math.min(streetFields.length, cityFields.length, stateFields.length, zipFields.length);
 
    for (let i = 0; i < minCount; i++) {
      await autoCompleteFields[i].type(details.auto_address)
      await this.page.getByText(details.autosuggestadd).click();
      await this.page.waitForTimeout(3000);
      await streetFields[i].fill("");
      await streetFields[i].type(details.addressline1);
      await cityFields[i].fill("");
      await cityFields[i].type(details.city);
      // Click the dropdown to make options visible
      await stateFields[i].locator('..').click();
      // Select the state from the visible dropdown list
      await this.page.getByRole('option', { name: details.state }).click();
      await this.page.waitForTimeout(2000);
      await zipFields[i].type(details.zip);
      await this.page.waitForTimeout(2000);
    }
  }  

  async clickNextButton() {
    await this.nextButton.click();
  }

  async clickNextAfterSubmit(){
    await this.nextButtonAfterSubmit.click();
  }

  async page9(selectYes) {
    const specificQuestions = [
        'Did you seek treatment for',
        'Was the physician or facility',
        'Have you ever been prescribed'
    ];

    for (const question of specificQuestions) {
          const questionLocator = this.page.getByLabel(question).locator('label').filter({ hasText: selectYes });
          await this.slowlyScrollToElement(questionLocator);
          await questionLocator.click();

        }
}

  async clickSubmitButton() {
    await this.submitButton.click();
    await this.page.waitForTimeout(20000);
  }

  async form2Page1(harm_options) {
    //await this.harmForm2Button.click();
    await this.page.waitForTimeout(20000);
    for (const option of harm_options) {
      await this.page.getByRole('option', { name: option }).click();
    }
  }

  async addtionalForm2yesorno(selectYes){
      const reportQuestions = [
          'Did you report this to Instagram?',
          'Did you seek assistance from law enforcement, or an educational or government authority?'
      ];
  
      for (const question of reportQuestions) {
          try {
              const questionLocator = this.page.getByLabel(question).locator('label').filter({ hasText: selectYes });
              await this.slowlyScrollToElement(questionLocator);
              await questionLocator.click();
          } catch (error) {
              console.log(`⚠️ Skipping: "${question}" not found or not clickable.`);
          }
      }
  }

  async addtionalDamageForrmyesorno(selectYes){
    const reportQuestions = [
        'Did you lose any wages or earning capacity as a result of your Instagram use?',
        'From age fourteen (14) through today, has any health care provider told you that you',
        'From age fourteen (14) to today, have you quit or taken a medical leave of absence',
        'Do you claim medical expenses (including for mental health, psychiatric, psychological',
        'Was your education disrupted (e.g., disciplinary issues, impact on grades'
    ];

    for (const question of reportQuestions) {
        try {
            const questionLocator = this.page.getByLabel(question).locator('label').filter({ hasText: selectYes });
            await this.slowlyScrollToElement(questionLocator);
            await questionLocator.click();
        } catch (error) {
            console.log(`⚠️ Skipping: "${question}" not found or not clickable.`);
        }
    }
  }

  async fillAdditionalDamagesForm() {
    const additional_details = JSON.parse(fs.readFileSync('test_data/additional_form.json', 'utf8'));

   // await this.additionalDamagesButton.click();
    // Page4
    await this.fillTextBox(additional_details.insuranceCompanyTextbox, additional_details.insuranceCompany_name);
    await this.fillTextBox(additional_details.PolicyNumberTextbox, additional_details.Policy_Number);
    await this.fillTextBox(additional_details.Policyname_textbox, additional_details.Policy_name);
    await this.fillTextBox(additional_details.coverageTextbox, additional_details.coverage_days);
    await this.clickNextButton();

    // Page1,2
    await this.addtionalDamageForrmyesorno(additional_details.select_yes);
    await this.page.waitForTimeout(2000);
    //await this.fillTextBox(additional_details.YearTextbox, additional_details.Year_ans);
    await this.page.locator('input#day-year').first().fill(additional_details.Year_ans);
    await this.page.waitForTimeout(2000);
    console.log(`Year filled`);
    await this.fillTextBox(additional_details.IncomeTextbox, additional_details.Income);
    await this.clickNextButton();
    await this.fillTextBox(additional_details.YearTextbox, additional_details.Year_ans);
    await this.fillTextBox(additional_details.IncomeTextbox, additional_details.Income);
    await this.clickNextButton();

    // Page3
    await this.addtionalDamageForrmyesorno(additional_details.select_yes);
    await this.fillTextBox(additional_details.healthcareTextbox, additional_details.healthcare_name);
    await this.fillTextBox(additional_details.employerTextbox, additional_details.employer_name);  
    await this.fillTextBox(additional_details.amountTextbox, additional_details.amount);
    await this.fillTextBox(additional_details.schoolTextbox, additional_details.school_name);
  }
}