namespace ChefAI.Application.Interfaces.Services
{
    public interface IGeminiRecipeService
    {
        public IAsyncEnumerable<string> GenerateContentAsync(string prompt, CancellationToken cancellationToken);
    }
}
