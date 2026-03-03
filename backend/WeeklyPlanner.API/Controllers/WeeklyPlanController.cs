using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.Models;
using WeeklyPlanner.API.DTOs;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/weeklyplan")]
public class WeeklyPlanController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public WeeklyPlanController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var plan = await _context.WeeklyPlans.FindAsync(id);
        if (plan == null) return NotFound();
        var dto = new WeeklyPlanDto
        {
            Id = plan.Id,
            StartDate = plan.StartDate,
            IsFrozen = plan.IsFrozen
        };
        return Ok(dto);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _context.WeeklyPlans.ToListAsync();
        var dto = list.Select(p => new WeeklyPlanDto
        {
            Id = p.Id,
            StartDate = p.StartDate,
            IsFrozen = p.IsFrozen
        });
        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWeeklyPlanDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var plan = new WeeklyPlan
        {
            StartDate = dto.StartDate
        };

        _context.WeeklyPlans.Add(plan);
        await _context.SaveChangesAsync();

        var result = new WeeklyPlanDto
        {
            Id = plan.Id,
            StartDate = plan.StartDate,
            IsFrozen = plan.IsFrozen
        };

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id}/freeze")]
    public async Task<IActionResult> Freeze(int id)
    {
        var plan = await _context.WeeklyPlans.FindAsync(id);
        if (plan == null) return NotFound();

        plan.IsFrozen = true;
        await _context.SaveChangesAsync();
        return Ok("Plan Frozen");
    }
}