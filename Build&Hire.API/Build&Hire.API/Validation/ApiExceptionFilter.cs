using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using Npgsql;

namespace Build_Hire.API.Validation;

public sealed class ApiExceptionFilter(ILogger<ApiExceptionFilter> logger) : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.Exception is OperationCanceledException && context.HttpContext.RequestAborted.IsCancellationRequested)
            return;
        var (status, title) = context.Exception switch
        {
            ValidationException error => (400, error.Message),
            KeyNotFoundException error => (404, error.Message),
            DbUpdateException { InnerException: PostgresException { SqlState: "23505" } }
                => (409, "An account or record with these details already exists."),
            DbUpdateException { InnerException: PostgresException { SqlState: "23503" } }
                => (400, "A referenced record does not exist or is still in use."),
            _ => (500, "An unexpected error occurred.")
        };
        if (status == 500)
            logger.LogError(context.Exception, "Unhandled API exception. Trace ID: {TraceId}", context.HttpContext.TraceIdentifier);
        var problem = new ProblemDetails { Status = status, Title = title };
        problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
        context.Result = new ObjectResult(problem)
        { StatusCode = status };
        context.ExceptionHandled = true;
    }
}
