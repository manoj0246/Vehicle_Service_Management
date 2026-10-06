using Microsoft.EntityFrameworkCore;
using VehicleServiceAPI.Data;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Models;

namespace VehicleServiceAPI.Services
{
    public class TechnicianService : ITechnicianService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TechnicianService> _logger;

        private static readonly Dictionary<string, List<string>> _validTransitions = new()
        {
            ["Confirmed"] = new() { "InProgress", "Cancelled" },
            ["InProgress"] = new() { "Completed" }
        };

        public TechnicianService(ApplicationDbContext context, ILogger<TechnicianService> logger)
        {
            _context = context;
            _logger = logger;
        }

        private async Task<Technician> GetTechnicianByUserIdAsync(int userId)
        {
            var technician = await _context.Technicians
                .Include(t => t.User)
                .Include(t => t.Center)
                .FirstOrDefaultAsync(t => t.UserId == userId && !t.IsDeleted);

            if (technician == null)
                throw new KeyNotFoundException($"Technician profile not found for user ID {userId}");

            return technician;
        }

        public async Task<IEnumerable<BookingResponseDto>> GetAssignedRequestsAsync(int userId)
        {
            var technician = await GetTechnicianByUserIdAsync(userId);

            var bookings = await _context.ServiceRequests
                .Include(sr => sr.Vehicle)
                .Include(sr => sr.Service)
                .Include(sr => sr.Customer)
                .Include(sr => sr.Technician)
                .ThenInclude(t => t.User)
                .Where(sr => sr.TechnicianId == technician.Id
                    && sr.Status != "Completed"
                    && sr.Status != "Cancelled")
                .OrderBy(sr => sr.ScheduledDate)
                .ToListAsync();

            var dtos = new List<BookingResponseDto>();
            foreach (var booking in bookings)
            {
                dtos.Add(await MapToBookingResponse(booking));
            }
            return dtos;
        }

        public async Task<BookingResponseDto> GetAssignedRequestByIdAsync(int bookingId, int userId)
        {
            var technician = await GetTechnicianByUserIdAsync(userId);

            var booking = await _context.ServiceRequests
                .Include(sr => sr.Vehicle)
                .Include(sr => sr.Service)
                .Include(sr => sr.Customer)
                .Include(sr => sr.Technician)
                .ThenInclude(t => t.User)
                .FirstOrDefaultAsync(sr => sr.Id == bookingId);

            if (booking == null)
                throw new KeyNotFoundException($"Booking with ID {bookingId} not found");

            if (booking.TechnicianId != technician.Id)
                throw new UnauthorizedAccessException("You are not assigned to this booking");

            return await MapToBookingResponse(booking);
        }

        public async Task<bool> UpdateRequestStatusAsync(int bookingId, int userId, string status, string notes)
        {
            var technician = await GetTechnicianByUserIdAsync(userId);

            var booking = await _context.ServiceRequests
                .FirstOrDefaultAsync(sr => sr.Id == bookingId);

            if (booking == null)
                throw new KeyNotFoundException($"Booking with ID {bookingId} not found");

            if (booking.TechnicianId != technician.Id)
                throw new UnauthorizedAccessException("You are not assigned to this booking");

            if (!_validTransitions.ContainsKey(booking.Status))
                throw new InvalidOperationException($"Invalid current status: {booking.Status}");

            if (!_validTransitions[booking.Status].Contains(status))
                throw new InvalidOperationException($"Cannot transition from {booking.Status} to {status}");

            booking.Status = status;
            booking.Notes = string.IsNullOrEmpty(notes) ? booking.Notes : notes;
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Technician {technician.Id} updated booking {bookingId} to {status}");

            return true;
        }

        public async Task<IEnumerable<BookingResponseDto>> GetDailyScheduleAsync(int userId, DateTime? date = null)
        {
            var technician = await GetTechnicianByUserIdAsync(userId);

            var targetDate = date.HasValue
                ? (date.Value.Kind == DateTimeKind.Utc ? date.Value.Date : DateTime.SpecifyKind(date.Value.Date, DateTimeKind.Utc))
                : DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

            var startDate = targetDate;
            var endDate = targetDate.AddDays(1);

            var bookings = await _context.ServiceRequests
                .Include(sr => sr.Vehicle)
                .Include(sr => sr.Service)
                .Include(sr => sr.Customer)
                .Include(sr => sr.Technician)
                .ThenInclude(t => t.User)
                .Where(sr => sr.TechnicianId == technician.Id
                    && sr.ScheduledDate >= startDate
                    && sr.ScheduledDate < endDate
                    && sr.Status != "Cancelled")
                .OrderBy(sr => sr.ScheduledDate)
                .ToListAsync();

            var dtos = new List<BookingResponseDto>();
            foreach (var booking in bookings)
            {
                dtos.Add(await MapToBookingResponse(booking));
            }
            return dtos;
        }

        public async Task<DashboardStatsDto> GetTechnicianDashboardStatsAsync(int userId)
        {
            var technician = await GetTechnicianByUserIdAsync(userId);

            var bookings = await _context.ServiceRequests
                .Include(sr => sr.Customer)
                .Include(sr => sr.Vehicle)
                .Include(sr => sr.Service)
                .Where(sr => sr.TechnicianId == technician.Id)
                .ToListAsync();

            var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
            var tomorrow = today.AddDays(1);

            var recentBookings = bookings
                .Where(b => b.ScheduledDate >= today && b.ScheduledDate < tomorrow)
                .OrderBy(b => b.ScheduledDate)
                .Take(5)
                .Select(b => new RecentBookingDto
                {
                    Id = b.Id,
                    CustomerName = b.Customer?.Name ?? "Unknown",
                    VehicleName = b.Vehicle != null ? $"{b.Vehicle.Make} {b.Vehicle.Model}" : "Unknown",
                    ServiceName = b.Service?.Name ?? "Unknown",
                    Status = b.Status,
                    ScheduledDate = b.ScheduledDate
                })
                .ToList();

            return new DashboardStatsDto
            {
                TotalBookings = bookings.Count,
                PendingBookings = bookings.Count(b => b.Status == "Pending"),
                ConfirmedBookings = bookings.Count(b => b.Status == "Confirmed"),
                InProgressBookings = bookings.Count(b => b.Status == "InProgress"),
                CompletedBookings = bookings.Count(b => b.Status == "Completed"),
                CancelledBookings = bookings.Count(b => b.Status == "Cancelled"),
                RecentBookings = recentBookings
            };
        }

        public async Task<IEnumerable<TechnicianAvailabilityDto>> GetMyAvailabilityAsync(int userId)
        {
            var technician = await GetTechnicianByUserIdAsync(userId);

            var availabilities = await _context.TechnicianAvailabilities
                .Where(a => a.TechnicianId == technician.Id)
                .OrderBy(a => a.DayOfWeek)
                .ToListAsync();

            return availabilities.Select(a => new TechnicianAvailabilityDto
            {
                DayOfWeek = a.DayOfWeek,
                StartTime = a.StartTime,
                EndTime = a.EndTime
            });
        }

        public async Task<bool> UpdateMyAvailabilityAsync(int userId, List<TechnicianAvailabilityDto> availabilities)
        {
            var technician = await GetTechnicianByUserIdAsync(userId);

            var existing = await _context.TechnicianAvailabilities
                .Where(a => a.TechnicianId == technician.Id)
                .ToListAsync();

            _context.TechnicianAvailabilities.RemoveRange(existing);

            if (availabilities != null)
            {
                foreach (var dto in availabilities)
                {
                    _context.TechnicianAvailabilities.Add(new TechnicianAvailability
                    {
                        TechnicianId = technician.Id,
                        DayOfWeek = dto.DayOfWeek,
                        StartTime = dto.StartTime,
                        EndTime = dto.EndTime
                    });
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Technician {technician.Id} availability updated");

            return true;
        }

        private async Task<BookingResponseDto> MapToBookingResponse(ServiceRequest booking)
        {
            var customer = await _context.Users.FindAsync(booking.CustomerId);
            var vehicle = await _context.Vehicles.FindAsync(booking.VehicleId);
            var service = await _context.Services.FindAsync(booking.ServiceId);

            string technicianName = "Not Assigned";
            if (booking.TechnicianId.HasValue)
            {
                var tech = await _context.Technicians
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == booking.TechnicianId.Value);
                if (tech?.User != null)
                {
                    technicianName = tech.User.Name;
                }
            }

            return new BookingResponseDto
            {
                Id = booking.Id,
                CustomerId = booking.CustomerId,
                CustomerName = customer?.Name ?? "Unknown",
                VehicleId = booking.VehicleId,
                VehicleName = vehicle != null ? $"{vehicle.Make} {vehicle.Model}" : "Unknown",
                LicensePlate = vehicle?.LicensePlate ?? "Unknown",
                ServiceId = booking.ServiceId,
                ServiceName = service?.Name ?? "Unknown",
                ServicePrice = service?.Price ?? 0,
                TechnicianId = booking.TechnicianId,
                TechnicianName = technicianName,
                ScheduledDate = booking.ScheduledDate,
                Status = booking.Status,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt,
                UpdatedAt = booking.UpdatedAt
            };
        }
    }
}