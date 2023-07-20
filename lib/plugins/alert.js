// Load necessary modules
const axios = require('axios');
const twilio = require('twilio');
require('dotenv').config()

// Define your Nightscout and Twilio configurations
const nightscoutAPI = process.env.NIGHTSCOUT_API;  // Retrieve from environment variables
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;  // Retrieve from environment variables
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;  // Retrieve from environment variables
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;  // Retrieve from environment variables
const caregiverPhoneNumber = process.env.CAREGIVER_PHONE_NUMBER;  // Retrieve from environment variables

// Create a Twilio client
const client = new twilio(twilioAccountSid, twilioAuthToken);

// Define the alert function
const checkAndSendAlert = async () => {
  try {
    // Fetch the latest entries
    console.log('Checking entries...');
    const response = await axios.get(`${nightscoutAPI}/entries.json?count=1`);
    const entries = response.data;
    console.log(`Latest entry: ${JSON.stringify(entries[0])}`);
    if (entries.length > 0) {
      const latestEntry = entries[0];
      const bgValue = latestEntry.sgv;
      console.log(`Latest BG value: ${bgValue}`);

      // Check if the bgValue is out of range and send an alert
      if (bgValue < 70 || bgValue > 130) {
        console.log('Sending alert...');
        const message = `Alert: Blood glucose value is ${bgValue}, which is out of the normal range.`;
        client.messages.create({
          body: message,
          to: caregiverPhoneNumber,
          from: twilioPhoneNumber
        }).then((message) => console.log(`Message sent: ${message.sid}`));
      }
    }
  } catch (error) {
    console.error(`Failed to check entries: ${error}`);
  }
};

// Check for alerts every 5 minutes
console.log('Starting alert service...');
setInterval(checkAndSendAlert, 1 * 60 * 1000);
