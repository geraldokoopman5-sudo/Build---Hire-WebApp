using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Infrastructure.Data.Seed_data
{
    public class Customer_Seed
    {
        public static void Seed(ModelBuilder modelBuilder)
        {
                modelBuilder.Entity<Customer>().HasData(
         new Customer
         {
             CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000001"),
             CustomerName = "Thandiwe Mahlangu",
             Password = "Password123!",
             Email = "thandiwe.mahlangu@example.com",
             Status = AccountStatus.Active
         },

         new Customer
         {
             CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000002"),
             CustomerName = "Johan van der Berg",
             Password = "Password123!",
             Email = "johan.vdberg@example.com",
             Status = AccountStatus.Active
         },

         new Customer
         {
             CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000003"),
             CustomerName = "Aisha Patel",
             Password = "Password123!",
             Email = "aisha.patel@example.com",
             Status = AccountStatus.Active
         },

         new Customer
         {
             CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000004"),
             CustomerName = "Sipho Ndlovu",
             Password = "Password123!",
             Email = "sipho.ndlovu@example.com",
             Status = AccountStatus.Active
         }
     );
        }
    }
}
