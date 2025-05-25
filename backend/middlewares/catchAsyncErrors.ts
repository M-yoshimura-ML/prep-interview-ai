type HandlerFunction = (...args: any[]) => Promise<any>;

interface InvalidationError {
    message: string;
    statusCode: number;
}

function extractErrors(error: any) {
    if (error?.name === "ValidationError") {
        return {
            message: Object.values<InvalidationError>(error?.errors)
            .map((value) => value.message).join(", "),
            statusCode: 400,
        };
    }

    if (error?.response?.data?.message) {
        return {
            message: error.response.data.message,
            statusCode: 400,
        };
    }
    if (error?.message) {
        return {
            message: error.message,
            statusCode: 400,
        };
    }
    return {
        message: error.message || "An unexpected error occurred",
        statusCode: error.statusCode || 500,
    }
}

export const catchAsyncErrors = (handler: HandlerFunction) => async (...args: any[]) => {
    try {
        return await handler(...args);
    } catch (error) {
        const {message, statusCode} = extractErrors(error);
        console.error("Error message:", message, "Status code:", statusCode);
        return {
            error: {
                message,
                statusCode,
            },
        };
    }
}