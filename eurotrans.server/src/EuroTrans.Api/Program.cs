using System.Text.Json.Serialization;
using Auth0.AspNetCore.Authentication.Api;
using EuroTrans.Api.Endpoints;
using EuroTrans.Api.Identity;
using EuroTrans.Api.Middlewares;
using EuroTrans.Application;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Infrastructure;
using EuroTrans.Infrastructure.Persistence;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

var domain = $"https://{builder.Configuration["Auth0:Domain"]}/";

builder.Services.AddDbContext<AppDbContext>(options =>
           options.UseSqlite(builder.Configuration.GetConnectionString("Default")));
           
builder.Services.AddApplication()
                .AddInfrastructure();

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<ICurrentUser, CurrentUser>();

builder.Services.AddFluentValidationAutoValidation();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Eurotrans", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddAuth0ApiAuthentication(options =>
{
    options.Domain = builder.Configuration["Auth0:Domain"];
    options.JwtBearerOptions = new JwtBearerOptions
    {
        Audience = builder.Configuration["Auth0:Audience"],
        TokenValidationParameters =
        {
            RoleClaimType  = $"{builder.Configuration["Auth0:Audience"]}/roles"
        }
    };
});

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("manager", p => p.RequireRole("manager"))
    .AddPolicy("driver", p => p.RequireRole("driver"))
    .AddPolicy("read:shipments", p =>
        p.Requirements.Add(new HasScopeRequirement("read:shipments", domain)))
    .AddPolicy("write:shipments", p =>
        p.Requirements.Add(new HasScopeRequirement("write:shipments", domain)))
    .AddPolicy("sync:users", p =>
        p.Requirements.Add(new HasScopeRequirement("sync:users", domain)))
    .AddPolicy("read:trucks", p =>
        p.Requirements.Add(new HasScopeRequirement("read:trucks", domain)))
    .AddPolicy("write:trucks", p =>
        p.Requirements.Add(new HasScopeRequirement("write:trucks", domain)))
    .AddPolicy("read:employees", p =>
        p.Requirements.Add(new HasScopeRequirement("read:employees", domain)))
    .AddPolicy("write:employees", p =>
        p.Requirements.Add(new HasScopeRequirement("write:employees", domain)));

var app = builder.Build();

app.UseCors("Eurotrans");

/*using(var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
} */

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseMiddleware<EnsureCurrentUserMiddleware>();
app.UseAuthorization();

app.MapAllEndpoints();
app.Run();

