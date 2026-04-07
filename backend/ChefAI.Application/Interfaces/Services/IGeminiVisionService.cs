namespace ChefAI.Application.Interfaces.Services
{
    public interface IGeminiVisionService
    {
        Task<List<string>> AnalyzeAsync(byte[] imageBytes);
    }
}
