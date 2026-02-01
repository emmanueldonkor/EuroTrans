using Auth0.AspNetCore.Authentication.Api;
using EuroTrans.Api.Endpoints;
using EuroTrans.Api.Identity;
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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuth0ApiAuthentication(options =>
{
    options.Domain = builder.Configuration["Auth0:Domain"];
    options.JwtBearerOptions = new JwtBearerOptions
    {
        Audience = builder.Configuration["Auth0:Audience"]
    };
});

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("read:messages", policy =>
        policy.Requirements.Add(new HasScopeRequirement("read:messages", domain)))
    .AddPolicy("write:messages", policy =>
        policy.Requirements.Add(new HasScopeRequirement("write:messages", domain)));


var app = builder.Build();

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
app.UseAuthorization();

app.MapAllEndpoints();
app.Run();

