using ChefAI.Application.Interfaces.Services;
using Google.GenAI;
using Google.GenAI.Types;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace ChefAI.Infraestructure.Gemini
{
    public class GeminiVisionService : IGeminiVisionService
    {
        private readonly Client _client;
        private const string Model = "gemini-flash-lite-latest";
        private const int MaxRetries = 3;
        private const string Prompt =
            "Identify all food ingredients visible in this image. " +
            "Respond ONLY with a valid JSON array of strings, one per ingredient, in Spanish. " +
            "Example: [\"tomate\", \"cebolla\", \"ajo\"]. " +
            "If no food ingredients are visible, respond with an empty array: [].";

        public GeminiVisionService(IOptions<GeminiSettings> config)
        {
            _client = new Client(apiKey: config.Value.ApiKey);
        }

        public async Task<List<string>> AnalyzeAsync(byte[] imageByte)
        {
            var contents = new List<Content>
            {
                new Content
                {
                    Role = "user",
                    Parts = new List<Part>
                    {
                        new Part { Text = Prompt },
                        new Part
                        {
                            InlineData = new Blob
                            {
                                MimeType = "image/jpeg",
                                Data = imageByte
                            }
                        }
                    }
                }
            };

            var text = await SendWithRetryAsync(contents);
            return ParseIngredients(text);
        }

        private async Task<string> SendWithRetryAsync(List<Content> contents)
        {
            var delay = TimeSpan.FromSeconds(2);

            for (int attempt = 1; attempt <= MaxRetries; attempt++)
            {
                try
                {
                    var response = await _client.Models.GenerateContentAsync(Model, contents);
                    return response.Text ?? string.Empty;
                }
                catch (Exception ex) when (Is503(ex))
                {
                    if (attempt >= MaxRetries)
                        throw new Exception("La API de Gemini no está disponible después de varios intentos. Intentá de nuevo en unos minutos.", ex);

                    await Task.Delay(delay);
                    delay *= 2;
                }
            }

            throw new Exception("La API de Gemini no está disponible después de varios intentos. Intentá de nuevo en unos minutos.");
        }

        private static bool Is503(Exception ex) =>
            ex.Message.Contains("503") || ex.Message.Contains("UNAVAILABLE");

        private static List<string> ParseIngredients(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return new List<string>();

            try
            {
                using var ingredientsDoc = JsonDocument.Parse(text);
                var ingredientsArray = ingredientsDoc.RootElement;
                var result = new List<string>();

                if (ingredientsArray.ValueKind == JsonValueKind.Array)
                {
                    foreach (var ingredient in ingredientsArray.EnumerateArray())
                    {
                        if (ingredient.ValueKind == JsonValueKind.String)
                        {
                            var value = ingredient.GetString();
                            if (!string.IsNullOrWhiteSpace(value))
                                result.Add(value.Trim());
                        }
                    }
                }

                return result;
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException("Error al parsear la respuesta de Gemini. El formato JSON no es válido.", ex);
            }
        }
    }
}