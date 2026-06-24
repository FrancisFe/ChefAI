using ChefAI.Application.DTOs;
using ChefAI.Application.Interfaces.Repositories;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChefAI.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ImageController : ControllerBase
{
    private readonly IStorageService _storageService;
    private readonly IGeminiVisionService _visionService;
    private readonly IUserProfileRepository _userProfileRepository;

    public ImageController(
        IStorageService storageService,
        IGeminiVisionService visionService,
        IUserProfileRepository userProfileRepository)
    {
        _storageService = storageService;
        _visionService = visionService;
        _userProfileRepository = userProfileRepository;
    }

    [HttpPost("detect-ingredients")]
    public async Task<IActionResult> DetectIngredients(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Archivo inválido");

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (userId == 0)
            return Unauthorized("No user ID found in token");

        byte[] imageBytes;
        using (var ms = new MemoryStream())
        {
            await file.CopyToAsync(ms);
            imageBytes = ms.ToArray();
        }
        var uploadTask = _storageService.UploadAsync(
            new MemoryStream(imageBytes),
            file.FileName
        );

        var analyzeTask = _visionService.AnalyzeAsync(imageBytes);

        var imageUrl = await uploadTask;
        var ingredientsList = await analyzeTask;

        var userProfile = await _userProfileRepository.GetByUserIdAsync(userId);
        if (userProfile != null && !userProfile.HasUsedPhotoDetection)
        {
            userProfile.HasUsedPhotoDetection = true;
            await _userProfileRepository.UpdateAsync(userProfile);
        }

        var response = new DetectIngredientsResponse
        {
            ImageURL = imageUrl,
            Ingredients = string.Join(", ", ingredientsList)
        };

        return Ok(response);
    }
}