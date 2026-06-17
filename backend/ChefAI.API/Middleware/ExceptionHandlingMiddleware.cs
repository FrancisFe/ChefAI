namespace ChefAI.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var statusCode = StatusCodes.Status500InternalServerError;
            object response;

            switch (exception)
            {
                case ArgumentNullException:
                    statusCode = StatusCodes.Status400BadRequest;
                    response = new { message = "Datos requeridos faltantes" };
                    _logger.LogWarning(exception, "Argument null exception");
                    break;

                case InvalidOperationException:
                    statusCode = StatusCodes.Status400BadRequest;
                    response = new { message = exception.Message };
                    _logger.LogWarning(exception, "Invalid operation exception");
                    break;

                case UnauthorizedAccessException:
                    statusCode = StatusCodes.Status401Unauthorized;
                    response = new { message = exception.Message };
                    _logger.LogWarning(exception, "Unauthorized access exception");
                    break;

                case KeyNotFoundException:
                    statusCode = StatusCodes.Status404NotFound;
                    response = new { message = "Recurso no encontrado" };
                    _logger.LogWarning(exception, "Resource not found");
                    break;

                default:
                    statusCode = StatusCodes.Status500InternalServerError;
                    response = new
                    {
                        message = "Error interno del servidor",
                        traceId = context.TraceIdentifier
                    };
                    _logger.LogError(exception, "Unhandled exception");
                    break;
            }

            context.Response.StatusCode = statusCode;
            return context.Response.WriteAsJsonAsync(response);
        }
    }
}
