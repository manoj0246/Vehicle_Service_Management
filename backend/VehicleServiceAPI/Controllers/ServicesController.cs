using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Services;

namespace VehicleServiceAPI.Controllers
{
    [ApiController]
    [Route("api/services")]
    [Authorize]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceCatalogService _serviceCatalogService;
        private readonly ILogger<ServicesController> _logger;

        public ServicesController(IServiceCatalogService serviceCatalogService, ILogger<ServicesController> logger)
        {
            _serviceCatalogService = serviceCatalogService;
            _logger = logger;
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

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllServices([FromQuery] int? centerId)
        {
            try
            {
                var services = await _serviceCatalogService.GetAllServicesAsync(centerId);
                return Ok(new
                {
                    success = true,
                    count = services.Count(),
                    data = services
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting services");
                return StatusCode(500, new { success = false, message = "An error occurred while fetching services" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetServiceById(int id)
        {
            try
            {
                var service = await _serviceCatalogService.GetServiceByIdAsync(id);
                return Ok(new
                {
                    success = true,
                    data = service
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting service {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
        {
            try
            {
                var role = GetCurrentUserRole();
                if (role == "Admin")
                {
                    var adminCenterId = GetCurrentUserCenterId();
                    if (adminCenterId.HasValue)
                    {
                        dto.CenterId = adminCenterId.Value;
                    }
                }

                var service = await _serviceCatalogService.CreateServiceAsync(dto);
                return CreatedAtAction(
                    nameof(GetServiceById),
                    new { id = service.Id },
                    new
                    {
                        success = true,
                        message = "Service created successfully",
                        data = service
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating service");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] UpdateServiceDto dto)
        {
            try
            {
                var role = GetCurrentUserRole();
                if (role == "Admin")
                {
                    var adminCenterId = GetCurrentUserCenterId();
                    var existing = await _serviceCatalogService.GetServiceByIdAsync(id);
                    if (existing.CenterId != adminCenterId)
                    {
                        return StatusCode(403, new { success = false, message = "Cannot update services of another center" });
                    }
                }

                var service = await _serviceCatalogService.UpdateServiceAsync(id, dto);
                return Ok(new
                {
                    success = true,
                    message = "Service updated successfully",
                    data = service
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating service {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> DeleteService(int id)
        {
            try
            {
                var role = GetCurrentUserRole();
                if (role == "Admin")
                {
                    var adminCenterId = GetCurrentUserCenterId();
                    var existing = await _serviceCatalogService.GetServiceByIdAsync(id);
                    if (existing.CenterId != adminCenterId)
                    {
                        return StatusCode(403, new { success = false, message = "Cannot delete services of another center" });
                    }
                }

                await _serviceCatalogService.DeleteServiceAsync(id);
                return Ok(new
                {
                    success = true,
                    message = "Service deleted successfully"
                });
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
                _logger.LogError(ex, $"Error deleting service {id}");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }
    }
}

