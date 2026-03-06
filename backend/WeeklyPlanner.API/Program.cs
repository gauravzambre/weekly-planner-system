using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.Repositories;
using WeeklyPlanner.API.Services;

var builder = WebApplication.CreateBuilder(args);

//
// ==========================================
// SERVICE CONFIGURATION
// ==========================================
//

// Controllers
builder.Services.AddControllers();

//
// Database Configuration (Azure SQL / SQL Server)
//
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

//
// Dependency Injection
//
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IAppService, AppService>();

//
// Swagger Configuration
//
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Weekly Planner API",
        Version = "v1",
        Description = "Backend API for Weekly Planner Cloud Platform"
    });
});

//
// CORS CONFIGURATION
// Allow Angular Local + Azure Hosted UI
//
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "https://weekly-planner-cloud-platform-ui-gcefgwgue5h4cncd.centralindia-01.azurewebsites.net"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

//
// ==========================================
// BUILD APPLICATION
// ==========================================
//
var app = builder.Build();

//
// ==========================================
// APPLY DATABASE MIGRATIONS AUTOMATICALLY
// ==========================================
//
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

//
// ==========================================
// MIDDLEWARE PIPELINE
// ==========================================
//

// Enable Swagger (Dev + Prod)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Weekly Planner API v1");
    c.RoutePrefix = "swagger";
});

//
// HTTPS Redirection
//
app.UseHttpsRedirection();

//
// Enable CORS
//
app.UseCors("AllowFrontend");

//
// Authorization
//
app.UseAuthorization();

//
// Map Controllers
//
app.MapControllers();

//
// ==========================================
// RUN APPLICATION
// ==========================================
//
app.Run();