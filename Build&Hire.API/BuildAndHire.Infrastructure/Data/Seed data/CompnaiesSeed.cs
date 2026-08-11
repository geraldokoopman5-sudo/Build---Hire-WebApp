using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Infrastructure.Data.Seed_data
{
    public class CompnaiesSeed
    {
        public static void Seed(ModelBuilder modelBuilder)
        {
                    modelBuilder.Entity<Companies>().HasData(
            new Companies
            {
                CompanyId = Guid.Parse("A1111111-0000-0000-0000-000000000001"),
                CompanyName = "Cape Coastal Construction (Pty) Ltd",
                CompanyEmail = "info@capecoastalconstruction.co.za",
                Password = "Password123!",
                Status = AccountStatus.Active,
                RegistrationNumber = "2015/123456/07",
                TaxNumber = "9012345671"
            },

            new Companies
            {
                CompanyId = Guid.Parse("A1111111-0000-0000-0000-000000000002"),
                CompanyName = "Joburg Rise Builders",
                CompanyEmail = "admin@joburgrise.co.za",
                Password = "Password123!",
                Status = AccountStatus.Active,
                RegistrationNumber = "2017/654321/07",
                TaxNumber = "9012345672"
            },

            new Companies
            {
                CompanyId = Guid.Parse("A1111111-0000-0000-0000-000000000003"),
                CompanyName = "Durban Bay Contractors",
                CompanyEmail = "contracts@durbanbay.co.za",
                Password = "Password123!",
                Status = AccountStatus.InActive,
                RegistrationNumber = "2019/789012/07",
                TaxNumber = "9012345673"
            }
        );
        }
    }
}
