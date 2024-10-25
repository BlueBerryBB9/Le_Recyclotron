

// // Classe Formulaire
// class Formulaire {
//     constructor() {
//         this.utilisateurs = [];
//     }

//     ajouterUtilisateur(nom, email, role) {
//         if (role !== "admin" && role !== "normal") {
//             console.log("Erreur: le rôle doit être 'admin' ou 'normal'");
//             return;
//         }
//         const user = new User(nom, email, role);
//         this.utilisateurs.push(user);
//         console.log(`Utilisateur ajouté: ${nom} (${role})`);
//     }

//     afficherUtilisateurs() {
//         this.utilisateurs.forEach((user, index) => {
//             console.log(`${index + 1}. Nom: ${user.nom}, Email: ${user.email}, Rôle: ${user.role}`);
//         });
//     }

//     afficherAdmins() {
//         const admins = this.utilisateurs.filter(user => user.isAdmin());
//         console.log("Liste des admins:");
//         admins.forEach(admin => {
//             console.log(`Nom: ${admin.nom}, Email: ${admin.email}`);
//         });
//     }
// }
