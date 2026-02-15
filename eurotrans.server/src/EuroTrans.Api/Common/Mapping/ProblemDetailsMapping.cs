using ErrorOr;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Common.Mapping;

public static class ProblemDetailsMapping
{
    public static IResult ToProblem(this List<Error> errors)
    {
        if (errors.Count is 0)
        {
            return Results.Problem();
        }

        if (errors.All(error => error.Type == ErrorType.Validation))
        {
            return Results.ValidationProblem(
                errors.ToDictionary(
                    e => e.Code,
                    e => new[] { e.Description }
                ));
        }

        return errors[0].Type switch
        {
            ErrorType.Conflict => Results.Conflict(CreateProblemDetails(errors[0])),
            ErrorType.Validation => Results.ValidationProblem(
                errors.ToDictionary(
                    e => e.Code,
                    e => new[] { e.Description }
                )),
            ErrorType.NotFound => Results.NotFound(CreateProblemDetails(errors[0])),
            ErrorType.Unauthorized => Results.Problem(detail: errors[0].Description, statusCode: StatusCodes.Status401Unauthorized, title: errors[0].Code),
            ErrorType.Forbidden => Results.Problem(detail: errors[0].Description, statusCode: StatusCodes.Status403Forbidden, title: errors[0].Code),
            _ => Results.Problem(detail: errors[0].Description, statusCode: StatusCodes.Status500InternalServerError, title: errors[0].Code)
        };
    }

    private static ProblemDetails CreateProblemDetails(Error error)
    {
        return new ProblemDetails
        {
            Title = error.Code,
            Detail = error.Description,
            Status = error.Type switch
            {
                ErrorType.Conflict => StatusCodes.Status409Conflict,
                ErrorType.Validation => StatusCodes.Status400BadRequest,
                ErrorType.NotFound => StatusCodes.Status404NotFound,
                ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
                ErrorType.Forbidden => StatusCodes.Status403Forbidden,
                _ => StatusCodes.Status500InternalServerError
            }
        };
    }
}
