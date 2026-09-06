using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Services;

namespace VehicleServiceAPI.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IBookingService _bookingService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAdminService adminService, IBookingService bookingService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _bookingService = bookingService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");
            return int.Parse(userIdClaim);
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "Customer";
        }

        private int? GetCurrentUserCenterId()
        {
            var centerIdClaim = User.FindFirst("CenterId")?.Value;
            return !string.IsNullOrEmpty(centerIdClaim) ? int.Parse(centerIdClaim) : null;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var role = GetCurrentUserRole();
                int? centerId = role == "Admin" ? GetCurrentUserCenterId() : null;

                var stats = await _adminService.GetDashboardStatsAsync(centerId);
                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard stats");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("reports/revenue")]
        public async Task<IActionResult> GetRevenueReport()
        {
            try
            {
                var role = GetCurrentUserRole();
                int? centerId = role == "Admin" ? GetCurrentUserCenterId() : null;

                var reports = await _adminService.GetRevenueReportAsync(centerId);
                return Ok(new { success = true, data = reports });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue report");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("audit-logs")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] string tableName = null)
        {
            try
            {
                var logs = await _adminService.GetAuditLogsAsync(tableName);
                return Ok(new { success = true, count = logs.Count(), data = logs });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting audit logs");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _adminService.GetAllUsersAsync();
                return Ok(new { success = true, count = users.Count(), data = users });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _adminService.GetUserByIdAsync(id);
                return Ok(new { success = true, data = user });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting user {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("users/{id}/role")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto roleDto)
        {
            try
            {
                if (id == GetCurrentUserId())
                {
                    return BadRequest(new { success = false, message = "Cannot change your own role" });
                }

                await _adminService.UpdateUserRoleAsync(id, roleDto);
                return Ok(new { success = true, message = "User role updated successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating user role {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("technicians")]
        public async Task<IActionResult> GetAllTechnicians()
        {
            try
            {
                var role = GetCurrentUserRole();
                int? centerId = role == "Admin" ? GetCurrentUserCenterId() : null;

                var technicians = await _adminService.GetAllTechniciansAsync(centerId);
                return Ok(new { success = true, count = technicians.Count(), data = technicians });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting technicians");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("technicians/{id}")]
        public async Task<IActionResult> GetTechnicianById(int id)
        {
            try
            {
                var technician = await _adminService.GetTechnicianByIdAsync(id);
                return Ok(new { success = true, data = technician });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting technician {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPost("technicians")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> CreateTechnician([FromBody] CreateTechnicianDto createDto)
        {
            try
            {
                var technician = await _adminService.CreateTechnicianAsync(createDto);
                return CreatedAtAction(
                    nameof(GetTechnicianById),
                    new { id = technician.Id },
                    new { success = true, message = "Technician created successfully", data = technician }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating technician");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("technicians/{id}")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> UpdateTechnician(int id, [FromBody] UpdateTechnicianDto updateDto)
        {
            try
            {
                var technician = await _adminService.UpdateTechnicianAsync(id, updateDto);
                return Ok(new { success = true, message = "Technician updated successfully", data = technician });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating technician {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpDelete("technicians/{id}")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> DeleteTechnician(int id)
        {
            try
            {
                await _adminService.DeleteTechnicianAsync(id);
                return Ok(new { success = true, message = "Technician deleted successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting technician {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("centers")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> GetAllCenters()
        {
            try
            {
                var centers = await _adminService.GetAllCentersAsync();
                return Ok(new { success = true, count = centers.Count(), data = centers });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting centers");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("centers/{id}")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> GetCenterById(int id)
        {
            try
            {
                var center = await _adminService.GetCenterByIdAsync(id);
                return Ok(new { success = true, data = center });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting center {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPost("centers")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> CreateCenter([FromBody] CreateCenterDto createDto)
        {
            try
            {
                var center = await _adminService.CreateCenterAsync(createDto);
                return CreatedAtAction(
                    nameof(GetCenterById),
                    new { id = center.Id },
                    new { success = true, message = "Service center created successfully", data = center }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating center");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("centers/{id}")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> UpdateCenter(int id, [FromBody] UpdateCenterDto updateDto)
        {
            try
            {
                var center = await _adminService.UpdateCenterAsync(id, updateDto);
                return Ok(new { success = true, message = "Service center updated successfully", data = center });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating center {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpDelete("centers/{id}")]
        [Authorize(Policy = "SuperAdminOnly")]
        public async Task<IActionResult> DeleteCenter(int id)
        {
            try
            {
                await _adminService.DeleteCenterAsync(id);
                return Ok(new { success = true, message = "Service center deleted successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting center {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings([FromQuery] BookingFilterDto filters)
        {
            try
            {
                var bookings = await _bookingService.GetAllBookingsAsync(filters);
                return Ok(new { success = true, count = bookings.Count(), data = bookings });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all bookings");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("bookings/{id}/assign")]
        public async Task<IActionResult> AssignTechnician(int id, [FromBody] int technicianId)
        {
            try
            {
                await _bookingService.AssignTechnicianAsync(id, technicianId);
                return Ok(new { success = true, message = "Technician assigned successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error assigning technician to booking {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("bookings/{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] BookingStatusUpdateDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var role = GetCurrentUserRole();

                await _bookingService.UpdateBookingStatusAsync(id, updateDto.Status, updateDto.Notes, role, userId);
                return Ok(new { success = true, message = $"Status updated to {updateDto.Status} successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating booking status {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }
    }
}