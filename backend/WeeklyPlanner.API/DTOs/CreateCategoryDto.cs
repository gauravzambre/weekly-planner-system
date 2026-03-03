using System.ComponentModel.DataAnnotations;

namespace WeeklyPlanner.API.DTOs
{
    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Name is required")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}