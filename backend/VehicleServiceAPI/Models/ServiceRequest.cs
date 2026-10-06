using System;

namespace VehicleServiceAPI.Models
{
    public class ServiceRequest
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int VehicleId { get; set; }
        public int ServiceId { get; set; }
        public int? TechnicianId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public User Customer { get; set; }
        public Vehicle Vehicle { get; set; }
        public Service Service { get; set; }
        public Technician Technician { get; set; }
    }
}