using System.ComponentModel.DataAnnotations;

namespace WeeklyPlanner.API.DTOs
{
    public class CreateWeeklyPlanDto
    {
        [Required]
        public DateTime StartDate { get; set; }
    }
}