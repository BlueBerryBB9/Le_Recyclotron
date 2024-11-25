export class RecyclotronApiErr extends Error {
    statusCode: number;
    message: string;

    constructor(
        subject:
            | "Item"
            | "Category"
            | "User"
            | "event"
            | "payment"
            | "registration",
        msg:
            | "NotFound"
            | "InvalidInput"
            | "PermissionDenied"
            | "OperationFailed"
            | "AlreadyExists",
        statusCode?: number,
    ) {
        super(subject + " : " + msg);
        this.message = subject + " : " + msg;
        this.statusCode = statusCode ? statusCode : 500;
    }

    Error() {
        return {
            message: this.message,
            status: this.statusCode,
        };
    }
}
