using BuildAndHire.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Reflection.Emit;

namespace BuildAndHire.Infrastructure.Data
{
    public class BuildAndHireDbContext : DbContext
    {
        public BuildAndHireDbContext(DbContextOptions<BuildAndHireDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Companies> Companies { get; set; }
        public DbSet<Workers> Workers { get; set; }
        public DbSet<Jobs> Jobs { get; set; }
        public DbSet<Payment> Payment { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //Inintailising Primary Keys
            modelBuilder.Entity<Customer>()
            .HasKey(c => c.CustomerId);

            modelBuilder.Entity<Companies>()
            .HasKey(c => c.CompanyId);

            modelBuilder.Entity<Workers>()
           .HasKey(w => w.WorkerId);

            modelBuilder.Entity<Jobs>()
            .HasKey(j => j.JobId);

            modelBuilder.Entity<Payment>()
                .HasKey(p => p.PaymentId);

            modelBuilder.Entity<Jobs>()
            .Property(j => j.JobId)
            .ValueGeneratedOnAdd();


            modelBuilder.Entity<Customer>()
                .HasIndex(e => e.Email)
                .IsUnique();

            modelBuilder.Entity<Companies>()
                .HasIndex(e => e.CompanyEmail)
                .IsUnique();

            //Relatioships
            modelBuilder.Entity<Workers>()
             .HasOne(w => w.ResidingCompany)
             .WithMany(c => c.Workers)
            .HasForeignKey(w => w.CompanyId)
            .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Jobs>()
            .HasOne(j => j.companies)
            .WithMany(c => c.Jobs)
            .HasForeignKey(j => j.CompanyId)
            .OnDelete(DeleteBehavior.NoAction); 

            modelBuilder.Entity<Jobs>()
            .HasOne(j => j.customer)
            .WithMany(c => c.Jobs)
            .HasForeignKey(j => j.CustomerId)
            .OnDelete(DeleteBehavior.NoAction); 

            modelBuilder.Entity<Workers>()
            .HasOne(w => w.Job)
            .WithMany(j => j.Workers)
            .HasForeignKey(w => w.JobId)
            .OnDelete(DeleteBehavior.NoAction); ;

            modelBuilder.Entity<Payment>()
            .HasOne(p => p.Job)
            .WithOne(j => j.Payment)
            .HasForeignKey<Payment>(p => p.JobId)
            .OnDelete(DeleteBehavior.NoAction); ;

            modelBuilder.Entity<Payment>()
            .Property(p => p.PaymentId)
            .ValueGeneratedOnAdd();

            modelBuilder.Entity<Companies>()
            .OwnsOne(c => c.address);

            modelBuilder.Entity<Customer>()
                .OwnsOne(c => c.address);

            modelBuilder.Entity<Jobs>()
                .OwnsOne(j => j.address);

            //decimal standings

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Jobs>()
                .Property(j => j.DailyRate)
                .HasPrecision(10, 2);

            CompnaiesSeed.Seed(modelBuilder);
            Customer_Seed.Seed(modelBuilder);
            AddressSeed.Seed(modelBuilder);
        }


    }
}