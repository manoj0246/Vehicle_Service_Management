using System.Reflection.Metadata;

namespace VehicleServiceAPI.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public UserDto User { get; set; }
    }
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public int? CenterId { get; set; }
    }
}