using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace EuroTrans.Api.Identity;

public class HasRoleHandler : AuthorizationHandler<HasRoleRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        HasRoleRequirement requirement)
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Task.CompletedTask;

        var role = requirement.Role;

        if (context.User.IsInRole(role))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        var roleClaims = context.User.Claims.Where(c =>
            c.Type == ClaimTypes.Role ||
            c.Type == "role" ||
            c.Type == "roles" ||
            c.Type.EndsWith("/roles", StringComparison.OrdinalIgnoreCase));

        foreach (var claim in roleClaims)
        {
            if (string.Equals(claim.Value, role, StringComparison.OrdinalIgnoreCase))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            var parsedRoles = TryParseJsonArray(claim.Value);
            if (parsedRoles.Any(r => string.Equals(r, role, StringComparison.OrdinalIgnoreCase)))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
        }

        return Task.CompletedTask;
    }

    private static IReadOnlyList<string> TryParseJsonArray(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.TrimStart().StartsWith("["))
            return [];

        try
        {
            var element = JsonSerializer.Deserialize<JsonElement>(value);
            if (element.ValueKind != JsonValueKind.Array)
                return [];

            var result = new List<string>();
            foreach (var item in element.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String)
                    result.Add(item.GetString() ?? string.Empty);
            }

            return result;
        }
        catch
        {
            return [];
        }
    }
}
