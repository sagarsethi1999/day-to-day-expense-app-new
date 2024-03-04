const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Forgotpassword = require('../models/ForgotPasswordRequests');

router.post('/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (user) {
            const id = uuid.v4();
            await user.createForgotpassword({ id, active: true });

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const msg = {
                to: email,
                from: 'yj.rocks.2411@gmail.com',
                subject: 'Password Reset Request',
                text: 'Click the link to reset your password',
                html: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset Password</a>`,
            };

            await sgMail.send(msg);

            return res.status(200).json({ message: 'Link to reset password sent to your email', success: true });
        } else {
            throw new Error('User does not exist');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message, success: false });
    }
});

router.get('/resetpassword/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const forgotpasswordrequest = await Forgotpassword.findOne({ where: { id } });

        if (forgotpasswordrequest && forgotpasswordrequest.active) {
            await forgotpasswordrequest.update({ active: false });
            
            return res.status(200).send(`<html>
                                            <form action="/password/updatepassword/${id}" method="post">
                                                <label for="newpassword">Enter New password</label>
                                                <input name="newpassword" type="password" required></input>
                                                <button>Reset Password</button>
                                            </form>
                                        </html>`);
        } else {
            throw new Error('Invalid or expired reset link');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message, success: false });
    }
});

router.post('/updatepassword/:resetpasswordid', async (req, res) => {
    try {
        const { newpassword } = req.body;
        const resetpasswordid = req.params.resetpasswordid;
        
        const forgotpasswordrequest = await Forgotpassword.findOne({ where: { id: resetpasswordid } });
        
        if (forgotpasswordrequest && forgotpasswordrequest.active) {
            const user = await User.findOne({ where: { id: forgotpasswordrequest.userId } });

            if (user) {
                const saltRounds = 10;
                const hash = await bcrypt.hash(newpassword, saltRounds);
                
                await user.update({ password: hash });
                await forgotpasswordrequest.update({ active: false });
                
                return res.status(200).json({ message: 'Password successfully updated', success: true });
            } else {
                throw new Error('User not found');
            }
        } else {
            throw new Error('Invalid or expired reset link');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message, success: false });
    }
});

module.exports = router;

























// const express = require('express');
// const router = express.Router();
// const SibApiV3Sdk = require('sib-api-v3-sdk');

// // Configure the Sendinblue API client
// const defaultClient = SibApiV3Sdk.ApiClient.instance;
// const apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = 'xsmtpsib-45f3531979250a67e8fb17492bcfcfa9732207b10f7debc1f2f25f6a2e506693-6RMbpXNDJqw4tvBO'; // Replace 'YOUR_SMTP_API_KEY' with your actual SMTP API key

// // Define your route handler
// router.post('/forgotpassword', async (req, res) => {
//   try {
//     const { email } = req.body;
//     console.log(req.body);

//     // Check if email is missing in the request body
//     if (!email) {
//       return res.status(400).json({ error: 'Email is missing in the request body' });
//     }
  
//     // Initialize the Sendinblue transactional email API
//     const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

//     // Create a new transactional email request
//     const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

//     // Set the sender's email address
//     sendSmtpEmail.sender = { email: 'pubgsagar7@gmail.com' };

//     // Set the recipient's email address
//     sendSmtpEmail.to = [{ email }];

//     // Set the subject of the email
//     sendSmtpEmail.subject = 'Password Reset Request';

//     // Set the HTML content of the email (you can customize this)
//     sendSmtpEmail.htmlContent = '<p>Click the link to reset your password</p>';

//     // Send the transactional email
//     const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

//     // Respond with success message
//     res.status(200).json({ message: 'Password reset email sent successfully' });
//   } catch (error) {
//     console.error('Error sending password reset email:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;
