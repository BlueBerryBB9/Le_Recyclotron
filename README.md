<h1 align="center">🌿Le Recyclotron🌿</h1>
<h3 align="center">Easy to use inventory management, showcase website and employee role management web application !<h3>
<br>

# NOTES

- les items de status vendable doivent être affichable pour les client !!
- All categories of an Category maybe useless
- MAYBE USELESS, why dont use update instead of add category to item?
- ITEMS SHOULD HAVE ONLY ONE CATEGORY
- add a route so from an category you can get all the tree for it so parent and child categories
- Why relation many to many between items and categories ?
- why not just have the last category of the "tree" of categories instead of all ? deserves to be debate depending on front implementation. what happens to item bound to a category when a children category of it is created ?

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

## TODO - DONT HESITATE TO MODIFY THE FILE TO UPDATE FEATURE DEVELOPMENT

## MAKE SOUND DATA FOR TESTING + TEST ROUTES AFTER

## MAKE CORS WORK !!! it's not doing its job

- Things to do except classic security features :

  - Important :
    - Create controller methods for registrations and payments for user
    - Test CORS + header ()
    - Test all routes in the order of the user workflow (register --> login --> get events, articles...)
    - Give proper test data to test database
    - Do the class diagram for the api (modification are to expect)
  - Create and enter sound data for test database / main database to allow testing / demos
  - ╚-> Create a script that enters sound data in the database, in particular fake users.
  - Add a forgot password feature that sends email for people to reset their password
  - Add another layer of verification on sign up --> send a mail with a link to authenticate for example
  - scripts that deletes objects in jwt revoked table after a week (common validity date to set in the .env)
  - Find a web host + db host ( we could use freesqldatabase for the moment )

- En Français :

- Choses à faire en dehors des fonctionnalités de sécurité classiques :

  - Important :
    - Créer des méthodes de contrôleur pour les inscriptions et les paiements pour l'utilisateur
    - Tester CORS + en-tête ()
    - Testez toutes les routes dans l'ordre du workflow utilisateur (inscription -> connexion -> obtenir des événements, des articles...)
    - Donner les données de test appropriées à la base de données de test
    - Faire le diagramme de classes pour l'api (des modifications sont à prévoir)
  - Créer et saisir des données sonores pour la base de données de test/base de données principale afin de permettre les tests/démos
  - ╚-> Créer un script qui saisit les données sonores dans la base de données, notamment les faux utilisateurs.
  - Ajoutez une fonctionnalité de mot de passe oublié qui envoie un e-mail aux personnes souhaitant réinitialiser leur mot de passe.
  - Ajouter une autre couche de vérification lors de l'inscription --> envoyer un mail avec un lien pour s'authentifier par exemple
  - des scripts qui suppriment les objets de la table jwt révoqué au bout d'une semaine (date de validité commune à définir dans le .env)
  - Trouver un hébergeur + un hébergeur de base de données (nous pourrions utiliser freesqldatabase pour le moment)

- Security tasks ! - (non-checked tasks in the lower list)

  - add a revocation mecanism + endpoint to revoke any older tokens
  - write the security documentation
  - test

- Liste des fonctionnalités des autorisations :

  - [x] Les passes sont hachés en argon2id en suivant reco OWASP.
  - [x] La comparaison entre un passe contre un hash, lors du login, fonctionne.
  - [x] Les passes ou leur hashes ne sont JAMAIS renvoyés en réponse de route.
  - [x] Les passes sont échangés contre un jeton de session ou un JWT.
    - [x] JWT : votre clé secrète doit être reçue via une variable d'environnement de votre choix. (risque de malus)
  - [x] Les routes sont protégées par une vérification du jeton de connexion sauf pour la consultation de quelques données publiques ou la connexion.
  - [x] Des rôles contraignent certaines actions à certains groupes d'utilisateurs.
  - [x] Des routes permettent des actions seulement lorsqu'elles portent sur des ressources appartenant à l'utilisateur connecté.
  - [x] Un mécanisme permet la déconnexion.
  - [x] Un mécanisme permet la révocation de TOUT les tokens ou de TOUTES les sessions encore valable pour un utilisateur.

  - [?] Le serveur répond au requêtes pré-vol (pre-flight) de CORS.
    - En développement toutes les méthodes sont autorisées pour toutes les origines.
    - En production une seule origine à le droit de faire toutes ces requêtes, choisissez un nom de domaine à vous ou quelque chose en \*.pfb.ecole-89.com.
  - [x] Le serveur ajoute aux requêtes GET les header CORS.

  - [x] Les identifiants de connexion à votre base de données doivent être passés par variable d’environnement.
  - [x] Tout secret utilisé par votre programme doit être passé en variable d’environnement (sinon malus).

  - [x] Les données produites par des utilisateurs ne doivent pas pouvoir provoquer d'exécution arbitraire de code ACE ou de requête arbitraire en BDD. (Justifiez en montrant vos tentatives d'injections.)
  - [x] Le besoin de protections aux CSRF côté serveur est identifié (et des protections sont implémentées si nécessaire)
  - [x] But : écrire un document qui résume les sécurités et contre mesures mises en place ainsi que celles qui sont nécessaires pour le frontend (et/ou celles qui sont déjà implémentées si le frontend est déjà commencé ou terminé) de sorte qu'une personne extérieure au projet puisse comprendre ce qui a été fait et ce qu'il reste à faire.

  - Pour la partie frontend, pensez aux mesures mises en place sur le back-end et à comment elles intéragissent ensemble. Pensez aussi au mesures qui sont exclusives au front.
    Méthode d'évaluation
    Sur rendu : PDF sur teams.

  | Critère                                                              | PA OK                                                                             | PA POK                                                                      | PA NOK                                                                     |
  | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
  | Format (page de garde, numéros de page, sommaire) et ton du document | 5 : ton et format professionel                                                    | 2.5 : le format est partiellement professionel                              | 0 : le format n'est pas du tout professionel                               |
  | Stratégie frontend                                                   | 7.5 : les étapes d'auth et de sécurisation du frontend sont claires et complètes  | 3.75 : une partie des étapes n'est pas claire, il manque plusieurs éléments | 0 : il manque trop d'éléments pour que le document soit utile.             |
  | Stratégie backend                                                    | 7.5 : on comprend très bien les mesures de sécurité mises en place sur le backend | 3.75 : on comprend moyennement bien                                         | 0 : les informations sont insuffisantes pour comprendre les mesures prises |
