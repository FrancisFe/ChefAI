using ChefAI.Application.DTOs.UserProfile;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChefAI.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DietaryRestrictionsController : ControllerBase
    {
        private readonly IDietaryRestrictionService _dietaryRestrictionService;

        public DietaryRestrictionsController(IDietaryRestrictionService dietaryRestrictionService)
        {
            _dietaryRestrictionService = dietaryRestrictionService;
        }

        [HttpGet]
        public async Task<ActionResult<List<DietaryRestrictionsDto>>> GetAll()
        {
            var dietaryRestrictions = await _dietaryRestrictionService.GetAllAsync();
            return Ok(dietaryRestrictions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DietaryRestrictionsDto>> GetById(int id)
        {
            var dietaryRestriction = await _dietaryRestrictionService.GetByIdAsync(id);
            return Ok(dietaryRestriction);
        }
    }
}
