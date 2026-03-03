namespace WeeklyPlanner.API.DTOs
{
    public class CreateUserDto
    {
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "Member";
    }
}