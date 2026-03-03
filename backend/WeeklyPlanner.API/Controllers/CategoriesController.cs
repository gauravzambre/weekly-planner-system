using Microsoft.AspNetCore.Mvc;
using WeeklyPlanner.API.DTOs;
using WeeklyPlanner.API.Models;
using WeeklyPlanner.API.Repositories;

namespace WeeklyPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _repository;

        public CategoriesController(ICategoryRepository repository)
        {
            _repository = repository;
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };

            var createdCategory = await _repository.CreateAsync(category);

            var response = new CategoryResponseDto
            {
                Id = createdCategory.Id,
                Name = createdCategory.Name,
                Description = createdCategory.Description,
                CreatedAt = createdCategory.CreatedAt
            };

            return CreatedAtAction(nameof(GetAll), new { id = response.Id }, response);
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _repository.GetAllAsync();

            var response = categories.Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                CreatedAt = c.CreatedAt
            });

            return Ok(response);
        }
    }
}