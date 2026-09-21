using Microsoft.EntityFrameworkCore;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            await context.Database.MigrateAsync();

            if (!await context.ServiceCenters.AnyAsync())
            {
                var center1 = new ServiceCenter
                {
                    Name = "AutoCare Downtown Hub",
                    Address = "100 Main St, Downtown",
                    Phone = "+1-555-0100",
                    IsDeleted = false
                };
                var center2 = new ServiceCenter
                {
                    Name = "AutoCare Metro Express",
                    Address = "250 Metro Blvd, Uptown",
                    Phone = "+1-555-0200",
                    IsDeleted = false
                };

                context.ServiceCenters.AddRange(center1, center2);
                await context.SaveChangesAsync();

                if (!await context.Services.AnyAsync())
                {
                    context.Services.AddRange(
                        new Service
                        {
                            Name = "Full Synthetic Oil & Filter Change",
                            Description = "Premium synthetic oil replacement with genuine OEM filter and fluid top-up.",
                            Price = 79.99m,
                            DurationMinutes = 45,
                            CenterId = center1.Id,
                            IsDeleted = false
                        },
                        new Service
                        {
                            Name = "Comprehensive 50-Point Inspection",
                            Description = "Complete health diagnostic including battery, brakes, suspension, and belts.",
                            Price = 129.99m,
                            DurationMinutes = 60,
                            CenterId = center1.Id,
                            IsDeleted = false
                        },
                        new Service
                        {
                            Name = "Complete Brake Pad & Rotor Service",
                            Description = "Front and rear brake rotor inspection, pad replacement, and brake line bleed.",
                            Price = 199.99m,
                            DurationMinutes = 90,
                            CenterId = center2.Id,
                            IsDeleted = false
                        },
                        new Service
                        {
                            Name = "Tire Rotation & Dynamic Balancing",
                            Description = "Four-wheel precision balancing and computerized alignment inspection.",
                            Price = 49.99m,
                            DurationMinutes = 30,
                            CenterId = center2.Id,
                            IsDeleted = false
                        }
                    );
                    await context.SaveChangesAsync();
                }
            }

            var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
            var defaultSuperAdminHash = BCrypt.Net.BCrypt.HashPassword("SuperAdmin123!");
            var defaultTechHash = BCrypt.Net.BCrypt.HashPassword("Tech123!");
            var defaultCustomerHash = BCrypt.Net.BCrypt.HashPassword("Customer123!");

            var defaultCenter = await context.ServiceCenters.FirstOrDefaultAsync();

            if (!await context.Users.AnyAsync(u => u.Email == "superadmin@autocare.com"))
            {
                context.Users.Add(new User
                {
                    Name = "Master SuperAdmin",
                    Email = "superadmin@autocare.com",
                    PasswordHash = defaultSuperAdminHash,
                    Role = "SuperAdmin",
                    CenterId = null,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                });
            }

            if (!await context.Users.AnyAsync(u => u.Email == "admin@autocare.com"))
            {
                context.Users.Add(new User
                {
                    Name = "Downtown Branch Admin",
                    Email = "admin@autocare.com",
                    PasswordHash = defaultPasswordHash,
                    Role = "Admin",
                    CenterId = defaultCenter?.Id,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                });
            }

            if (!await context.Users.AnyAsync(u => u.Email == "customer@autocare.com"))
            {
                var customer = new User
                {
                    Name = "Demo Customer",
                    Email = "customer@autocare.com",
                    PasswordHash = defaultCustomerHash,
                    Role = "Customer",
                    CenterId = null,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                context.Users.Add(customer);
                await context.SaveChangesAsync();

                if (!await context.Vehicles.AnyAsync(v => v.CustomerId == customer.Id))
                {
                    context.Vehicles.Add(new Vehicle
                    {
                        CustomerId = customer.Id,
                        Make = "Toyota",
                        Model = "Camry",
                        Year = 2023,
                        LicensePlate = "KA-01-AB-1234",
                        Color = "Silver Metallic",
                        IsDeleted = false
                    });
                }
            }

            if (!await context.Users.AnyAsync(u => u.Email == "tech@autocare.com"))
            {
                var techUser = new User
                {
                    Name = "Alex Rivera (Lead Tech)",
                    Email = "tech@autocare.com",
                    PasswordHash = defaultTechHash,
                    Role = "Technician",
                    CenterId = defaultCenter?.Id,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                context.Users.Add(techUser);
                await context.SaveChangesAsync();

                if (!await context.Technicians.AnyAsync(t => t.UserId == techUser.Id))
                {
                    context.Technicians.Add(new Technician
                    {
                        UserId = techUser.Id,
                        Specialization = "Engine & Transmission Diagnostics",
                        CenterId = defaultCenter?.Id ?? 1,
                        IsDeleted = false
                    });
                }
            }

            await context.SaveChangesAsync();
        }
    }
}

