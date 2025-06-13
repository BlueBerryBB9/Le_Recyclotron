import nodemailer from "nodemailer";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";
import { EMAIL_PASSWORD, EMAIL_SENDER, NODE_ENV } from "../config/env.js";

export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        if (NODE_ENV !== "prod") {
            this.transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: EMAIL_SENDER,
                    pass: EMAIL_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false, // <-- ignorer les certificats non valides
                },
            });
        } else {
            // En production, besoin de la validation ssl
            this.transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: EMAIL_SENDER,
                    pass: EMAIL_PASSWORD,
                },
            });
        }
    }

    /**
     * Envoie un email
     * @param to - Adresse email du destinataire
     * @param subject - Sujet de l'email
     * @param text - Contenu texte de l'email
     */
    public async sendEmail(
        to: string,
        subject: string,
        text: string,
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                to,
                subject,
                text,
            });
        } catch (error) {
            console.log(error);
            throw new RecyclotronApiErr("Mail", "OperationFailed");
        }
    }

    /**
     * Envoie un email de réinitialisation de mot de passe
     * @param to - Adresse email du destinataire
     * @param resetLink - Lien de réinitialisation
     */
    public async sendPasswordResetEmail(
        to: string,
        resetLink: string,
    ): Promise<void> {
        const subject = "Réinitialisation de mot de passe";
        const text = `
            Vous avez demandé une réinitialisation de mot de passe.
            Cliquez sur le lien suivant pour réinitialiser votre mot de passe:
            ${resetLink}
            
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        `;

        await this.sendEmail(to, subject, text);
    }
}

// Exemple d'utilisation
// async function sendMail() {
//     const email = "votre-email@gmail.com";
//     const password = "votre-mot-de-passe"; // Utilisez un mot de passe applicatif si nécessaire

//     const mailService = new MailService(email, password);

//     try {
//         await mailService.sendEmail(
//             "destinataire@example.com",
//             "Sujet de test",
//             "Bonjour, ceci est un test !",
//         );
//         console.log("Email envoyé avec succès !");
//     } catch (error) {
//         console.error("Erreur lors de l'envoi de l'email :", error);
//     }
// }

// import "dotenv/config";
// import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
// import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";
// import { MAILERSEND_SENDER_EMAIL, MAILERSEND_API_KEY } from "../config/env.js";

// export class MailService {
//     private mailerSend: MailerSend;
//     private sentFrom: Sender;

//     constructor() {
//         const apiKey = MAILERSEND_API_KEY;
//         if (!apiKey || apiKey === "")
//             throw new Error("API_KEY is not defined in environment variables.");

//         this.mailerSend = new MailerSend({ apiKey });
//         console.log(MAILERSEND_SENDER_EMAIL);
//         this.sentFrom = new Sender(MAILERSEND_SENDER_EMAIL, "Le Recyclotron");
//         console.log(this.sentFrom);
//     }

//     /**
//      * Envoie un email
//      * @param to - Adresse email du destinataire
//      * @param subject - Sujet de l'email
//      * @param text - Contenu texte de l'email
//      * @param html - Contenu HTML de l'email
//      */
//     public async sendEmail(
//         to: string,
//         subject: string,
//         text: string,
//         html: string,
//     ): Promise<void> {
//         try {
//             const recipients = [new Recipient(to, "Client")];
//             const emailParams = new EmailParams()
//                 .setFrom(this.sentFrom)
//                 .setTo(recipients)
//                 .setSubject(subject)
//                 .setHtml(html)
//                 .setText(text);

//             await this.mailerSend.email.send(emailParams);
//         } catch (error) {
//             console.error("MailerSend error:", error);
//             throw new RecyclotronApiErr("Mail", "OperationFailed");
//         }
//     }

//     /**
//      * Envoie un email de réinitialisation de mot de passe
//      * @param to - Adresse email du destinataire
//      * @param resetLink - Lien de réinitialisation
//      */
//     public async sendPasswordResetEmail(
//         to: string,
//         resetLink: string,
//     ): Promise<void> {
//         const subject = "Réinitialisation de mot de passe";
//         const text = `
//             Vous avez demandé une réinitialisation de mot de passe.
//             Cliquez sur le lien suivant pour réinitialiser votre mot de passe:
//             ${resetLink}

//             Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
//         `;
//         const html = `
//             <p>Vous avez demandé une réinitialisation de mot de passe.</p>
//             <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe:</p>
//             <a href="${resetLink}">${resetLink}</a>
//             <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
//         `;

//         await this.sendEmail(to, subject, text, html);
//     }
// }
