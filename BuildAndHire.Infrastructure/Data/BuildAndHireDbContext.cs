using BuildAndHire.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BuildAndHire.Infrastructure.Data;

public  class BuildAndHireDbContext : DbContext
{
    public BuildAndHireDbContext(DbContextOptions<BuildAndHireDbContext>options) : base(options){}
    
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Equipment> Equipment { get; set; }
    public DbSet<Companies> Companies { get; set; }
    public DbSet<Jobs> Jobs { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        {
            
        }
    }

}
