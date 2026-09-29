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
             PasswordHash = "Password123!",
             Email = "thandiwe.mahlangu@example.com",
             Status = AccountStatus.Active
         },

         new Customer
         {
             CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000002"),
             CustomerName = "Johan van der Berg",
             PasswordHash = "Password123!",
             Email = "johan.vdberg@example.com",
             Status = AccountStatus.Active
         },

         new Customer
         {
             CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000003"),
             CustomerName = "Aisha Patel",
             PasswordHash = "Password123!",
             Email = "aisha.patel@example.com",
             Status = AccountStatus.Active
         },

         new Customer
         {
             CustomerId = Guid.Parse("B2222222-0000-0000-0000-000000000004"),
             CustomerName = "Sipho Ndlovu",
             PasswordHash = "Password123!",
             Email = "sipho.ndlovu@example.com",
             Status = AccountStatus.Active
         }
     );
        }
    }
}
