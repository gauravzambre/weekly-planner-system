using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.Models;
using WeeklyPlanner.API.DTOs;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/categoryallocation")]
public class CategoryAllocationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoryAllocationController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("plan/{planId}")]
    public async Task<IActionResult> GetByPlan(int planId)
    {
        var list = await _context.CategoryAllocations
            .Where(c => c.WeeklyPlanId == planId)
            .ToListAsync();
        var dto = list.Select(c => new CategoryAllocationDto
        {
            Id = c.Id,
            WeeklyPlanId = c.WeeklyPlanId,
            CategoryId = c.CategoryId,
            Percentage = c.Percentage
        });
        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> SetAllocation([FromBody] CreateCategoryAllocationDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // ensure plan exists and not frozen
        var plan = await _context.WeeklyPlans.FindAsync(dto.WeeklyPlanId);
        if (plan == null)
            return NotFound("Weekly plan not found.");
        if (plan.IsFrozen)
            return BadRequest("Cannot change allocations after plan is frozen.");

        // ensure category exists
        if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequest("Invalid category.");

        var total = await _context.CategoryAllocations
            .Where(c => c.WeeklyPlanId == dto.WeeklyPlanId)
            .SumAsync(c => c.Percentage);

        if (total + dto.Percentage > 100)
            return BadRequest("Total category allocation cannot exceed 100%.");

        var allocation = new CategoryAllocation
        {
            WeeklyPlanId = dto.WeeklyPlanId,
            CategoryId = dto.CategoryId,
            Percentage = dto.Percentage
        };

        _context.CategoryAllocations.Add(allocation);
        await _context.SaveChangesAsync();

        var result = new CategoryAllocationDto
        {
            Id = allocation.Id,
            WeeklyPlanId = allocation.WeeklyPlanId,
            CategoryId = allocation.CategoryId,
            Percentage = allocation.Percentage
        };

        return CreatedAtAction(nameof(SetAllocation), new { id = result.Id }, result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var alloc = await _context.CategoryAllocations.FindAsync(id);
        if (alloc == null) return NotFound();

        var plan = await _context.WeeklyPlans.FindAsync(alloc.WeeklyPlanId);
        if (plan != null && plan.IsFrozen)
            return BadRequest("Cannot delete allocation after plan is frozen.");

        _context.CategoryAllocations.Remove(alloc);
        await _context.SaveChangesAsync();
        return Ok();
    }
}