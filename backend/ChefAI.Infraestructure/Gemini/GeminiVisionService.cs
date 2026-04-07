using ChefAI.Application.Interfaces.Services;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace ChefAI.Infraestructure.Gemini
{
    public class GeminiVisionService : IGeminiVisionService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiVisionService(HttpClient httpClient, IOptions<GeminiSettings> config)
        {
            _httpClient = httpClient;
            _apiKey = config.Value.ApiKey;
        }

        public async Task<List<string>> AnalyzeAsync(byte[] imageByte)
        {
            try
            {
                var base64Image = Convert.ToBase64String(imageByte);

                string prompt = "Identify all food ingredients visible in this image. Respond ONLY with a valid JSON array of strings, one per ingredient, in Spanish. Example: [\"tomate\", \"cebolla\", \"ajo\"]. If no food ingredients are visible, respond with an empty array: [].";

                var requestBody = new
                {
                    contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = prompt },
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = "image/jpeg",
                                    data = base64Image
                                }
                            }
                        }
                    }
                }
                };

                var json = JsonSerializer.Serialize(requestBody);

                var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
                using var request = new HttpRequestMessage(HttpMethod.Post, url);
                request.Headers.Add("X-goog-api-key", _apiKey);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Error en la API de Gemini: {(int)response.StatusCode} {response.StatusCode}. Detalle: {responseString}");
                }

                using var document = JsonDocument.Parse(responseString);
                var root = document.RootElement;

                if (!root.TryGetProperty("candidates", out var candidatesElement) || candidatesElement.GetArrayLength() == 0)
                    return new List<string>();

                var text = root
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                if (string.IsNullOrWhiteSpace(text))
                    return new List<string>();

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
            catch (KeyNotFoundException ex)
            {
                throw new InvalidOperationException("Estructura inesperada en la respuesta de Gemini.", ex);
            }
        }
    }
}

