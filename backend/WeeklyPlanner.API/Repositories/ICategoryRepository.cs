using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Repositories
{
    public interface ICategoryRepository
    {
        Task<Category> CreateAsync(Category category);
        Task<List<Category>> GetAllAsync();
    }
}