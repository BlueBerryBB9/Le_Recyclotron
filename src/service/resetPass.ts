// Import des dépendances nécessaires
import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bodyParser from 'body-parser';

// Configuration de l'application
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Simulation d'une base de données
const users = new Map<string, { email: string; password: string; resetToken?: string }>();

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Remplacez par votre e-mail
    pass: 'your-email-password', // Remplacez par votre mot de passe
  },
});

// Route pour demander la réinitialisation de mot de passe
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'L\'e-mail est requis.' });
  }

  const user = Array.from(users.values()).find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }

  // Générer un token de réinitialisation
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;

  // URL de réinitialisation du mot de passe
  const resetUrl = `http://localhost:${PORT}/reset-password/${resetToken}`;

  // Envoi de l'e-mail
  transporter.sendMail({
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Réinitialisation de mot de passe',
    text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetUrl}`,
  }, (err, info) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail.' });
    }
    res.json({ message: 'E-mail de réinitialisation envoyé avec succès.' });
  });
});

// Route pour réinitialiser le mot de passe
app.post('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'Le nouveau mot de passe est requis.' });
  }

  const user = Array.from(users.values()).find((u) => u.resetToken === token);

  if (!user) {
    return res.status(404).json({ message: 'Token invalide ou expiré.' });
  }

  // Mise à jour du mot de passe et suppression du token
  user.password = newPassword;
  delete user.resetToken;

  res.json({ message: 'Mot de passe réinitialisé avec succès.' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
