using Microsoft.EntityFrameworkCore;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<ServiceCenter> ServiceCenters { get; set; }
        public DbSet<Technician> Technicians { get; set; }
        public DbSet<TechnicianAvailability> TechnicianAvailabilities { get; set; }
        public DbSet<ServiceRequest> ServiceRequests { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Vehicle>()
                .HasOne(v => v.Customer)
                .WithMany(u => u.Vehicles)
                .HasForeignKey(v => v.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Technician>()
                .HasOne(t => t.User)
                .WithOne(u => u.Technician)
                .HasForeignKey<Technician>(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Service>()
                .HasOne(s => s.Center)
                .WithMany(c => c.Services)
                .HasForeignKey(s => s.CenterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Technician>()
                .HasOne(t => t.Center)
                .WithMany(c => c.Technicians)
                .HasForeignKey(t => t.CenterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TechnicianAvailability>()
                .HasOne(a => a.Technician)
                .WithMany(t => t.Availabilities)
                .HasForeignKey(a => a.TechnicianId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServiceRequest>()
                .HasOne(sr => sr.Customer)
                .WithMany(u => u.ServiceRequests)
                .HasForeignKey(sr => sr.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServiceRequest>()
                .HasOne(sr => sr.Vehicle)
                .WithMany(v => v.ServiceRequests)
                .HasForeignKey(sr => sr.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServiceRequest>()
                .HasOne(sr => sr.Service)
                .WithMany(s => s.ServiceRequests)
                .HasForeignKey(sr => sr.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServiceRequest>()
                .HasOne(sr => sr.Technician)
                .WithMany(t => t.ServiceRequests)
                .HasForeignKey(sr => sr.TechnicianId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Vehicle>().HasIndex(v => v.LicensePlate).IsUnique();

            modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
            modelBuilder.Entity<Vehicle>().HasQueryFilter(v => !v.IsDeleted);
            modelBuilder.Entity<Service>().HasQueryFilter(s => !s.IsDeleted);
            modelBuilder.Entity<ServiceCenter>().HasQueryFilter(c => !c.IsDeleted);
            modelBuilder.Entity<Technician>().HasQueryFilter(t => !t.IsDeleted);
        }
    }
}