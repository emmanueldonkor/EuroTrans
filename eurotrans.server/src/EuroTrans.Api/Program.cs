using Asp.Versioning;
using EuroTrans.Api;
using EuroTrans.Api.Endpoints;
using EuroTrans.Api.Extensions;
using EuroTrans.Api.Middlewares;
using EuroTrans.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApiCoreServices(builder.Configuration)
    .AddApiHealthChecks()
    .AddApiVersioningSupport()
    .AddApiLogging(builder.Configuration)
    .AddApiRateLimiting(builder.Configuration)
    .AddEurotransCors(builder.Configuration, builder.Environment)
    .AddApiAuthentication(builder.Configuration)
    .AddApiAuthorization(builder.Configuration)
    .AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();

app.UseCors("Eurotrans");

var disableAutoMigrate = app.Configuration.GetValue<bool>("Database:DisableAutoMigrate");
if (app.Environment.IsDevelopment() && !disableAutoMigrate)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

var swaggerEnabled = app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("Swagger:Enabled");
var swaggerRequireAuth = app.Configuration.GetValue<bool>("Swagger:RequireAuth");

app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseAuthentication();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseRateLimiter();
app.UseAuthorization();
app.UseMiddleware<EnsureCurrentUserMiddleware>();
app.UseAntiforgery();

if (swaggerEnabled && swaggerRequireAuth)
{
    app.UseWhen(
        context => context.Request.Path.StartsWithSegments("/swagger"),
        branch =>
        {
            branch.Use(async (context, next) =>
            {
                if (context.User.Identity?.IsAuthenticated != true)
                {
                    await context.ChallengeAsync();
                    return;
                }

                await next();
            });
        });
}

if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "EuroTrans API v1");
        options.DisplayRequestDuration();
    });
}

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live"),
}).AllowAnonymous();

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
}).AllowAnonymous();

var v1 = app.NewApiVersionSet()
    .HasApiVersion(new ApiVersion(1, 0))
    .ReportApiVersions()
    .Build();

app.MapGroup(string.Empty)
    .WithApiVersionSet(v1)
    .MapToApiVersion(new ApiVersion(1, 0))
    .MapAllEndpoints();

app.Run();

public partial class Program;

