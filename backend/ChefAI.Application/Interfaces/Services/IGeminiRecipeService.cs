namespace ChefAI.Application.Interfaces.Services
{
    public interface IGeminiRecipeService
    {
        public IAsyncEnumerable<string> GenerateContentAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken);
    }
}
