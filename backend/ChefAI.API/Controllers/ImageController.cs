using ChefAI.Application.DTOs;
using ChefAI.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ImageController : ControllerBase
{
    private readonly IStorageService _storageService;
    private readonly IGeminiVisionService _visionService;

    public ImageController(
        IStorageService storageService,
        IGeminiVisionService visionService)
    {
        _storageService = storageService;
        _visionService = visionService;
    }

    [HttpPost("detect-ingredients")]
    public async Task<IActionResult> DetectIngredients(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Archivo inválido");

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

        var response = new DetectIngredientsResponse
        {
            ImageURL = imageUrl,
            Ingredients = string.Join(", ", ingredientsList)
        };

        return Ok(response);
    }
}