using ChefAI.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;

namespace ChefAI.Infraestructure.Gemini
{
    public class GeminiRecipeService : IGeminiRecipeService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiRecipeService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GeminiSettings:ApiKey"]
                ?? throw new InvalidOperationException("No se encontró GeminiSettings:ApiKey en la configuración.");
        }

        public async IAsyncEnumerable<string> GenerateContentAsync(string prompt, [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var stream = CallGeminiStreaming(prompt, null, cancellationToken);
            await foreach (var chunk in stream.WithCancellation(cancellationToken))
            {
                yield return chunk.Text;
            }
        }

        public async IAsyncEnumerable<string> GenerateContentAsync(
            string systemPrompt,
            string userPrompt,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var stream = CallGeminiStreaming(userPrompt, systemPrompt, cancellationToken);
            await foreach (var chunk in stream.WithCancellation(cancellationToken))
            {
                yield return chunk.Text;
            }
        }

        private async IAsyncEnumerable<GeminiTextChunk> CallGeminiStreaming(
            string userPrompt,
            string? systemPrompt,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var requestBody = new
            {
                systemInstruction = systemPrompt != null ? new { parts = new[] { new { text = systemPrompt } } } : null,
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = userPrompt }
                        }
                    }
                }
            };

            var jsonBody = JsonSerializer.Serialize(requestBody);
            var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse";

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("X-goog-api-key", _apiKey);
            request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);

            response.EnsureSuccessStatusCode();

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var reader = new StreamReader(stream);

            while (!cancellationToken.IsCancellationRequested)
            {
                var line = await reader.ReadLineAsync(cancellationToken);
                if (line is null)
                {
                    yield break;
                }

                if (string.IsNullOrWhiteSpace(line) || !line.StartsWith("data:", StringComparison.Ordinal))
                {
                    continue;
                }

                var payload = line[5..].Trim();
                if (payload == "[DONE]")
                {
                    yield break;
                }

                JsonElement root;
                using (var document = JsonDocument.Parse(payload))
                {
                    root = document.RootElement.Clone();
                }

                if (root.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in root.EnumerateArray())
                    {
                        foreach (var text in ExtractTexts(item))
                        {
                            yield return new GeminiTextChunk(text);
                        }
                    }

                    continue;
                }

                foreach (var text in ExtractTexts(root))
                {
                    yield return new GeminiTextChunk(text);
                }
            }
        }

        private static IEnumerable<string> ExtractTexts(JsonElement root)
        {
            if (!root.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                yield break;
            }

            foreach (var candidate in candidates.EnumerateArray())
            {
                if (!candidate.TryGetProperty("content", out var content) ||
                    !content.TryGetProperty("parts", out var parts) ||
                    parts.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var part in parts.EnumerateArray())
                {
                    if (part.TryGetProperty("text", out var textElement))
                    {
                        var text = textElement.GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            yield return text;
                        }
                    }
                }
            }
        }

        private readonly record struct GeminiTextChunk(string Text);
    }
}