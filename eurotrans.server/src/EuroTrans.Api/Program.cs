using EuroTrans.Api.Endpoints;
using EuroTrans.Api.Identity;
using EuroTrans.Application;
using EuroTrans.Application.Common.Interfaces;
using EuroTrans.Infrastructure;
using EuroTrans.Infrastructure.Persistence;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
           options.UseSqlite(builder.Configuration.GetConnectionString("Default")));
           
builder.Services.AddApplication()
                .AddInfrastructure();

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<ICurrentUser, CurrentUser>();

builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


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

app.MapCreateShipmentEndpoint();
app.Run();

