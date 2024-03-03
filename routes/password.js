const express = require('express');
const router = express.Router();
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure the Sendinblue API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

// Define your route handler
router.post('/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is missing in the request body
    if (!email) {
      return res.status(400).json({ error: 'Email is missing in the request body' });
    }
  
    // Initialize the Sendinblue transactional email API
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // Create a new transactional email request
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Set the sender's email address
    sendSmtpEmail.sender = { email: 'sagarsethiputulu@gmail.com' };

    // Set the recipient's email address
    sendSmtpEmail.to = [{ email }];

    // Set the subject of the email
    sendSmtpEmail.subject = 'Password Reset Request';

    // Set the HTML content of the email (you can customize this)
    sendSmtpEmail.htmlContent = '<p>Click the link to reset your password</p>';

    // Send the transactional email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Respond with success message
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
