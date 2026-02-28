using Asp.Versioning;
using EuroTrans.Api;
using EuroTrans.Api.Endpoints;
using EuroTrans.Api.Extensions;
using EuroTrans.Api.Middlewares;
using EuroTrans.Infrastructure.Persistence;
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

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseAuthentication();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseRateLimiter();
app.UseAuthorization();
app.UseMiddleware<EnsureCurrentUserMiddleware>();
app.UseAntiforgery();

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

