using System.ComponentModel.DataAnnotations;

namespace WeeklyPlanner.API.DTOs
{
    public class CreatePlanTaskDto
    {
        [Required]
        public int WeeklyPlanId { get; set; }
        [Required]
        public int BacklogItemId { get; set; }
        [Required]
        public int TeamMemberId { get; set; }
        [Range(0, 30)]
        public int PlannedHours { get; set; }
        public Guid? UserId { get; set; }
    }
}