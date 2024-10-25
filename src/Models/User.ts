// Classe User
class User {
    nom: any;
    email: any;
    role: any;
    phoneNumber: string;
    address: string;
    constructor(nom: any, email: any, role: any, phoneNumber: any, address: any) {
        this.nom = nom;
        this.email = email;
        this.role = role; // "admin" "reperateur" "cm" "employe" "client"
        this.phoneNumber = "";
        this.address = "";

    }

    isAdmin() {
        return this.role === "admin";
    }
}