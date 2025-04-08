import sgMail from "@sendgrid/mail";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

export class MailService {
    constructor(
        private apiKey: string,
        private email: string,
    ) {
        sgMail.setApiKey(this.apiKey);
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
            const msg = {
                to,
                from: this.email,
                subject,
                text,
            };

            await sgMail.send(msg);
        } catch (error) {
            console.error(error);
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
//     const apiKey = "votre-sendgrid-api-key";
//     const email = "votre-email@example.com";

//     const mailService = new MailService(apiKey, email);

//     try {
//         await mailService.sendEmail(
//             "destinataire@example.com",
//             "Sujet de test",
//             "Bonjour, ceci est un test avec SendGrid !",
//         );
//         console.log("Email envoyé avec succès !");
//     } catch (error) {
//         console.error("Erreur lors de l'envoi de l'email :", error);
//     }
// }
