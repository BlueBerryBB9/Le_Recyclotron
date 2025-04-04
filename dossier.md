# Dossier de Conception : Le Recyclotron

## 1. Technologies Utilisées

### Langage de Programmation

- **Node.js** : Utilisé pour le développement backend grâce à sa rapidité et sa capacité à gérer un grand nombre de connexions simultanées grâce à son modèle non-bloquant basé sur des événements.

### Framework Backend

- **Fastify** : Framework performant et extensible pour créer des API RESTful. Il a été choisi pour sa rapidité et sa simplicité d'intégration.

### Base de Données

- **MySQL** : Base de données relationnelle robuste, utilisée pour gérer les relations complexes entre les utilisateurs, les objets recyclables, les transactions, etc.

### Autres Outils

- **Sequelize** : ORM (Object-Relational Mapping) utilisé pour simplifier les interactions avec MySQL.
- **JWT (JSON Web Tokens)** : Utilisé pour l'authentification et la gestion des sessions.
- **Nodemailer** : Pour l'envoi d'emails (réinitialisation de mot de passe, vérification de compte).
- **Stripe API** : Pour la gestion des paiements et des abonnements.

---

## 2. Architecture du Backend

### Organisation des Fichiers et Dossiers

Le backend de **Le Recyclotron** est organisé en plusieurs couches logiques, chacune ayant un rôle spécifique. Voici une description détaillée de l'arborescence des fichiers et dossiers :

```
src/
├── config/
├── controllers/
├── error/
├── middleware/
├── models/
├── routes/
├── service/
└── types/
```

#### **1. `config/`**

Ce dossier contient les fichiers de configuration nécessaires au fonctionnement de l'application. Il regroupe les paramètres globaux et les outils de configuration.

- **`cors.ts`** : Configure les règles CORS (Cross-Origin Resource Sharing) pour sécuriser les échanges entre le frontend et le backend.
- **`database.ts`** : Initialise la connexion à la base de données MySQL en utilisant Sequelize.
- **`env.ts`** : Charge les variables d'environnement depuis le fichier `.env` et vérifie leur présence.
- **`hash.ts`** : Définit les options de hachage pour sécuriser les mots de passe avec Argon2.
- **`stripe.ts`** : Configure le client Stripe pour gérer les paiements.
- **`swagger.js`** : Configure Swagger pour générer automatiquement la documentation des API.

#### **2. `controllers/`**

Les contrôleurs contiennent la logique métier principale. Ils reçoivent les requêtes des routes, interagissent avec les services et renvoient les réponses.

- **`authController.ts`** : Gère l'authentification des utilisateurs (connexion, inscription, vérification OTP).
- **`categoryController.ts`** : Gère les catégories et leurs relations hiérarchiques.
- **`eventController.ts`** : Gère les événements (création, mise à jour, suppression).
- **`itemController.ts`** : Gère les objets recyclables (création, mise à jour, suppression).
- **`paymentController.ts`** : Gère les paiements et abonnements via Stripe.
- **`registrationController.ts`** : Gère les inscriptions aux événements.
- **`userController.ts`** : Gère les utilisateurs et leurs rôles.

#### **3. `error/`**

Ce dossier contient les classes d'erreurs personnalisées pour gérer les exceptions de manière uniforme.

- **`recyclotronApiErr.ts`** : Définit des classes d'erreurs spécifiques pour les différentes entités (ex. : `User`, `Payment`, `Auth`).

#### **4. `middleware/`**

Les middlewares sont des fonctions intermédiaires qui interceptent les requêtes pour effectuer des vérifications ou des transformations.

- **`auth.ts`** : Contient les middlewares pour vérifier les tokens JWT, les permissions des utilisateurs et les rôles.

#### **5. `models/`**

Les modèles définissent la structure des tables de la base de données et leurs relations. Ils utilisent Sequelize pour interagir avec MySQL.

- **`Category.ts`** : Définit les catégories et leurs relations parent-enfant.
- **`Event.ts`** : Définit les événements.
- **`Item.ts`** : Définit les objets recyclables et leur statut.
- **`ItemCategories.ts`** : Table pivot pour les relations entre objets et catégories.
- **`OTP.ts`** : Définit les codes OTP pour la vérification des utilisateurs.
- **`Payment.ts`** : Définit les paiements et leurs types (donation, abonnement).
- **`Registration.ts`** : Définit les inscriptions aux événements.
- **`ResetPassword.ts`** : Définit les demandes de réinitialisation de mot de passe.
- **`Role.ts`** : Définit les rôles des utilisateurs (admin, client, etc.).
- **`User.ts`** : Définit les utilisateurs et leurs informations.
- **`UserRolesAssociations.ts`** : Configure les relations entre utilisateurs et rôles.

#### **6. `routes/`**

Les routes définissent les points d'entrée de l'API. Chaque fichier correspond à une entité ou fonctionnalité.

- **`authRoutes.ts`** : Routes pour l'authentification (connexion, inscription, OTP).
- **`categoryRoutes.ts`** : Routes pour gérer les catégories.
- **`eventRoutes.ts`** : Routes pour gérer les événements.
- **`itemsRoutes.ts`** : Routes pour gérer les objets recyclables.
- **`paymentRoutes.ts`** : Routes pour gérer les paiements et abonnements.
- **`registrationRoutes.ts`** : Routes pour gérer les inscriptions aux événements.
- **`userRoutes.ts`** : Routes pour gérer les utilisateurs et leurs rôles.

#### **7. `service/`**

Les services contiennent la logique métier réutilisable. Ils sont appelés par les contrôleurs pour effectuer des opérations complexes.

- **`authService.ts`** : Gère la génération et la validation des tokens JWT.
- **`categoryService.ts`** : Fournit des fonctions pour récupérer les catégories et leurs enfants.
- **`emailSender.ts`** : Gère l'envoi d'emails via Nodemailer.
- **`getRole.ts`** : Fournit des fonctions pour récupérer les rôles des utilisateurs.
- **`itemService.ts`** : Fournit des fonctions pour récupérer les objets avec leurs catégories.
- **`otpService.ts`** : Gère la création et la vérification des codes OTP.
- **`seedDatabase.ts`** : Script pour insérer des données de test dans la base de données.
- **`stringToInt.ts`** : Convertit des chaînes en entiers avec gestion des erreurs.
- **`userService.ts`** : Fournit des fonctions pour récupérer les utilisateurs avec leurs rôles.

#### **8. `types/`**

Ce dossier contient les définitions de types TypeScript personnalisés.

- **`fastify.d.ts`** : Étend les types de Fastify pour inclure les propriétés personnalisées (ex. : `user` dans les requêtes).

---

### Interaction entre les Couches

1. **Routes** : Les routes reçoivent les requêtes HTTP et les transmettent aux contrôleurs correspondants.
2. **Contrôleurs** : Les contrôleurs orchestrent la logique métier en appelant les services nécessaires.
3. **Services** : Les services effectuent les opérations complexes, comme les interactions avec la base de données ou les appels à des API externes.
4. **Modèles** : Les modèles définissent la structure des données et permettent d'interagir avec la base de données via Sequelize.
5. **Middlewares** : Les middlewares interceptent les requêtes pour effectuer des vérifications (authentification, autorisation, validation des données).
6. **Configuration** : Les fichiers de configuration fournissent les paramètres globaux nécessaires au bon fonctionnement de l'application.

Cette architecture modulaire et bien organisée facilite la maintenance, l'évolutivité et la réutilisation du code.

---

## 3. Authentification et Sécurité

### Gestion des Sessions avec JWT

L'authentification et la gestion des sessions dans **Le Recyclotron** reposent sur des **JSON Web Tokens (JWT)**. Voici comment cela fonctionne :

1. **Création du Token** :
   - Lorsqu'un utilisateur se connecte, un token JWT est généré avec une clé secrète (`JWT_SECRET`) et une durée de validité (`JWT_EXPIRES_IN`).
   - Le token contient des informations comme l'ID de l'utilisateur, son email et ses rôles.

#### Exemple : Génération d'un Token

```typescript
// filepath: src/service/authService.ts
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const generateToken = (id: number, email: string, roles: string[]) => {
  if (!JWT_SECRET)
    throw new Error("JWT_SECRET is missing in environment variables");

  return jwt.sign(
    {
      id,
      email,
      roles,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
};
```

2. **Vérification du Token** :
   - À chaque requête vers une route protégée, le middleware vérifie la validité du token.
   - Si le token est expiré ou invalide, l'accès est refusé.

#### Exemple : Middleware d'authentification

```typescript
// filepath: src/middleware/auth.ts
import { FastifyRequest } from "fastify";

export function authorize(allowedRoles: string[]) {
  return async (request: FastifyRequest) => {
    await request.jwtVerify(); // Vérifie le token JWT
    const userRoles = request.user.roles;

    if (!allowedRoles.some((role) => userRoles.includes(role))) {
      throw new Error("Permission denied");
    }
  };
}
```

3. **Révocation des Tokens** :
   - Un mécanisme de révocation permet d'invalider les tokens en cas de compromission.

#### Exemple : Révocation Globale des Tokens

```typescript
// filepath: src/controllers/authController.ts
let tokenRevocations = {
  global: null,
  users: new Map<string, number>(),
};

export const revokeAllTokens = async (_, reply) => {
  tokenRevocations.global = Date.now();
  reply.send({ message: "All tokens have been revoked" });
};
```

---

### Protection de l'API

Les API sont protégées par plusieurs mécanismes de sécurité :

1. **CORS (Cross-Origin Resource Sharing)** :

   - Configure les origines autorisées pour limiter les requêtes provenant de domaines non approuvés.
   - En développement, toutes les origines sont autorisées. En production, seules des origines spécifiques sont acceptées.

2. **Rate Limiting** :

   - Limite le nombre de requêtes par utilisateur pour éviter les abus (ex. : attaques par force brute).

3. **Middleware d'authentification** :
   - Vérifie que l'utilisateur est authentifié et autorisé à accéder à une ressource.

#### Exemple : Configuration CORS

```typescript
// src/config/cors.ts
export const corsConfig = {
  origin:
    process.env.NODE_ENV === "production" ? "https://mon-domaine.com" : true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
```

---

## 4. Exemples de Code Backend

### Exemple : Gestion des Utilisateurs

```typescript
// filepath: src/controllers/userController.ts
import SUser from "../models/User.js";

export const getAllUsers = async (_, reply) => {
  const users = await SUser.findAll();
  reply.status(200).send({
    data: users.map((user) => user.toJSON()),
    message: "Users fetched successfully",
  });
};
```

### Exemple : Gestion des Catégories

```typescript
// filepath: src/controllers/categoryController.ts
import SCategory from "../models/Category.js";

export const getAllCategories = async (_, reply) => {
  const categories = await SCategory.findAll();
  reply.status(200).send({
    data: categories.map((category) => category.toJSON()),
    message: "Categories fetched successfully",
  });
};
```

### Exemple : Gestion des Événements

```typescript
// filepath: src/controllers/eventController.ts
import SEvent from "../models/Event.js";

export const getAllEvents = async (_, reply) => {
  const events = await SEvent.findAll();
  reply.status(200).send({
    data: events.map((event) => event.toJSON()),
    message: "Events fetched successfully",
  });
};
```

### Exemple : Inscription d'un Utilisateur (register)

La fonction `register` permet de créer un nouvel utilisateur dans le système. Elle vérifie si l'utilisateur existe déjà, hache le mot de passe, crée l'utilisateur et lui attribue un rôle par défaut.

```typescript
// filepath: src/controllers/authController.ts
export const register = async (
  request: FastifyRequest<{
    Body: CreateUser;
  }>,
  reply: FastifyReply,
) => {
  try {
    const userData = ZCreateUser.parse(request.body);

    const existingUser = await SUser.findOne({
      where: { email: userData.email },
    });
    if (existingUser) throw new RecyclotronApiErr("Auth", "AlreadyExists", 409);

    userData.password = await argon.hash(
      userData.password,
      hashConfig.argon2Options,
    );

    const newUser = await SUser.create({
      ...userData,
    });

    await SUserRoles.create({
      userId: newUser.getDataValue("id"),
      roleId: 6, // Rôle par défaut : client
    });

    return reply.status(201).send({
      message: "User registered successfully. Please log in.",
    });
  } catch (error) {
    if (error instanceof BaseError) {
      throw new SequelizeApiErr("Auth", error);
    } else if (error instanceof RecyclotronApiErr) {
      throw error;
    } else throw new RecyclotronApiErr("Auth", "OperationFailed");
  }
};
```

**Explication** :

- **Validation des données** : Les données de l'utilisateur sont validées à l'aide de Zod.
- **Vérification de l'existence** : Vérifie si un utilisateur avec le même email existe déjà.
- **Hachage du mot de passe** : Utilise Argon2 pour sécuriser le mot de passe.
- **Création de l'utilisateur** : Insère l'utilisateur dans la base de données.
- **Attribution de rôle** : Associe un rôle par défaut (client) à l'utilisateur.

---

### Exemple : Récupération des Objets par Statut (getItemByStatus)

La fonction `getItemByStatus` permet de récupérer tous les objets ayant un statut spécifique. Elle vérifie également les permissions de l'utilisateur.

```typescript
// filepath: src/controllers/itemController.ts
export const getItemByStatus = async (
  request: FastifyRequest<{ Params: { status: string } }>, // Status is an enum
  reply: FastifyReply,
) => {
  try {
    const status: number = stringToInt(request.params.status, "Item");

    let is_visitor = false;
    try {
      await request.jwtVerify();
    } catch (_) {
      is_visitor = true;
    }
    if (
      (is_visitor ||
        (request.user.roles.includes("client") &&
          !request.user.roles.includes("admin"))) &&
      status !== 0
    ) {
      throw new RecyclotronApiErr("Auth", "PermissionDenied", 401, "You can only access salable items data");
    }

    const items = await i.default.findAll({
      where: { status },
      include: [
        {
          model: SCategory,
          as: "categories",
          through: { attributes: [] },
        },
      ],
    });
    if (items.length === 0)
      return new RecyclotronApiErr("Item", "NotFound", 404);

    reply.code(200).send({
      data: items.map((item) => item.toJSON()), // Extract plain objects
      message: "Items fetched by status successfully",
    });
  } catch (error) {
    if (error instanceof RecyclotronApiErr) {
      throw error;
    } else if (error instanceof BaseError) {
      throw new SequelizeApiErr("Item", error);
    } else throw new RecyclotronApiErr("Item", "FetchFailed");
  }
};
```

**Explication** :

- **Validation des paramètres** : Convertit le statut en entier et vérifie sa validité.
- **Vérification des permissions** : Les visiteurs et les clients ne peuvent accéder qu'aux objets "vendables".
- **Requête à la base de données** : Récupère les objets ayant le statut spécifié, ainsi que leurs catégories associées.
- **Gestion des erreurs** : Retourne une erreur si aucun objet n'est trouvé ou si l'utilisateur n'a pas les permissions nécessaires.

---

### Exemple : Création d'un Événement (createEvent)

La fonction `createEvent` permet de créer un nouvel événement. Elle vérifie que la date de l'événement est valide avant de l'insérer dans la base de données.

```typescript
// filepath: src/controllers/eventController.ts
export const createEvent = async (
  req: FastifyRequest<{ Body: e.InputEvent }>,
  rep: FastifyReply,
) => {
  try {
    const date = req.body.date;

    if (new Date(date) < new Date())
      throw new RecyclotronApiErr(
        "Event",
        "InvalidInput",
        400,
        "Event date cannot be in the past",
      );

    const event = await e.default.create(req.body);

    return rep.status(201).send({
      data: event.toJSON(),
      message: "Event Created",
    });
  } catch (error) {
    if (error instanceof BaseError) {
      throw new SequelizeApiErr("Event", error);
    } else throw new RecyclotronApiErr("Event", "CreationFailed");
  }
};
```

**Explication** :

- **Validation de la date** : Vérifie que la date de l'événement n'est pas dans le passé.
- **Création de l'événement** : Insère les données de l'événement dans la base de données.
- **Gestion des erreurs** : Retourne une erreur si la date est invalide ou si l'insertion échoue.

Ces exemples illustrent des cas d'utilisation concrets de la logique métier dans le backend de **Le Recyclotron**.

---

## 5. Base de Données

### Structure des Tables

- **Users** : Contient les informations des utilisateurs (id, email, mot de passe, etc.).
- **Roles** : Définit les rôles disponibles (admin, client, etc.).
- **UserRoles** : Table pivot pour associer les utilisateurs à leurs rôles.
- **Items** : Contient les objets recyclables.
- **Categories** : Définit les catégories des objets.
- **Payments** : Gère les paiements et abonnements.

### Relations

- Un utilisateur peut avoir plusieurs rôles (relation plusieurs-à-plusieurs).
- Un objet peut appartenir à plusieurs catégories.

### Utilisation de Sequelize

#### Exemple : Définition d'un Modèle

```typescript
// filepath: src/models/User.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class SUser extends Model {}

SUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
  },
);

export default SUser;
```

#### Exemple : Création d'une Relation

```typescript
// filepath: src/models/UserRolesAssociations.ts
import SUser from "./User.js";
import SRole from "./Role.js";
import SUserRole from "./UserRoles.js";

const setupAssociations = () => {
  SUser.belongsToMany(SRole, {
    as: "roles",
    foreignKey: "userId",
    through: SUserRole,
  });

  SRole.belongsToMany(SUser, {
    as: "users",
    foreignKey: "roleId",
    through: SUserRole,
  });
};

export default setupAssociations;
```

#### Exemple : Requête pour Récupérer un Utilisateur avec ses Rôles

```typescript
// filepath: src/service/userService.ts
import SUser from "../models/User.js";

export const getUserWithRoles = async (userId: number) => {
  return await SUser.findByPk(userId, {
    include: [
      {
        association: "roles",
        attributes: ["id", "name"],
      },
    ],
  });
};
```

#### Exemple : Création d'un Utilisateur

```typescript
// filepath: src/controllers/userController.ts
import SUser from "../models/User.js";

export const createUser = async (req, reply) => {
  const { email, password } = req.body;

  const user = await SUser.create({
    email,
    password,
  });

  reply.status(201).send({
    data: user.toJSON(),
    message: "User created successfully",
  });
};
```

#### Exemple : Mise à Jour d'un Utilisateur

```typescript
// filepath: src/controllers/userController.ts
export const updateUser = async (req, reply) => {
  const { id } = req.params;
  const { email, password } = req.body;

  const user = await SUser.findByPk(id);
  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  await user.update({ email, password });

  reply.status(200).send({
    data: user.toJSON(),
    message: "User updated successfully",
  });
};
```

#### Exemple : Suppression d'un Utilisateur

```typescript
// filepath: src/controllers/userController.ts
export const deleteUser = async (req, reply) => {
  const { id } = req.params;

  const user = await SUser.findByPk(id);
  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  await user.destroy();

  reply.status(200).send({ message: "User deleted successfully" });
};
```

### Principales Requêtes

- Récupérer un utilisateur avec ses rôles :
  ```sql
  SELECT * FROM Users
  JOIN UserRoles ON Users.id = UserRoles.userId
  JOIN Roles ON UserRoles.roleId = Roles.id;
  ```
- Ajouter un paiement :
  ```sql
  INSERT INTO Payments (userId, amount, status) VALUES (?, ?, ?);
  ```

Ces exemples montrent comment Sequelize est utilisé pour interagir avec la base de données, gérer les relations et effectuer des opérations CRUD (Create, Read, Update, Delete).

---

## 6. Sécurité

### Validation des Entrées

- Utilisation de **Zod** pour valider les données des requêtes et éviter les injections SQL ou XSS.
- Les schémas Zod permettent de définir des règles strictes pour les données attendues.

#### Exemple : Validation des Données d'Entrée

```typescript
// src/models/User.ts
import z from "zod";

// Schéma pour la création d'un utilisateur
export const ZCreateUser = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format").max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Utilisation dans une route
fastify.post<{ Body: z.infer<typeof ZCreateUser> }>(
  "/users",
  {
    schema: {
      body: ZCreateUser,
    },
  },
  async (req, reply) => {
    const userData = ZCreateUser.parse(req.body); // Validation des données
    reply.send({ message: "User created successfully" });
  },
);
```

#### Exemple : Validation des Données de Sortie

```typescript
// src/models/User.ts
// Schéma pour les données utilisateur publiques
export const ZPublicUser = ZCreateUser.omit({ password: true }).extend({
  id: z.number(),
  roles: z.array(z.string()),
});

// Utilisation dans une réponse
fastify.get<{ Params: { id: string } }>(
  "/users/:id",
  {
    schema: {
      response: {
        200: ZPublicUser,
      },
    },
  },
  async (req, reply) => {
    const user = await getUserById(req.params.id); // Récupération de l'utilisateur
    reply.send(ZPublicUser.parse(user)); // Validation des données de sortie
  },
);
```

### Gestion des Erreurs

- Les erreurs sont capturées et formatées avant d'être renvoyées au client.
- Les erreurs de validation Zod sont interceptées et transformées en réponses claires.

#### Exemple : Gestion des Erreurs de Validation

```typescript
// Middleware global pour gérer les erreurs
fastify.setErrorHandler((error, req, reply) => {
  if (error instanceof z.ZodError) {
    reply.status(400).send({
      message: "Validation Error",
      errors: error.errors, // Liste des erreurs de validation
    });
  } else {
    reply.status(500).send({ message: "Internal Server Error" });
  }
});
```

### Protection contre les Attaques

- **Injection SQL** : Prévention grâce à Sequelize et à la validation des entrées.
- **CSRF** : Les routes sensibles sont protégées par des tokens JWT.
- **XSS** : Les données utilisateur sont échappées avant d'être affichées.

#### Exemple : Échappement des Données pour Prévenir les XSS

```typescript
// src/controllers/userController.ts
import { escape } from "lodash";

export const getUserById = async (req, reply) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }
  // Échappement des données avant de les renvoyer
  const safeUser = {
    ...user.toJSON(),
    firstName: escape(user.firstName),
    lastName: escape(user.lastName),
  };
  reply.send(safeUser);
};
```

Ces exemples montrent comment Zod et d'autres outils sont utilisés pour renforcer la sécurité des données et protéger l'application contre les attaques courantes.
