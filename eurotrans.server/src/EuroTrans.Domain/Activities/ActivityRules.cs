using EuroTrans.Domain.Common;

namespace EuroTrans.Domain.Activities;

public static class ActivityRules
{
    public static void Validate(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new DomainException("Activity description is required.");
    }  
}