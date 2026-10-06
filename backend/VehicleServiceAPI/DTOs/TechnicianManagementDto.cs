namespace VehicleServiceAPI.DTOs
{
    public class TechnicianManagementDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public int CenterId { get; set; }
        public string CenterName { get; set; }
        public string Specialization { get; set; }
        public bool IsDeleted { get; set; }
        public List<TechnicianAvailabilityDto> Availabilities { get; set; } = new();
    }

    public class CreateTechnicianDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public int CenterId { get; set; }
        public string Specialization { get; set; }
        public List<TechnicianAvailabilityDto> Availabilities { get; set; } = new();
    }

    public class UpdateTechnicianDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public int CenterId { get; set; }
        public string Specialization { get; set; }
        public List<TechnicianAvailabilityDto> Availabilities { get; set; } = new();
    }

    public class TechnicianAvailabilityDto
    {
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}