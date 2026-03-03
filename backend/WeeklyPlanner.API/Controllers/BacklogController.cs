using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.Models;
using WeeklyPlanner.API.DTOs;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/backlog")]
public class BacklogController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BacklogController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _context.BacklogItems.ToListAsync();
        var dto = list.Select(b => new BacklogItemDto
        {
            Id = b.Id,
            Title = b.Title,
            Description = b.Description,
            CategoryId = b.CategoryId,
            EstimatedHours = b.EstimatedHours
        });
        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBacklogItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // ensure category exists
        if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequest("Invalid category.");

        var entity = new BacklogItem
        {
            Title = dto.Title,
            Description = dto.Description,
            CategoryId = dto.CategoryId,
            EstimatedHours = dto.EstimatedHours
        };

        _context.BacklogItems.Add(entity);
        await _context.SaveChangesAsync();

        var result = new BacklogItemDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            CategoryId = entity.CategoryId,
            EstimatedHours = entity.EstimatedHours
        };

        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.BacklogItems.FindAsync(id);
        if (item == null) return NotFound();

        _context.BacklogItems.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateBacklogItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var item = await _context.BacklogItems.FindAsync(id);
        if (item == null) return NotFound();

        if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequest("Invalid category.");

        item.Title = dto.Title;
        item.Description = dto.Description;
        item.CategoryId = dto.CategoryId;
        item.EstimatedHours = dto.EstimatedHours;

        await _context.SaveChangesAsync();

        var result = new BacklogItemDto
        {
            Id = item.Id,
            Title = item.Title,
            Description = item.Description,
            CategoryId = item.CategoryId,
            EstimatedHours = item.EstimatedHours
        };

        return Ok(result);
    }
}