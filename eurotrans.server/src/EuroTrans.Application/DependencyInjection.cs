using System.Reflection;
using EuroTrans.Application.features.Shipments.CreateShipment;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EuroTrans.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CreateShipmentService>();
         services.AddValidatorsFromAssembly(
            Assembly.GetExecutingAssembly());
        return services;
    }
}