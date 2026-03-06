namespace WeeklyPlanner.API.DTOs
{
    public class TeamMemberDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}