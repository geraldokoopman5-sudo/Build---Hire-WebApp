using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using Npgsql;

namespace Build_Hire.API.Validation;

public sealed class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var (status, title) = context.Exception switch
        {
            ValidationException error => (400, error.Message),
            KeyNotFoundException error => (404, error.Message),
            DbUpdateException { InnerException: PostgresException { SqlState: "23505" } }
                => (409, "An account or record with these details already exists."),
            DbUpdateException { InnerException: PostgresException { SqlState: "23503" } }
                => (400, "A referenced record does not exist or is still in use."),
            _ => (0, "")
        };
        if (status == 0) return;
        context.Result = new ObjectResult(new ProblemDetails { Status = status, Title = title })
        { StatusCode = status };
        context.ExceptionHandled = true;
    }
}
