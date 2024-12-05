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
        | "RegistrationInEvent",
): number {
    let j = parseInt(i);
    if (Number.isNaN(j))
        throw new RecyclotronApiErr(error_subject, "InvalidInput", 400);
    return j;
}
