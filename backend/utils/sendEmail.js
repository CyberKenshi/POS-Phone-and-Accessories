const axios = require('axios');
const fs = require('fs');

const sendEmail = async (to, subject, text, htmlContent = '', attachmentPath = null) => {
    const brevoEmailData = {
        sender: {
            name: "POS",
            email: process.env.EMAIL_USER
        },
        to: [
            {
                email: to,
                name: "Recipient Name"
            }
        ],
        subject: subject,
        textContent: text,
        htmlContent: htmlContent || `<p>${text}</p>`
    };

    // Nếu có attachmentPath, đọc file và thêm vào attachments
    if (attachmentPath) {
        try {
            const pdfContent = fs.readFileSync(attachmentPath);
            const base64Content = pdfContent.toString('base64');
            brevoEmailData.attachment = [{
                content: base64Content,
                name: 'invoice.pdf',
                type: 'application/pdf'
            }];
            console.log('Attachment added successfully.');
        } catch (error) {
            console.error('Error reading attachment file:', error);
        }
    }

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            brevoEmailData,
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );
        console.log('Email sent successfully via Brevo:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Failed to send email via Brevo:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

module.exports = sendEmail;
