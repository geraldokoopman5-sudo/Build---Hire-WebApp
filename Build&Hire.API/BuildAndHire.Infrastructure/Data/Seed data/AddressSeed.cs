using BuildAndHire.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BuildAndHire.Infrastructure.Data.Seed_data
{
    public static class AddressSeed
    {
        public static void Seed(ModelBuilder modelBuilder)
        {
            // =========================
            // COMPANY ADDRESSES
            // =========================

            modelBuilder.Entity<Companies>()
                .OwnsOne(c => c.address)
                .HasData(
                    new
                    {
                        CompaniesCompanyId = Guid.Parse("A1111111-0000-0000-0000-000000000001"),
                        AddressId = Guid.Parse("F1111111-0000-0000-0000-000000000001"),
                        StreetAddress = "12 Long Street",
                        Suburb = "Cape Town City Centre",
                        City = "Cape Town",
                        Province = "Western Cape",
                        PostalCode = 8001
                    },

                    new
                    {
                        CompaniesCompanyId = Guid.Parse("A1111111-0000-0000-0000-000000000002"),
                        AddressId = Guid.Parse("F1111111-0000-0000-0000-000000000002"),
                        StreetAddress = "45 Jan Smuts Avenue",
                        Suburb = "Rosebank",
                        City = "Johannesburg",
                        Province = "Gauteng",
                        PostalCode = 2196
                    },

                    new
                    {
                        CompaniesCompanyId = Guid.Parse("A1111111-0000-0000-0000-000000000003"),
                        AddressId = Guid.Parse("F1111111-0000-0000-0000-000000000003"),
                        StreetAddress = "78 Marine Parade",
                        Suburb = "Durban Central",
                        City = "Durban",
                        Province = "KwaZulu-Natal",
                        PostalCode = 4001
                    }
                );


            // =========================
            // CUSTOMER ADDRESSES
            // =========================

            modelBuilder.Entity<Customer>()
                .OwnsOne(c => c.address)
                .HasData(
                    new
                    {
                        CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000001"),
                        AddressId = Guid.Parse("F2222222-0000-0000-0000-000000000001"),
                        StreetAddress = "23 Kloof Street",
                        Suburb = "Gardens",
                        City = "Cape Town",
                        Province = "Western Cape",
                        PostalCode = 8001
                    },

                    new
                    {
                        CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000002"),
                        AddressId = Guid.Parse("F2222222-0000-0000-0000-000000000002"),
                        StreetAddress = "9 Voortrekker Road",
                        Suburb = "Bellville",
                        City = "Cape Town",
                        Province = "Western Cape",
                        PostalCode = 7530
                    },

                    new
                    {
                        CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000003"),
                        AddressId = Guid.Parse("F2222222-0000-0000-0000-000000000003"),
                        StreetAddress = "156 Oxford Road",
                        Suburb = "Melrose",
                        City = "Johannesburg",
                        Province = "Gauteng",
                        PostalCode = 2196
                    },

                    new
                    {
                        CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000004"),
                        AddressId = Guid.Parse("F2222222-0000-0000-0000-000000000004"),
                        StreetAddress = "34 Point Road",
                        Suburb = "Point",
                        City = "Durban",
                        Province = "KwaZulu-Natal",
                        PostalCode = 4001
                    }
                );
        }
    }
}