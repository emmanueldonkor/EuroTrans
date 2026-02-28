using Asp.Versioning;

namespace EuroTrans.Api.Extensions;

public static class ApiVersioningServiceCollectionExtensions
{
    public static IServiceCollection AddApiVersioningSupport(this IServiceCollection services)
    {
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
            options.ApiVersionReader = ApiVersionReader.Combine(
                new QueryStringApiVersionReader("api-version"),
                new HeaderApiVersionReader("x-api-version"));
        });

        return services;
    }
}
