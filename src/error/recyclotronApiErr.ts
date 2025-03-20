import {
    BaseError,
    ValidationError as SequelizeValidationError,
    UniqueConstraintError as SequelizeUniqueConstraintError,
} from "sequelize";

// get the function when first error was launched
function getFunctionLine(error: Error): string {
    const stackLines = error.stack?.split("\n") || [];
    return stackLines[2];
}

export class SequelizeApiErr {
    constructor(
        subject:
            | "Item"
            | "Category"
            | "User"
            | "RoleInUser"
            | "Event"
            | "Payment"
            | "Registration"
            | "RegistrationInEvent"
            | "UserRole"
            | "Auth"
            | "Role"
            | "JWT"
            | "Mail"
            | "MiddleWare"
            | "Env"
            | "OTP",
        error: BaseError,
    ) {
        if (error instanceof SequelizeValidationError)
            throw new RecyclotronApiErr(
                subject,
                "InvalidInput",
                400,
                error.message,
            );
        else if (error instanceof SequelizeUniqueConstraintError)
            throw new RecyclotronApiErr(
                subject,
                "AlreadyExists",
                405,
                error.message,
            );
        else
            throw new RecyclotronApiErr(
                subject,
                "DatabaseFailed",
                500,
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
            | "RoleInUser"
            | "Event"
            | "Payment"
            | "Registration"
            | "RegistrationInEvent"
            | "UserRole"
            | "Role"
            | "OTP"
            | "JWT"
            | "Mail"
            | "MiddleWare"
            | "Env"
            | "Auth",
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
            | "DatabaseFailed"
            | "ResetFailed"
            | "InvalidResetCode"
            | "EnvKeyMissing"
            | "ResetRequestFailed"
            | "OutPutValidationFailed"
            | "Expired"
            | "InvalidLocation",
        statusCode?: number,
        detailMessage?: string,
    ) {
        const functionLine = getFunctionLine(Error());
        if (detailMessage) {
            super(
                subject +
                    " : " +
                    msg +
                    " : " +
                    detailMessage +
                    " in " +
                    functionLine,
            );
            this.message =
                subject +
                " : " +
                msg +
                " " +
                detailMessage +
                " in " +
                functionLine;
        } else {
            super(subject + " : " + msg + " in " + functionLine);
            this.message = subject + " : " + msg + " in " + functionLine;
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
