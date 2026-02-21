using Auth0.AspNetCore.Authentication.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace EuroTrans.Api.Extensions;

public static class AuthenticationServiceCollectionExtensions
{
    public static IServiceCollection AddApiAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var auth0Domain = configuration["Auth0:Domain"];
        var auth0Audience = configuration["Auth0:Audience"];
        var audienceClaimPrefix = auth0Audience?.TrimEnd('/');

        services.AddAuth0ApiAuthentication(options =>
        {
            options.Domain = auth0Domain;
            options.JwtBearerOptions = new JwtBearerOptions
            {
                Audience = auth0Audience,
                MapInboundClaims = false,
                TokenValidationParameters =
                {
                    RoleClaimType = $"{audienceClaimPrefix}/roles"
                }
            };
        });

        return services;
    }
}
