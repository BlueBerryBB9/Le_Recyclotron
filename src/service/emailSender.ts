import nodemailer from "nodemailer";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(
        private email: string,
        private password: string,
    ) {
        this.transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: this.email,
                pass: this.password,
            },
        });
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
            const info = await this.transporter.sendMail({
                from: this.email,
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
