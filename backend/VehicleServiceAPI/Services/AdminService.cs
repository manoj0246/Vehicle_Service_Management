using Microsoft.EntityFrameworkCore;
using VehicleServiceAPI.Data;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminService> _logger;

        public AdminService(ApplicationDbContext context, ILogger<AdminService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(int? centerId = null)
        {
            var query = _context.ServiceRequests.Include(sr => sr.Service).AsQueryable();

            if (centerId.HasValue)
            {
                query = query.Where(sr => sr.Service.CenterId == centerId.Value);
            }

            var bookings = await query.ToListAsync();

            var stats = new DashboardStatsDto
            {
                TotalUsers = await _context.Users.CountAsync(u => !u.IsDeleted),
                TotalVehicles = await _context.Vehicles.CountAsync(v => !v.IsDeleted),
                TotalServices = await _context.Services.CountAsync(s => !s.IsDeleted),
                TotalTechnicians = await _context.Technicians.CountAsync(t => !t.IsDeleted),
                TotalBookings = bookings.Count,
                PendingBookings = bookings.Count(b => b.Status == "Pending"),
                ConfirmedBookings = bookings.Count(b => b.Status == "Confirmed"),
                InProgressBookings = bookings.Count(b => b.Status == "InProgress"),
                CompletedBookings = bookings.Count(b => b.Status == "Completed"),
                CancelledBookings = bookings.Count(b => b.Status == "Cancelled"),
                TotalRevenue = bookings.Where(b => b.Status == "Completed")
                    .Sum(b => b.Service?.Price ?? 0),
                MonthlyBookings = await GetMonthlyBookingsAsync(centerId),
                RecentBookings = await GetRecentBookingsAsync(centerId)
            };

            return stats;
        }

        public async Task<IEnumerable<MonthlyBookingDto>> GetRevenueReportAsync(int? centerId = null)
        {
            return await GetMonthlyBookingsAsync(centerId);
        }

        private async Task<List<MonthlyBookingDto>> GetMonthlyBookingsAsync(int? centerId)
        {
            var query = _context.ServiceRequests
                .Include(sr => sr.Service)
                .Where(sr => sr.Status == "Completed")
                .AsQueryable();

            if (centerId.HasValue)
                query = query.Where(sr => sr.Service.CenterId == centerId.Value);

            var list = await query.ToListAsync();

            var bookings = list
                .GroupBy(sr => new { sr.ScheduledDate.Year, sr.ScheduledDate.Month })
                .Select(g => new MonthlyBookingDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Count = g.Count(),
                    Revenue = g.Sum(sr => sr.Service?.Price ?? 0)
                })
                .OrderByDescending(m => m.Month)
                .Take(12)
                .ToList();

            return bookings;
        }

        private async Task<List<RecentBookingDto>> GetRecentBookingsAsync(int? centerId)
        {
            var query = _context.ServiceRequests
                .Include(sr => sr.Customer)
                .Include(sr => sr.Vehicle)
                .Include(sr => sr.Service)
                .AsQueryable();

            if (centerId.HasValue)
                query = query.Where(sr => sr.Service.CenterId == centerId.Value);

            var bookings = await query
                .OrderByDescending(sr => sr.CreatedAt)
                .Take(10)
                .Select(sr => new RecentBookingDto
                {
                    Id = sr.Id,
                    CustomerName = sr.Customer.Name,
                    VehicleName = sr.Vehicle != null ? sr.Vehicle.Make + " " + sr.Vehicle.Model : "Unknown",
                    ServiceName = sr.Service != null ? sr.Service.Name : "Unknown",
                    Status = sr.Status,
                    ScheduledDate = sr.ScheduledDate
                })
                .ToListAsync();

            return bookings;
        }

        public async Task<IEnumerable<UserManagementDto>> GetAllUsersAsync(int? centerId = null, int? currentUserId = null)
        {
            var query = _context.Users
                .Include(u => u.Technician)
                .ThenInclude(t => t.Center)
                .Include(u => u.ServiceRequests)
                .ThenInclude(sr => sr.Service)
                .Where(u => !u.IsDeleted)
                .AsQueryable();

            if (centerId.HasValue)
            {
                query = query.Where(u =>
                    u.Id == currentUserId ||
                    (
                        u.Role != "SuperAdmin" && u.Role != "Admin" &&
                        (
                            u.CenterId == centerId.Value ||
                            (u.Technician != null && u.Technician.CenterId == centerId.Value) ||
                            u.ServiceRequests.Any(sr => sr.Service != null && sr.Service.CenterId == centerId.Value)
                        )
                    )
                );
            }

            var users = await query.ToListAsync();

            var centers = await _context.ServiceCenters.ToDictionaryAsync(c => c.Id, c => c.Name);

            return users.Select(u => new UserManagementDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                CenterId = u.CenterId ?? u.Technician?.CenterId,
                CenterName = u.Technician?.Center?.Name ?? (u.CenterId.HasValue && centers.ContainsKey(u.CenterId.Value) ? centers[u.CenterId.Value] : null),
                CreatedAt = u.CreatedAt,
                IsDeleted = u.IsDeleted
            });
        }

        public async Task<UserManagementDto> GetUserByIdAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Technician)
                .ThenInclude(t => t.Center)
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

            if (user == null)
                throw new KeyNotFoundException($"User with ID {userId} not found");

            string centerName = user.Technician?.Center?.Name;
            if (string.IsNullOrEmpty(centerName) && user.CenterId.HasValue)
            {
                var center = await _context.ServiceCenters.FindAsync(user.CenterId.Value);
                centerName = center?.Name;
            }

            return new UserManagementDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CenterId = user.CenterId,
                CenterName = centerName,
                CreatedAt = user.CreatedAt,
                IsDeleted = user.IsDeleted
            };
        }

        public async Task<UserManagementDto> CreateAdminAsync(CreateAdminDto createDto)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == createDto.Email);

            if (existingUser != null)
                throw new InvalidOperationException($"User with email {createDto.Email} already exists");

            var center = await _context.ServiceCenters
                .FirstOrDefaultAsync(c => c.Id == createDto.CenterId && !c.IsDeleted);

            if (center == null)
                throw new KeyNotFoundException($"Service center with ID {createDto.CenterId} not found");

            var user = new User
            {
                Name = createDto.Name,
                Email = createDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(createDto.Password),
                Role = "Admin",
                CenterId = createDto.CenterId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Admin user {user.Email} created and assigned to center {center.Name} (ID: {center.Id})");

            return new UserManagementDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CenterId = user.CenterId,
                CenterName = center.Name,
                CreatedAt = user.CreatedAt,
                IsDeleted = user.IsDeleted
            };
        }

        public async Task<bool> UpdateUserRoleAsync(int userId, UpdateUserRoleDto roleDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

            if (user == null)
                throw new KeyNotFoundException($"User with ID {userId} not found");

            user.Role = roleDto.Role;
            user.CenterId = roleDto.CenterId;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"User {user.Email} role updated to {roleDto.Role}");

            return true;
        }

        public async Task<IEnumerable<TechnicianManagementDto>> GetAllTechniciansAsync(int? centerId = null)
        {
            var query = _context.Technicians
                .Include(t => t.User)
                .Include(t => t.Center)
                .Include(t => t.Availabilities)
                .Where(t => !t.IsDeleted);

            if (centerId.HasValue)
                query = query.Where(t => t.CenterId == centerId.Value);

            var technicians = await query.ToListAsync();

            return technicians.Select(MapToTechnicianDto);
        }

        public async Task<TechnicianManagementDto> GetTechnicianByIdAsync(int technicianId)
        {
            var technician = await _context.Technicians
                .Include(t => t.User)
                .Include(t => t.Center)
                .Include(t => t.Availabilities)
                .FirstOrDefaultAsync(t => t.Id == technicianId && !t.IsDeleted);

            if (technician == null)
                throw new KeyNotFoundException($"Technician with ID {technicianId} not found");

            return MapToTechnicianDto(technician);
        }

        public async Task<TechnicianManagementDto> CreateTechnicianAsync(CreateTechnicianDto createDto)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == createDto.Email);

            if (existingUser != null)
                throw new InvalidOperationException($"User with email {createDto.Email} already exists");

            var center = await _context.ServiceCenters
                .FirstOrDefaultAsync(c => c.Id == createDto.CenterId && !c.IsDeleted);

            if (center == null)
                throw new KeyNotFoundException($"Service center with ID {createDto.CenterId} not found");

            var user = new User
            {
                Name = createDto.Name,
                Email = createDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(createDto.Password),
                Role = "Technician",
                CenterId = createDto.CenterId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var technician = new Technician
            {
                UserId = user.Id,
                CenterId = createDto.CenterId,
                Specialization = createDto.Specialization,
                IsDeleted = false
            };

            _context.Technicians.Add(technician);
            await _context.SaveChangesAsync();

            if (createDto.Availabilities != null && createDto.Availabilities.Count > 0)
            {
                foreach (var availDto in createDto.Availabilities)
                {
                    _context.TechnicianAvailabilities.Add(new TechnicianAvailability
                    {
                        TechnicianId = technician.Id,
                        DayOfWeek = availDto.DayOfWeek,
                        StartTime = availDto.StartTime,
                        EndTime = availDto.EndTime
                    });
                }
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation($"Technician {user.Email} created");

            return await GetTechnicianByIdAsync(technician.Id);
        }

        public async Task<TechnicianManagementDto> UpdateTechnicianAsync(int technicianId, UpdateTechnicianDto updateDto)
        {
            var technician = await _context.Technicians
                .Include(t => t.User)
                .Include(t => t.Center)
                .Include(t => t.Availabilities)
                .FirstOrDefaultAsync(t => t.Id == technicianId && !t.IsDeleted);

            if (technician == null)
                throw new KeyNotFoundException($"Technician with ID {technicianId} not found");

            if (technician.User != null)
            {
                technician.User.Name = updateDto.Name;
                technician.User.Email = updateDto.Email;
                technician.User.CenterId = updateDto.CenterId;
            }

            technician.CenterId = updateDto.CenterId;
            technician.Specialization = updateDto.Specialization;

            if (updateDto.Availabilities != null)
            {
                _context.TechnicianAvailabilities.RemoveRange(technician.Availabilities);

                foreach (var availDto in updateDto.Availabilities)
                {
                    _context.TechnicianAvailabilities.Add(new TechnicianAvailability
                    {
                        TechnicianId = technician.Id,
                        DayOfWeek = availDto.DayOfWeek,
                        StartTime = availDto.StartTime,
                        EndTime = availDto.EndTime
                    });
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Technician {technician.User?.Email} updated");

            return await GetTechnicianByIdAsync(technicianId);
        }

        public async Task<bool> DeleteTechnicianAsync(int technicianId)
        {
            var technician = await _context.Technicians
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == technicianId && !t.IsDeleted);

            if (technician == null)
                throw new KeyNotFoundException($"Technician with ID {technicianId} not found");

            var hasActiveBookings = await _context.ServiceRequests
                .AnyAsync(sr => sr.TechnicianId == technicianId
                    && sr.Status != "Completed"
                    && sr.Status != "Cancelled");

            if (hasActiveBookings)
                throw new InvalidOperationException("Cannot delete technician with active bookings");

            technician.IsDeleted = true;
            if (technician.User != null)
            {
                technician.User.IsDeleted = true;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Technician {technicianId} deleted (soft delete)");

            return true;
        }

        public async Task<IEnumerable<CenterManagementDto>> GetAllCentersAsync()
        {
            var centers = await _context.ServiceCenters
                .Include(c => c.Services)
                .Include(c => c.Technicians)
                .Where(c => !c.IsDeleted)
                .ToListAsync();

            return centers.Select(c => new CenterManagementDto
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                Phone = c.Phone,
                ServiceCount = c.Services?.Count(s => !s.IsDeleted) ?? 0,
                TechnicianCount = c.Technicians?.Count(t => !t.IsDeleted) ?? 0,
                IsDeleted = c.IsDeleted
            });
        }

        public async Task<CenterManagementDto> GetCenterByIdAsync(int centerId)
        {
            var center = await _context.ServiceCenters
                .Include(c => c.Services)
                .Include(c => c.Technicians)
                .FirstOrDefaultAsync(c => c.Id == centerId && !c.IsDeleted);

            if (center == null)
                throw new KeyNotFoundException($"Service center with ID {centerId} not found");

            return new CenterManagementDto
            {
                Id = center.Id,
                Name = center.Name,
                Address = center.Address,
                Phone = center.Phone,
                ServiceCount = center.Services?.Count(s => !s.IsDeleted) ?? 0,
                TechnicianCount = center.Technicians?.Count(t => !t.IsDeleted) ?? 0,
                IsDeleted = center.IsDeleted
            };
        }

        public async Task<CenterManagementDto> CreateCenterAsync(CreateCenterDto createDto)
        {
            var center = new ServiceCenter
            {
                Name = createDto.Name,
                Address = createDto.Address,
                Phone = createDto.Phone,
                IsDeleted = false
            };

            _context.ServiceCenters.Add(center);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Service center {center.Name} created");

            return await GetCenterByIdAsync(center.Id);
        }

        public async Task<CenterManagementDto> UpdateCenterAsync(int centerId, UpdateCenterDto updateDto)
        {
            var center = await _context.ServiceCenters
                .FirstOrDefaultAsync(c => c.Id == centerId && !c.IsDeleted);

            if (center == null)
                throw new KeyNotFoundException($"Service center with ID {centerId} not found");

            center.Name = updateDto.Name;
            center.Address = updateDto.Address;
            center.Phone = updateDto.Phone;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Service center {center.Name} updated");

            return await GetCenterByIdAsync(centerId);
        }

        public async Task<bool> DeleteCenterAsync(int centerId)
        {
            var center = await _context.ServiceCenters
                .FirstOrDefaultAsync(c => c.Id == centerId && !c.IsDeleted);

            if (center == null)
                throw new KeyNotFoundException($"Service center with ID {centerId} not found");

            var hasServices = await _context.Services
                .AnyAsync(s => s.CenterId == centerId && !s.IsDeleted);
            var hasTechnicians = await _context.Technicians
                .AnyAsync(t => t.CenterId == centerId && !t.IsDeleted);

            if (hasServices || hasTechnicians)
                throw new InvalidOperationException("Cannot delete center with active services or technicians");

            center.IsDeleted = true;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Service center {center.Name} deleted (soft delete)");

            return true;
        }

        public async Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync(string tableName = null)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(tableName))
                query = query.Where(a => a.TableName == tableName);

            var logs = await query
                .OrderByDescending(a => a.ChangedAt)
                .Take(100)
                .ToListAsync();

            return logs.Select(a => new AuditLogDto
            {
                Id = a.Id,
                TableName = a.TableName,
                RecordId = a.RecordId,
                Action = a.Action,
                ChangedBy = a.ChangedBy,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                ChangedAt = a.ChangedAt
            });
        }

        private TechnicianManagementDto MapToTechnicianDto(Technician technician)
        {
            return new TechnicianManagementDto
            {
                Id = technician.Id,
                UserId = technician.UserId,
                Name = technician.User?.Name,
                Email = technician.User?.Email,
                CenterId = technician.CenterId,
                CenterName = technician.Center?.Name,
                Specialization = technician.Specialization,
                IsDeleted = technician.IsDeleted,
                Availabilities = technician.Availabilities != null
                    ? technician.Availabilities.Select(a => new TechnicianAvailabilityDto
                    {
                        DayOfWeek = a.DayOfWeek,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime
                    }).ToList()
                    : new List<TechnicianAvailabilityDto>()
            };
        }
    }
}