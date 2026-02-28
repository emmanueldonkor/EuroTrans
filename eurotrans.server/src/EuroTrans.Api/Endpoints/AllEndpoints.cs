using System.Reflection;

namespace EuroTrans.Api.Endpoints;

public static class AllEndpoints
{
    public static void MapAllEndpoints(this IEndpointRouteBuilder app)
    {
        var endpointMapMethods = typeof(AllEndpoints).Assembly
            .GetTypes()
            .Where(t =>
                t.IsAbstract &&
                t.IsSealed &&
                t != typeof(AllEndpoints) &&
                t.Namespace is not null &&
                t.Namespace.StartsWith("EuroTrans.Api.Endpoints", StringComparison.Ordinal) &&
                t.IsDefined(typeof(ApiEndpointAttribute), inherit: false))
            .SelectMany(t => t.GetMethods(BindingFlags.Public | BindingFlags.Static))
            .Where(IsEndpointMapMethod)
            .OrderBy(m => m.DeclaringType?.FullName, StringComparer.Ordinal)
            .ThenBy(m => m.Name, StringComparer.Ordinal);

        foreach (var method in endpointMapMethods)
        {
            method.Invoke(null, [app]);
        }
    }

    private static bool IsEndpointMapMethod(MethodInfo method)
    {
        if (!method.Name.StartsWith("Map", StringComparison.Ordinal) || method.ReturnType != typeof(void))
            return false;

        var parameters = method.GetParameters();
        return parameters.Length == 1 &&
               typeof(IEndpointRouteBuilder).IsAssignableFrom(parameters[0].ParameterType);
    }
}
