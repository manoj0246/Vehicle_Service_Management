namespace VehicleServiceAPI.DTOs
{
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public int VehicleId { get; set; }
        public string VehicleName { get; set; }
        public string LicensePlate { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public decimal ServicePrice { get; set; }
        public int? TechnicianId { get; set; }
        public string TechnicianName { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}