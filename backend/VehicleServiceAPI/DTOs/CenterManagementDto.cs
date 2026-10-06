namespace VehicleServiceAPI.DTOs
{
    public class CenterManagementDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public int ServiceCount { get; set; }
        public int TechnicianCount { get; set; }
        public bool IsDeleted { get; set; }
    }
}