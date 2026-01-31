const errorHandler = (error, req, res, next) => {
    const errorStatus = error.statusCode || 500;
    let title = '';

    switch(errorStatus){
        case 400:
            title = "Bad request";
            break;
        case 401:
            title = "Incorrect authentication credentials";
            break;
        case 403:
            title = "Forbidden access";
            break;
        case 404:
            title = "Not found";
            break;
        case 408:
            title = "Request timeout";
            break;
        case 409:
            title = "Conflicte error";
            break;
        case 422:
            title = "Unprocessable content";
            break;
        case 500:
            title = "Server error";
            break;
    }
    res.status(errorStatus).json({
        title,
        message: error.message,
        stackTrace: process.env.NODE_ENV === 'production'? '' : error.stack,
    })
}

export default errorHandler;