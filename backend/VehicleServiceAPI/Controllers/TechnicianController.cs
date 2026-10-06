using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Services;

namespace VehicleServiceAPI.Controllers
{
    [ApiController]
    [Route("api/technician")]
    [Authorize(Policy = "TechnicianOnly")]
    public class TechnicianController : ControllerBase
    {
        private readonly ITechnicianService _technicianService;
        private readonly ILogger<TechnicianController> _logger;

        public TechnicianController(ITechnicianService technicianService, ILogger<TechnicianController> logger)
        {
            _technicianService = technicianService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");
            return int.Parse(userIdClaim);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await _technicianService.GetTechnicianDashboardStatsAsync(userId);

                return Ok(new { success = true, data = stats });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting technician dashboard stats");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("jobs")]
        public async Task<IActionResult> GetAssignedJobs()
        {
            try
            {
                var userId = GetCurrentUserId();
                var requests = await _technicianService.GetAssignedRequestsAsync(userId);

                return Ok(new { success = true, count = requests.Count(), data = requests });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting assigned jobs");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("jobs/{id}")]
        public async Task<IActionResult> GetAssignedJobById(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var request = await _technicianService.GetAssignedRequestByIdAsync(id, userId);

                return Ok(new { success = true, data = request });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting assigned job {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("jobs/{id}/status")]
        public async Task<IActionResult> UpdateJobStatus(int id, [FromBody] BookingStatusUpdateDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _technicianService.UpdateRequestStatusAsync(id, userId, updateDto.Status, updateDto.Notes);

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
                _logger.LogError(ex, $"Error updating job status {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("schedule")]
        public async Task<IActionResult> GetDailySchedule([FromQuery] DateTime? date = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var schedule = await _technicianService.GetDailyScheduleAsync(userId, date);

                return Ok(new { success = true, count = schedule.Count(), data = schedule });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting schedule");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("availability")]
        public async Task<IActionResult> GetAvailability()
        {
            try
            {
                var userId = GetCurrentUserId();
                var availability = await _technicianService.GetMyAvailabilityAsync(userId);

                return Ok(new { success = true, data = availability });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availability");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("availability")]
        public async Task<IActionResult> UpdateAvailability([FromBody] List<TechnicianAvailabilityDto> availabilities)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _technicianService.UpdateMyAvailabilityAsync(userId, availabilities);

                return Ok(new { success = true, message = "Availability updated successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating availability");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }
    }
}