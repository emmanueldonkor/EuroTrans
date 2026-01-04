namespace EuroTrans.Application.Common.Interfaces;

public interface ICurrentUser
{
    Guid Id { get; }
    bool IsManager { get; }
    bool IsDriver { get; }
}
