using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;

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
                    break;

                case InvalidOperationException:
                    statusCode = StatusCodes.Status400BadRequest;
                    response = new { message = exception.Message };
                    break;

                case UnauthorizedAccessException:
                    statusCode = StatusCodes.Status401Unauthorized;
                    response = new { message = exception.Message };
                    break;

                case KeyNotFoundException:
                    statusCode = StatusCodes.Status404NotFound;
                    response = new { message = "Recurso no encontrado" };
                    break;

                default:
                    statusCode = StatusCodes.Status500InternalServerError;
                    response = new
                    {
                        message = "Error interno del servidor",
                        traceId = context.TraceIdentifier
                    };
                    break;
            }

            context.Response.StatusCode = statusCode;
            return context.Response.WriteAsJsonAsync(response);
        }
    }
}
