namespace ChefAI.Application.Interfaces.Services
{
    public interface IStorageService
    {
        Task<string> UploadAsync(Stream fileStream, string fileName);
    }
}
