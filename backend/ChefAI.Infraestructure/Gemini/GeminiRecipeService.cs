using ChefAI.Application.Interfaces.Services;
using Google.GenAI;
using Google.GenAI.Types;
using Microsoft.Extensions.Configuration;
using System.Runtime.CompilerServices;

namespace ChefAI.Infraestructure.Gemini
{
    public class GeminiRecipeService : IGeminiRecipeService
    {
        private readonly Client _client;
        private const string Model = "gemini-flash-lite-latest";
        private const int MaxRetries = 3;

        public GeminiRecipeService(IConfiguration configuration)
        {
            var apiKey = configuration["GeminiSettings:ApiKey"]
                ?? throw new InvalidOperationException("No se encontró GeminiSettings:ApiKey en la configuración.");
            _client = new Client(apiKey: apiKey);
        }

        public async IAsyncEnumerable<string> GenerateContentAsync(
            string prompt,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await foreach (var chunk in StreamWithRetryAsync(prompt, null, cancellationToken))
                yield return chunk;
        }

        public async IAsyncEnumerable<string> GenerateContentAsync(
            string systemPrompt,
            string userPrompt,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await foreach (var chunk in StreamWithRetryAsync(userPrompt, systemPrompt, cancellationToken))
                yield return chunk;
        }

        private async IAsyncEnumerable<string> StreamWithRetryAsync(
            string userPrompt,
            string? systemPrompt,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var contents = new List<Content>
            {
                new Content
                {
                    Role = "user",
                    Parts = new List<Part> { new Part { Text = userPrompt } }
                }
            };

            var config = new GenerateContentConfig();
            if (systemPrompt is not null)
            {
                config.SystemInstruction = new Content
                {
                    Parts = new List<Part> { new Part { Text = systemPrompt } }
                };
            }

            var delay = TimeSpan.FromSeconds(2);
            IAsyncEnumerator<GenerateContentResponse> enumerator = null!;
            bool hasFirst = false;

            // El retry ocurre acá, solo en la conexión inicial (antes del primer chunk)
            for (int attempt = 1; attempt <= MaxRetries; attempt++)
            {
                try
                {
                    enumerator = _client.Models
                        .GenerateContentStreamAsync(Model, contents, config)
                        .GetAsyncEnumerator(cancellationToken);

                    hasFirst = await enumerator.MoveNextAsync();
                    break;
                }
                catch (Exception ex) when (Is503(ex))
                {
                    if (enumerator is not null)
                    {
                        await enumerator.DisposeAsync();
                        enumerator = null!;
                    }

                    if (attempt >= MaxRetries)
                        throw new Exception("La API de Gemini no está disponible después de varios intentos. Intentá de nuevo en unos minutos.", ex);

                    await Task.Delay(delay, cancellationToken);
                    delay *= 2;
                }
            }

            if (!hasFirst || enumerator is null)
                yield break;

            try
            {
                do
                {
                    var text = enumerator.Current.Text;
                    if (!string.IsNullOrWhiteSpace(text))
                        yield return text;
                }
                while (await enumerator.MoveNextAsync());
            }
            finally
            {
                await enumerator.DisposeAsync();
            }
        }

        private static bool Is503(Exception ex) =>
            ex.Message.Contains("503") || ex.Message.Contains("UNAVAILABLE");
    }
}