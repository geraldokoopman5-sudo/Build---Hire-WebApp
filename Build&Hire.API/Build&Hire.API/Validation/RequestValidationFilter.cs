using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Build_Hire.API.Validation;

// Executes every registered request validator, including asynchronous rules.
public sealed class RequestValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null) continue;
            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            foreach (var service in context.HttpContext.RequestServices.GetServices(validatorType))
            {
                if (service is not IValidator validator) continue;
                var result = await validator.ValidateAsync(
                    new ValidationContext<object>(argument), context.HttpContext.RequestAborted);
                foreach (var error in result.Errors)
                    context.ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
        }

        if (!context.ModelState.IsValid)
        {
            context.Result = new BadRequestObjectResult(new ValidationProblemDetails(context.ModelState));
            return;
        }
        await next();
    }
}
