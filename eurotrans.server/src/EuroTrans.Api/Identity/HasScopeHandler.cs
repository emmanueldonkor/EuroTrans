using Microsoft.AspNetCore.Authorization;

namespace EuroTrans.Api.Identity;

public class HasScopeHandler : AuthorizationHandler<HasScopeRequirement>
{
     protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        HasScopeRequirement requirement)
    {
        // Find all scope claims from this issuer
        var scopeClaims = context.User.FindAll(c => c.Type == "scope" && c.Issuer == requirement.Issuer);

        foreach (var claim in scopeClaims)
        {
            var scopes = claim.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (scopes.Contains(requirement.Scope))
            {
                context.Succeed(requirement);
                break;
            }
        }

        return Task.CompletedTask;
    }
}