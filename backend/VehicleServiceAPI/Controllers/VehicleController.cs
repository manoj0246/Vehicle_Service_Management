using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Services;

namespace VehicleServiceAPI.Controllers
{
    [ApiController]
    [Route("api/vehicles")]
    [Authorize]  
    public class VehicleController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;
        private readonly ILogger<VehicleController> _logger;

        public VehicleController(IVehicleService vehicleService, ILogger<VehicleController> logger)
        {
            _vehicleService = vehicleService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");

            return int.Parse(userIdClaim);
        }

        [HttpGet]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> GetMyVehicles()
        {
            try
            {
                var customerId = GetCurrentUserId();
                var vehicles = await _vehicleService.GetVehiclesByCustomerAsync(customerId);

                return Ok(new
                {
                    success = true,
                    count = vehicles.Count(),
                    data = vehicles
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> GetVehicleById(int id)
        {
            try
            {
                var customerId = GetCurrentUserId();
                var vehicle = await _vehicleService.GetVehicleByIdAsync(id, customerId);

                return Ok(new
                {
                    success = true,
                    data = vehicle
                });
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
                _logger.LogError(ex, $"Error getting vehicle {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPost]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> CreateVehicle([FromBody] CreateVehicleDto createDto)
        {
            try
            {
                var customerId = GetCurrentUserId();
                var vehicle = await _vehicleService.CreateVehicleAsync(customerId, createDto);

                return CreatedAtAction(
                    nameof(GetVehicleById),
                    new { id = vehicle.Id },
                    new
                    {
                        success = true,
                        message = "Vehicle added successfully",
                        data = vehicle
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vehicle");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> UpdateVehicle(int id, [FromBody] UpdateVehicleDto updateDto)
        {
            try
            {
                var customerId = GetCurrentUserId();
                var vehicle = await _vehicleService.UpdateVehicleAsync(id, customerId, updateDto);

                return Ok(new
                {
                    success = true,
                    message = "Vehicle updated successfully",
                    data = vehicle
                });
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
                return Conflict(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating vehicle {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            try
            {
                var customerId = GetCurrentUserId();
                await _vehicleService.DeleteVehicleAsync(id, customerId);

                return Ok(new
                {
                    success = true,
                    message = "Vehicle deleted successfully"
                });
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
                _logger.LogError(ex, $"Error deleting vehicle {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }
    }
}