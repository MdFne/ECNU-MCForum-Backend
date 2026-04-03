// utils/response.js

class ApiResponse {
    static success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    static error(res, message = 'Error', statusCode = 500, error = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (error && process.env.NODE_ENV === 'development') {
            response.error = {
                message: error.message,
                stack: error.stack
            };
        }

        return res.status(statusCode).json(response);
    }

    static created(res, data = null, message = 'Created successfully') {
        return this.success(res, data, message, 201);
    }

    static noContent(res, message = 'Deleted successfully') {
        return res.status(204).json({
            success: true,
            message,
            timestamp: new Date().toISOString()
        });
    }

    static badRequest(res, message = 'Bad request', error = null) {
        return this.error(res, message, 400, error);
    }

    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }

    static forbidden(res, message = 'Forbidden') {
        return this.error(res, message, 403);
    }

    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }

    static conflict(res, message = 'Resource conflict', error = null) {
        return this.error(res, message, 409, error);
    }

    static unprocessableEntity(res, message = 'Unprocessable entity', error = null) {
        return this.error(res, message, 422, error);
    }

    static internalError(res, message = 'Internal server error', error = null) {
        return this.error(res, message, 500, error);
    }

    static serviceUnavailable(res, message = 'Service unavailable') {
        return this.error(res, message, 503);
    }
}

module.exports = ApiResponse;