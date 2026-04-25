using ChefAI.Application.DTOs.Recipe;
using System.Text;

namespace ChefAI.Application.Services
{
    public interface IRecipePromptBuilder
    {
        string BuildSystemPrompt();
        string BuildUserPrompt(RecipeRequestDto request);
    }

    public class RecipePromptBuilder : IRecipePromptBuilder
    {
        public string BuildSystemPrompt()
        {
            var sb = new StringBuilder();

            sb.AppendLine("Eres un chef experto generador de recetas en español.");
            sb.AppendLine();
            sb.AppendLine("INSTRUCCIONES CRÍTICAS - DEBES SEGUIRLAS AL PIE DE LA LETRA:");
            sb.AppendLine();
            sb.AppendLine("1. RESPONDE SIEMPRE EN ESPAÑOL");
            sb.AppendLine("2. USA EXACTAMENTE ESTE FORMATO - NO AÑADAS NADA, NO CAMBIES NADA");
            sb.AppendLine();
            sb.AppendLine("ESTRUCTURA REQUERIDA:");
            sb.AppendLine("# [Nombre de la receta]");
            sb.AppendLine("[Descripción breve y atractiva]");
            sb.AppendLine("⏱ Tiempo: [XX min] | 🍽 Porciones: [X]");
            sb.AppendLine();
            sb.AppendLine("## Ingredientes");
            sb.AppendLine("[Lista de ingredientes aquí]");
            sb.AppendLine();
            sb.AppendLine("## Pasos");
            sb.AppendLine("[Pasos numerados aquí]");
            sb.AppendLine();
            sb.AppendLine("---");
            sb.AppendLine();
            sb.AppendLine("REGLAS ESTRICTAS PARA LOS INGREDIENTES:");
            sb.AppendLine();
            sb.AppendLine("Para ingredientes con cantidad:");
            sb.AppendLine("  Formato: - [CANTIDAD] [UNIDAD] - [NOMBRE]");
            sb.AppendLine("  Ejemplo: - 500 gramos - roast beef");
            sb.AppendLine("  Ejemplo: - 2 unidades - cebolla");
            sb.AppendLine("  Ejemplo: - 3 dientes - ajo");
            sb.AppendLine();
            sb.AppendLine("Para ingredientes 'a gusto':");
            sb.AppendLine("  Formato: - a gusto - [NOMBRE]");
            sb.AppendLine("  Ejemplo: - a gusto - sal");
            sb.AppendLine("  Ejemplo: - a gusto - pimienta negra");
            sb.AppendLine("  ⚠️ NUNCA ESCRIBAS: - a gusto - a gusto - sal (ESTO ES INCORRECTO)");
            sb.AppendLine();
            sb.AppendLine("REGLAS IMPORTANTES:");
            sb.AppendLine("- Separador: siempre ' - ' (espacio-guion-espacio)");
            sb.AppendLine("- No unas palabras: escribe 'roast beef' NO 'roastbeef'");
            sb.AppendLine("- Cada ingrediente en una línea nueva");
            sb.AppendLine();
            sb.AppendLine("REGLAS PARA LOS PASOS:");
            sb.AppendLine("- Numerados: 1. , 2. , 3. , etc.");
            sb.AppendLine("- Claros y prácticos");
            sb.AppendLine("- Mínimo 3 pasos, máximo 12 pasos");
            sb.AppendLine("- Cada paso en una línea");
            sb.AppendLine();

            return sb.ToString();
        }

        public string BuildUserPrompt(RecipeRequestDto request)
        {
            var sb = new StringBuilder();

            sb.AppendLine("Genera una receta con estos parámetros:");
            sb.AppendLine();
            sb.AppendLine("INGREDIENTES DISPONIBLES PARA USAR:");
            sb.AppendLine(string.Join(", ", request.Ingredients));
            sb.AppendLine();

            if (request.Servings.HasValue)
            {
                sb.AppendLine($"Número de porciones: {request.Servings}");
            }

            if (request.MaxCookingTimeMinutes.HasValue)
            {
                sb.AppendLine($"Tiempo máximo de cocción: {request.MaxCookingTimeMinutes} minutos");
            }

            if (!string.IsNullOrWhiteSpace(request.Difficulty))
            {
                sb.AppendLine($"Nivel de dificultad: {request.Difficulty}");
            }

            sb.AppendLine();
            sb.AppendLine("Ahora genera la receta COMPLETA siguiendo el formato exacto. DEBE INCLUIR TODOS LOS INGREDIENTES Y TODOS LOS PASOS.");

            return sb.ToString();
        }
    }
}