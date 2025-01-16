import nodemailer from 'nodemailer';

class EmailSender {
    private transporter: nodemailer.Transporter;

    constructor(gmailUser: string, gmailPassword: string) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPassword
            }
        });
    }

    async sendEmail(toEmail: string, subject: string, body: string): Promise<void> {
        const mailOptions = {
            from: this.transporter.options.auth.user,
            to: toEmail,
            subject: subject,
            text: body
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}

// Utilisation de la classe
(async () => {
    const gmailUser = 'votre_email@gmail.com';
    const gmailPassword = 'votre_mot_de_passe';

    const emailSender = new EmailSender(gmailUser, gmailPassword);
    await emailSender.sendEmail('destinataire@example.com', 'Sujet de l\'email', 'Contenu de l\'email');
})();