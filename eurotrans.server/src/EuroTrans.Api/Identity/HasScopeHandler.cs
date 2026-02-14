using Microsoft.AspNetCore.Authorization;

namespace EuroTrans.Api.Identity;

public class HasScopeHandler : AuthorizationHandler<HasScopeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        HasScopeRequirement requirement)
    {
        var scopeClaims = context.User.FindAll(c =>
            c.Type == "scope" && c.Issuer == requirement.Issuer);

        var permissionClaims = context.User.FindAll(c =>
            c.Type == "permissions" && c.Issuer == requirement.Issuer);

        foreach (var claim in scopeClaims)
        {
            var scopes = claim.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (scopes.Contains(requirement.Scope))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
        }

        foreach (var claim in permissionClaims)
        {
            var permissions = claim.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (permissions.Contains(requirement.Scope))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
        }

        return Task.CompletedTask;
    }
}
