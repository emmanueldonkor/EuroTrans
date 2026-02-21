using Microsoft.AspNetCore.Authorization;

namespace EuroTrans.Api.Identity;

public class HasScopeHandler : AuthorizationHandler<HasScopeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        HasScopeRequirement requirement)
    {
        var tokenIssuer = context.User.FindFirst("iss")?.Value;
        if (string.IsNullOrWhiteSpace(tokenIssuer) ||
            !string.Equals(tokenIssuer, requirement.Issuer, StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        if (context.User.HasClaim(c => c.Type == "permissions" && c.Value == requirement.Scope))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        var scopeValues = context.User
            .FindAll(c => c.Type == "scope" || c.Type == "scp")
            .SelectMany(c => c.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

        if (scopeValues.Any(s => s == requirement.Scope))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
