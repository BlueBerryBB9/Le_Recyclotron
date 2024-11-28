import {
    BaseError,
    ValidationError as SequelizeValidationError,
} from "sequelize";

function getFunctionLine(error: Error): string {
    const stackLines = error.stack?.split("\n") || [];
    return stackLines[1];
}

export class SequelizeApiErr {
    constructor(
        subject:
            | "Item"
            | "Category"
            | "User"
            | "Event"
            | "Payment"
            | "Registration"
            | "RegistrationInEvent",
        error: BaseError,
    ) {
        if (error instanceof SequelizeValidationError)
            throw new RecyclotronApiErr(
                subject,
                "InvalidInput",
                404,
                error.message,
            );
    }
}
export class RecyclotronApiErr extends Error {
    statusCode: number;
    message: string;

    constructor(
        subject:
            | "Item"
            | "Category"
            | "User"
            | "Event"
            | "Payment"
            | "Registration"
            | "RegistrationInEvent",
        msg:
            | "NotFound"
            | "InvalidInput"
            | "PermissionDenied"
            | "AlreadyExists"
            | "OperationFailed"
            | "CreationFailed"
            | "DeletionFailed"
            | "UpdateFailed"
            | "FetchFailed"
            | "FetchAllFailed"
            | "DatabaseFailed",
        statusCode?: number,
        sequelizeMessage?: string,
    ) {
        let functionLine = getFunctionLine(Error());
        if (sequelizeMessage) {
            super(
                subject +
                    " : " +
                    msg +
                    ":" +
                    sequelizeMessage +
                    "in" +
                    functionLine,
            );
            this.message =
                subject + " : " + msg + sequelizeMessage + "in" + functionLine;
        } else {
            super(subject + " : " + msg + "in" + functionLine);
            this.message = subject + " : " + msg + "in" + functionLine;
        }
        this.statusCode = statusCode ? statusCode : 500;
    }

    Error() {
        return {
            message: this.message,
            status: this.statusCode,
        };
    }
}
