import { expect } from '@playwright/test';
import testData from '../test_data/login.json';
import accountData from '../test_data/my_account.json';
import config from '../test_data/db_details.json'; // Import config directly (no need to read via fs)

const sql = require('mssql');

// Class to connect to DB and fetch the claimantToken
export class ConnectToDBPage {
  constructor(page) {
    this.page = page;
  }

  // Async method to connect to DB and fetch claimantToken
  async connectToDB(email) {
    try {
      // Connect to the database using the loaded configuration
      await sql.connect(config);
      console.log(email);

      // Query to fetch claimantToken from db_CASE.ClaimantToken where the CaseClaimantID matches
      const result = await sql.query`
        SELECT ClaimantToken 
        FROM db_CASE.ClaimantToken 
        WHERE CaseClaimantID in (select CaseClaimantID from db_CASE.CaseClaimant where UserID in(
select UserID  from db_CASE.UserEmailAddress where EmailAddress =${email}))
      `;

      // Check if data was returned
      if (result.recordset.length > 0) {
        // Assuming you want the first record's claimantToken
        const claimantToken = result.recordset[0].ClaimantToken;
        console.log('Claimant Token:', claimantToken);
        return claimantToken;
      } else {
        console.log('No records found.');
        return null;
      }
    } catch (err) {
      console.error('Error while fetching claimant token:', err);
      return null;
    } finally {
      // Close the connection
      await sql.close();
    }
  }

  async generateReminderLink(claimantToken) {
    const reminderLink = accountData.reminderLink;
  
    // Replace the token placeholder with the actual claimantToken
    const generatedLink = reminderLink.replace(accountData.replace_value, claimantToken);
  
    return generatedLink;
}
}
