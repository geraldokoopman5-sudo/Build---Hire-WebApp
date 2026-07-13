using System.ComponentModel.DataAnnotations;
using BuildAndHire.Domain.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace BuildAndHire.Domain.Exceptions;

public class RentalException
{
    public static bool Overlap(DateTime date1, DateTime end1, DateTime date2, DateTime end2)
    {
        return date1 < end1 && date2 < end2;
    }

    public static int DaysOnSite(DateTime start, DateTime end)
    {
        int days = (end.Date - start.Date).Days;
        return Math.Max(days, 1);
    }
    
    public static decimal CalculateTotal(decimal DailyRate, int numberOfDays)
    {
        return DailyRate * numberOfDays;
    }
}
