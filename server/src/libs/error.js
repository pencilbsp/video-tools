export default class ResponseError extends Error {
    constructor(message, status, statusText) {
        super(message);
        this.status = status || 500;
        this.statusText = statusText || "Internal Server Error";
    }
}

export class ContentTooLarge extends ResponseError {
    constructor(message) {
        super(message, 414, "Content Too Large");
    }
}

export class UnsupportedMediaType extends ResponseError {
    constructor(message) {
        super(message, 415, "Unsupported Media Type");
    }
}

export class NotFound extends ResponseError {
    constructor(message) {
        super(message, 404, "NotFound");
    }
}

export class Conflict extends ResponseError {
    constructor(message) {
        super(message, 409, "Conflict");
    }
}

export class Unauthorized extends ResponseError {
    constructor(message) {
        super(message || "Đăng nhập để sử dụng tính năng này", 401, "Unauthorized");
    }
}

export class Forbidden extends ResponseError {
    constructor(message) {
        super(message || "Không có quyền thực hiện hành động này", 403, "Forbidden");
    }
}
