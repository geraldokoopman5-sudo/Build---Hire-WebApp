using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Domain.Enums
{
    public enum JobEnum
    {
        // Legacy values remain reserved for migration compatibility.
        Working=1, Unavailable=2, Available=3,
        Requested=4, Accepted=5, InProgress=6, Completed=7, Cancelled=8, Rejected=9
    }
}
