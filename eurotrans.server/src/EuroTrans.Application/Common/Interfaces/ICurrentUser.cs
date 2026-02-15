namespace EuroTrans.Application.Common.Interfaces;

public interface ICurrentUser
{
    string Auth0UserId { get; }
     string Email { get; }
    string Name { get; }
    bool IsManager { get; }
    bool IsDriver { get; }
}
