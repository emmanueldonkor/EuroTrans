using System.Security.Claims;
using System.Text.Json;
using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Api.Identity;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public CurrentUser(IHttpContextAccessor accessor)
    {
        httpContextAccessor = accessor;
    }

    public string Auth0UserId => GetAuth0UserId();

    public bool IsManager => HasRole("manager");

    public string Email =>
       GetClaimValue("email");

    public string Name =>
        GetClaimValue("name");

    public bool IsDriver => HasRole("driver");

    private bool HasRole(string role)
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user is null)
            return false;

        if (user.IsInRole(role))
            return true;

        foreach (var claim in user.Claims.Where(c =>
                     c.Type == "role" ||
                     c.Type == "roles" ||
                     c.Type.EndsWith("/roles", StringComparison.OrdinalIgnoreCase)))
        {
            if (string.Equals(claim.Value, role, StringComparison.OrdinalIgnoreCase))
                return true;

            var parsed = TryParseJsonArray(claim.Value);
            if (parsed.Any(v => string.Equals(v, role, StringComparison.OrdinalIgnoreCase)))
                return true;
        }

        return false;
    }

    private static IReadOnlyList<string> TryParseJsonArray(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.TrimStart().StartsWith("["))
            return [];

        try
        {
            var element = JsonSerializer.Deserialize<JsonElement>(value);
            if (element.ValueKind != JsonValueKind.Array)
                return [];

            var result = new List<string>();
            foreach (var item in element.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String)
                    result.Add(item.GetString() ?? string.Empty);
            }

            return result;
        }
        catch
        {
            return [];
        }
    }

    private string GetAuth0UserId()
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user is null)
            return string.Empty;

        return user.FindFirst("sub")?.Value
               ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? user.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value
               ?? string.Empty;
    }

    private string GetClaimValue(string claimName)
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user is null)
            return string.Empty;

        var direct = user.FindFirst(claimName)?.Value;
        if (!string.IsNullOrWhiteSpace(direct))
            return direct;

        var namespaced = user.Claims
            .FirstOrDefault(c => c.Type.EndsWith($"/{claimName}", StringComparison.OrdinalIgnoreCase))
            ?.Value;

        return namespaced ?? string.Empty;
    }
}
