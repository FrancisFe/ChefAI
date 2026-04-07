using ChefAI.Application.Interfaces.Services;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace ChefAI.Infraestructure.CloudinaryServices
{
    public class CloudinaryService : IStorageService
    {
        private readonly Cloudinary _cloudinary;
        public CloudinaryService(IOptions<CloudinarySettings> settings)
        {
            var account = new Account(
                settings.Value.CloudName,
                settings.Value.ApiKey,
                settings.Value.ApiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadAsync(Stream fileStream, string fileName)
        {
            if (fileStream == null || fileStream.Length == 0)
                throw new ArgumentException("Archivo inválido");
            if (fileStream.Length > 5 * 1024 * 1024)
                throw new ArgumentException("Máximo 5MB");

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "chefaiUploads",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = true
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            if (result.Error != null)
            {
                throw new Exception($"Error al subir la imagen: {result.Error.Message}");
            }

            return result.SecureUrl.ToString();
        }

    }
}
