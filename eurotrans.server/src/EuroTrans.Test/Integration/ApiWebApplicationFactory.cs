using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace EuroTrans.Test.Integration;

public sealed class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureLogging(logging => logging.ClearProviders());

        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            var testConfig = new Dictionary<string, string?>
            {
                ["Auth0:Domain"] = "example.us.auth0.com",
                ["Auth0:Audience"] = "https://api.eurotrans.test",
                ["AzureStorage:ConnectionString"] = "UseDevelopmentStorage=true",
                ["AzureStorage:Container"] = "eurotrans-test",
                ["Database:DisableAutoMigrate"] = "true",
            };

            configBuilder.AddInMemoryCollection(testConfig);
        });

        builder.ConfigureServices(services =>
        {
            services.AddDataProtection()
                .UseEphemeralDataProtectionProvider();
        });
    }
}
