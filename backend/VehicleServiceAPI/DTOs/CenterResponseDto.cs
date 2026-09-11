namespace VehicleServiceAPI.DTOs
{
    public class CenterResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public int ActiveServicesCount { get; set; }
        public int ActiveTechniciansCount { get; set; }
    }
}

