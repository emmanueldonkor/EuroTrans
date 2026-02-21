using EuroTrans.Api.Identity;
using Microsoft.AspNetCore.Authorization;

namespace EuroTrans.Api.Extensions;

public static class AuthorizationServiceCollectionExtensions
{
    public static IServiceCollection AddApiAuthorization(this IServiceCollection services, IConfiguration configuration)
    {
        var tokenIssuer = $"https://{configuration["Auth0:Domain"]}/";

        services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();
        services.AddSingleton<IAuthorizationHandler, HasRoleHandler>();

        services.AddAuthorizationBuilder()
            .AddPolicy("manager", p => p.Requirements.Add(new HasRoleRequirement("manager")))
            .AddPolicy("driver", p => p.Requirements.Add(new HasRoleRequirement("driver")))
            .AddPolicy("read:shipments", p =>
                p.Requirements.Add(new HasScopeRequirement("read:shipments", tokenIssuer)))
            .AddPolicy("write:shipments", p =>
                p.Requirements.Add(new HasScopeRequirement("write:shipments", tokenIssuer)))
            .AddPolicy("sync:users", p =>
                p.Requirements.Add(new HasScopeRequirement("sync:users", tokenIssuer)))
            .AddPolicy("read:trucks", p =>
                p.Requirements.Add(new HasScopeRequirement("read:trucks", tokenIssuer)))
            .AddPolicy("write:trucks", p =>
                p.Requirements.Add(new HasScopeRequirement("write:trucks", tokenIssuer)))
            .AddPolicy("read:employees", p =>
                p.Requirements.Add(new HasScopeRequirement("read:employees", tokenIssuer)))
            .AddPolicy("write:employees", p =>
                p.Requirements.Add(new HasScopeRequirement("write:employees", tokenIssuer)));

        return services;
    }
}
