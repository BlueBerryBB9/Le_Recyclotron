import nodemailer from 'nodemailer';

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private email: string, private password: string) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
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
    text: string
  ): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.email,
        to,
        subject,
        text,
      });

      console.log(`Email envoyé : ${info.response}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      throw error;
    }
  }
}


// Exemple d'utilisation
async function sendMail() {
    const email = 'votre-email@gmail.com';
    const password = 'votre-mot-de-passe'; // Utilisez un mot de passe applicatif si nécessaire
  
    const mailService = new MailService(email, password);
  
    try {
      await mailService.sendEmail(
        'destinataire@example.com',
        'Sujet de test',
        'Bonjour, ceci est un test !'
      );
      console.log('Email envoyé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
    }
  }