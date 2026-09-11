using System.ComponentModel.DataAnnotations;

namespace VehicleServiceAPI.DTOs
{
    public class CreateVehicleDto
    {
        [Required(ErrorMessage = "Make is required")]
        public string Make { get; set; }

        [Required(ErrorMessage = "Model is required")]
        public string Model { get; set; }

        [Required(ErrorMessage = "Year is required")]
        [Range(1900, 2100, ErrorMessage = "Year must be between 1900 and 2100")]
        public int Year { get; set; }

        [Required(ErrorMessage = "License plate is required")]
        public string LicensePlate { get; set; }

        public string Color { get; set; }
    }
}