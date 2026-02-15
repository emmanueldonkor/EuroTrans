using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Api.Identity;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public CurrentUser(IHttpContextAccessor accessor)
    {
        httpContextAccessor = accessor;
    }

     public string Auth0UserId =>
        httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value ?? string.Empty;

    public bool IsManager =>
        httpContextAccessor.HttpContext?.User?.IsInRole("manager") ?? false;
    
     public string Email =>
        httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value ?? string.Empty;

    public string Name =>
        httpContextAccessor.HttpContext?.User?.FindFirst("name")?.Value ?? string.Empty;

    public bool IsDriver =>
        httpContextAccessor.HttpContext?.User?.IsInRole("driver") ?? false;
}
