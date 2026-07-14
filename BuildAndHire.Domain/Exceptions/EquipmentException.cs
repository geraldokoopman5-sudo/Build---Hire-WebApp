using System.Data;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace BuildAndHire.Domain.Exceptions;

public static class EquipmentException
{
    public static bool Overlap(DateTime date1, DateTime end1, DateTime date2, DateTime end2)
    {
        return date1 < end1 && date2 < end2;
    }

    public static decimal Rentcalculator(int numberofDays, decimal daylyrate)
    {
        return daylyrate * numberofDays;
    }
    
      public static int DaysRented(DateTime start, DateTime end)
    {
        int days = (end.Date - start.Date).Days;
        return Math.Max(days, 1);
    }
}
