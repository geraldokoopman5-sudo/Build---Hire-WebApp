using System;
using Microsoft.EntityFrameworkCore;
using BuildAndHire.Domain.Entities;
using BuildAndHire.Domain.Models;

namespace BuildAndHire.Infrastructure.Data
{
    public class BuildAndHireDbContext : DbContext
    {
        public BuildAndHireDbContext(DbContextOptions<BuildAndHireDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }}
        public DbSet<Companies> Companies { get; set; }
        public DbSet<Workers> Workers { get; set; }
        public DbSet<Jobs> Jobs { get; set; }


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

            modelBuilder.Entity<Jobs>()
            .Property(j => j.JobId)
            .ValueGeneratedOnAdd();

            // Company => Jobs
            modelBuilder.Entity<Jobs>()
            .HasOne(j => j.companies)
            .WithMany(c => c.Jobs)
            .HasForeignKey(j => j.CompanyId);

            // Customer => Jobs
            modelBuilder.Entity<Jobs>()
           .HasOne(j => j.customer)
           .WithMany(c => c.Jobs)
           .HasForeignKey(j => j.CustomerId);

            // Company => Workers
            modelBuilder.Entity<Workers>()
            .HasOne(w => w.ResidingCompany)
            .WithMany(c => c.Workers)
            .HasForeignKey(w => w.CompanyId);

            // Job => Workers
            modelBuilder.Entity<Workers>()
            .HasOne(w => w.Job)
            .WithMany(j => j.Workers)
            .HasForeignKey(w => w.JobId);

            // Owned value objects
            modelBuilder.Entity<Companies>().OwnsOne(c => c.address);
            modelBuilder.Entity<Customer>().OwnsOne(c => c.address);
            modelBuilder.Entity<Jobs>().OwnsOne(j => j.address);
        }
    }
