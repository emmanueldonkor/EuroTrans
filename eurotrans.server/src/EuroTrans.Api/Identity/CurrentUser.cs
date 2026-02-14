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

    public bool IsDriver =>
        httpContextAccessor.HttpContext?.User?.IsInRole("driver") ?? false;
}
