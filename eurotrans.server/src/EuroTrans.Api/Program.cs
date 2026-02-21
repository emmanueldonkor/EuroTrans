using EuroTrans.Api;
using EuroTrans.Api.Endpoints;
using EuroTrans.Api.Extensions;
using EuroTrans.Api.Middlewares;
using EuroTrans.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApiCoreServices(builder.Configuration)
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
app.UseAuthorization();
app.UseMiddleware<EnsureCurrentUserMiddleware>();
app.UseAntiforgery();

app.MapAllEndpoints();
app.Run();

