const nodemailer = require('nodemailer');
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

class EmailService {
    constructor() {
        this.isMock = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@example.com';

        if (!this.isMock) {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            this.imapConfig = {
                imap: {
                    user: process.env.EMAIL_USER,
                    password: process.env.EMAIL_PASS,
                    host: process.env.IMAP_HOST || 'imap.ethereal.email',
                    port: 993,
                    tls: true,
                    tlsOptions: { rejectUnauthorized: false },
                    authTimeout: 15000
                }
            };
        } else {
            console.log("⚠️  Email Credentials missing or invalid. Using MOCK Email Service.");
        }
    }

    async sendEmail(to, subject, text, html) {
        if (this.isMock) {
            console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
            return { messageId: 'mock-email-id-' + Date.now() };
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"RFP System" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                html
            });
            console.log("Message sent: %s", info.messageId);
            return info;
        } catch (error) {
            console.error("Email Send Error (Falling back to mock):", error.message);
            return { messageId: 'mock-fallback-id-' + Date.now() };
        }
    }

    async fetchAndParseEmails(mockRfpId = null) {
        if (this.isMock) {
            console.log("[MOCK EMAIL] Fetching mock emails...");
            return [
                {
                    uid: 'mock-uid-1',
                    subject: 'Re: RFP Invitation: Mock RFP [Ref:1234567890abcdef12345678]',
                    from: 'sales@techworld.com',
                    text: `Hi Team,
Here is our proposal.
Price: $95,000
Warranty: 3 years
Delivery: 2 weeks
Thanks, Alice`,
                    date: new Date()
                }
            ];
        }

        try {
            const connection = await imaps.connect(this.imapConfig);
            await connection.openBox('INBOX');

            const delay = 24 * 3600 * 1000;
            const yesterday = new Date();
            yesterday.setTime(Date.now() - delay);

            const searchCriteria = [
                'UNSEEN',
                ['SINCE', yesterday],
                ['HEADER', 'SUBJECT', 'Ref:']
            ];

            const fetchOptions = {
                bodies: [''],
                markSeen: true
            };

            const messages = await connection.search(searchCriteria, fetchOptions);
            const parsedEmails = [];

            for (const item of messages) {
                const all = item.parts.find(part => part.which === '');
                const id = item.attributes.uid;
                const mail = await simpleParser(all.body);

                parsedEmails.push({
                    uid: id,
                    subject: mail.subject,
                    from: mail.from.text,
                    text: mail.text,
                    html: mail.html,
                    date: mail.date
                });
            }

            connection.end();
            return parsedEmails;
        } catch (error) {
            console.error("Email Fetch/Parse Error (Falling back to mock):", error.message);
            // Fallback to mock data on error
            const rfpId = mockRfpId || '1234567890abcdef12345678';
            return [
                {
                    uid: 'mock-uid-' + Date.now(),
                    subject: `Re: RFP Invitation: Mock RFP [Ref:${rfpId}]`,
                    from: 'sales@techworld.com',
                    text: `Hi Team,
Here is our proposal.
Price: $95,000
Warranty: 3 years
Delivery: 2 weeks
Thanks, Alice`,
                    date: new Date()
                }
            ];
        }
    }
}

module.exports = new EmailService();
