using System;

namespace VehicleServiceAPI.Models
{
    public class TechnicianAvailability
    {
        public int Id { get; set; }
        public int TechnicianId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public Technician Technician { get; set; }
    }
}