import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

export function intToString(
    i: string,
    error_subject:
        | "Item"
        | "Category"
        | "User"
        | "Event"
        | "Payment"
        | "Registration"
        | "Role"
        | "RoleInUser"
        | "UserRole"
        | "Auth"
        | "RegistrationInEvent",
): number {
    let j = parseInt(i);
    if (Number.isNaN(j))
        throw new RecyclotronApiErr(error_subject, "InvalidInput", 400);
    return j;
}