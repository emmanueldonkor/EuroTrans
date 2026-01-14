using EuroTrans.Application.features.Employees.User;

namespace EuroTrans.Api.Endpoints.Employees;

public static class SyncUserEndpoint
{
    public static void MapSyncUserEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/sync-user", async (
            SyncUserRequest request,
            SyncUserService service) =>
        {
            // later: verify caller (Auth0 M2M token / API key)
            var id = await service.SyncAsync(request);
            return Results.Ok(new { EmployeeId = id });
        });
    }
}
