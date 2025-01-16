<h1 align="center">🌿Le Recyclotron🌿</h1>
<h3 align="center">Easy to use inventory management, showcase website and employee role management web application !<h3>
<br>

## TODO - DONT HESITATE TO MODIFY THE FILE TO UPDATE FEATURE DEVELOPMENT

- CHECK THAT DATA IS CORRECTLY RETURNED ON RESPONSE !!!!! (bcs it's not smth happening rn)
- Liste des fonctionnalités des autorisations :

  - [ ] Les passes sont hachés en argon2id en suivant reco OWASP.
  - [x] La comparaison entre un passe contre un hash, lors du login, fonctionne.
  - [x] Les passes ou leur hashes ne sont JAMAIS renvoyés en réponse de route.
  - [x] Les passes sont échangés contre un jeton de session ou un JWT.
    - [x] JWT : votre clé secrète doit être reçue via une variable d'environnement de votre choix. (risque de malus)
  - [x] Les routes sont protégées par une vérification du jeton de connexion sauf pour la consultation de quelques données publiques ou la connexion.
  - [x] Des rôles contraignent certaines actions à certains groupes d'utilisateurs.
  - [x] Des routes permettent des actions seulement lorsqu'elles portent sur des ressources appartenant à l'utilisateur connecté.
  - [x] Un mécanisme permet la déconnexion.
  - [ ] Un mécanisme permet la révocation de TOUT les tokens ou de TOUTES les sessions encore valable pour un utilisateur.

  - [x] Le serveur répond au requêtes pré-vol (pre-flight) de CORS.
    - En développement toutes les méthodes sont autorisées pour toutes les origines.
    - En production une seule origine à le droit de faire toutes ces requêtes, choisissez un nom de domaine à vous ou quelque chose en \*.pfb.ecole-89.com.
  - [x] Le serveur ajoute aux requêtes GET les header CORS.

  - [x] Les identifiants de connexion à votre base de données doivent être passés par variable d’environnement.
  - [x] Tout secret utilisé par votre programme doit être passé en variable d’environnement (sinon malus).

  - [x] Les données produites par des utilisateurs ne doivent pas pouvoir provoquer d'exécution arbitraire de code ACE ou de requête arbitraire en BDD. (Justifiez en montrant vos tentatives d'injections.)
  - [x] Le besoin de protections aux CSRF côté serveur est identifié (et des protections sont implémentées si nécessaire)
  - [ ] But : écrire un document qui résume les sécurités et contre mesures mises en place ainsi que celles qui sont nécessaires pour le frontend (et/ou celles qui sont déjà implémentées si le frontend est déjà commencé ou terminé) de sorte qu'une personne extérieure au projet puisse comprendre ce qui a été fait et ce qu'il reste à faire.

  - Pour la partie frontend, pensez aux mesures mises en place sur le back-end et à comment elles intéragissent ensemble. Pensez aussi au mesures qui sont exclusives au front.
    Méthode d'évaluation
    Sur rendu : PDF sur teams.

    Critère PA OK PA POK PA NOK

    - Format (page de garde, numéros de page, sommaire) et ton du document: 5 : ton et format professionel 2.5 : le format est partiellement professionel 0 : le format n'est pas du tout professionel
    - Stratégie frontend: 7.5 : les étapes d'auth et de sécurisation du frontend sont claires et complèters 3.75 : une partie des étapes n'est pas claire, il manque plusieurs éléments 0 : il manque trop d'éléments pour que le document soit utile.
    - Stratégie backend: 7.5 : on comprend très bien les mesures de sécurité mises en place sur le backend 3.75 : on comprend moyennement bien 0 : les informations sont insuffisantes pour comprendre les mesures prises

### Authors :

- [BlueBerryBB9](https://github.com/BlueBerryBB9)
- [Wissal-Bot](https://github.com/wissal-bot)
- [Nchanti33](https://github.com/Nchanti33)

### What is Le Recyclotron ?

The Recyclotron aims to simplify inventory management and customer interaction for both associations and companies.
The aim is to centralize these operations via a single interface. This interface will enable users to track and update inventories seamlessly.
At the same time, another access will be dedicated to customer interaction, notably via a showcase site, facilitating management and communication.

### Requirements

- Yarn (can be installed with npm)
- All packages in package.json (install with commmand : "yarn" in your terminal)

#### Scripts

To launch the server : yarn exe
To launch with a watcher : yarn nodemon
