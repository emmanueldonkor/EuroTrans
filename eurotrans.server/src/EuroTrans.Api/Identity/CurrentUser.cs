using EuroTrans.Application.Common.Interfaces;

namespace EuroTrans.Api.Identity;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public CurrentUser(IHttpContextAccessor accessor)
    {
        httpContextAccessor = accessor;
    }

    public Guid Id
    {
        get
        {
            var claim = httpContextAccessor.HttpContext?.User?.FindFirst("sub");
            return claim != null ? Guid.Parse(claim.Value) : Guid.Empty;
        }
    }

    public bool IsManager =>
        httpContextAccessor.HttpContext?.User?.IsInRole("manager") ?? false;

    public bool IsDriver =>
        httpContextAccessor.HttpContext?.User?.IsInRole("driver") ?? false;
}
