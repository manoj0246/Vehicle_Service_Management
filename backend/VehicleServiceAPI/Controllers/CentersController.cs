using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleServiceAPI.DTOs;
using VehicleServiceAPI.Services;

namespace VehicleServiceAPI.Controllers
{
    [ApiController]
    [Route("api/centers")]
    [Authorize]
    public class CentersController : ControllerBase
    {
        private readonly ICenterService _centerService;
        private readonly ILogger<CentersController> _logger;

        public CentersController(ICenterService centerService, ILogger<CentersController> logger)
        {
            _centerService = centerService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCenters()
        {
            try
            {
                var centers = await _centerService.GetAllCentersAsync();
                return Ok(new
                {
                    success = true,
                    count = centers.Count(),
                    data = centers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service centers");
                return StatusCode(500, new { success = false, message = "An error occurred while fetching service centers" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCenterById(int id)
        {
            try
            {
                var center = await _centerService.GetCenterByIdAsync(id);
                return Ok(new
                {
                    success = true,
                    data = center
                });
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

        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> CreateCenter([FromBody] CreateCenterDto dto)
        {
            try
            {
                var center = await _centerService.CreateCenterAsync(dto);
                return CreatedAtAction(
                    nameof(GetCenterById),
                    new { id = center.Id },
                    new
                    {
                        success = true,
                        message = "Service Center created successfully",
                        data = center
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating center");
                return StatusCode(500, new { success = false, message = "An error occurred" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> UpdateCenter(int id, [FromBody] UpdateCenterDto dto)
        {
            try
            {
                var center = await _centerService.UpdateCenterAsync(id, dto);
                return Ok(new
                {
                    success = true,
                    message = "Service Center updated successfully",
                    data = center
                });
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
    }
}

