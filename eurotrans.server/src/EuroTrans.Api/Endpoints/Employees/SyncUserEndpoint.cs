using EuroTrans.Api.Common.Mapping;
using EuroTrans.Application.features.Employees.User;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EuroTrans.Api.Endpoints.Employees;

[EuroTrans.Api.Endpoints.ApiEndpoint]
public static class SyncUserEndpoint
{
    public static void MapSyncUserEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/sync-user", async (
    SyncUserRequest request,
    [FromServices] SyncUserService service,
    CancellationToken ct,
    IValidator<SyncUserRequest> validator) =>
{
    var validation = await validator.ValidateAsync(request, ct);
    if (!validation.IsValid)
        return Results.ValidationProblem(validation.ToDictionary());

    var result = await service.SyncAsync(request, ct);
    return result.Match(
        id => Results.Ok(new { EmployeeId = id }),
        errors => errors.ToProblem());
})
.RequireAuthorization("sync:users");

    }
}
