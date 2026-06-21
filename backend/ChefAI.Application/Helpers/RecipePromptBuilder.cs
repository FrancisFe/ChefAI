using ChefAI.Application.DTOs.Recipe;
using ChefAI.Domain.Entities;
using System.Text;

namespace ChefAI.Application.Helpers
{
    public interface IRecipePromptBuilder
    {
        string BuildSystemPrompt();
        string BuildUserPrompt(RecipeRequestDto request, IReadOnlyCollection<DietaryRestriction> dietaryRestrictions);
    }

    public class RecipePromptBuilder : IRecipePromptBuilder
    {
        public string BuildSystemPrompt()
        {
            var sb = new StringBuilder();

            AppendSectionHeader(sb, "BLOQUE 1 - ROL Y OBJETIVO");
            sb.AppendLine("Eres un chef experto generador de recetas en español.");
            sb.AppendLine("Tu única tarea es devolver una receta útil, clara y bien estructurada.");
            sb.AppendLine();

            AppendSectionHeader(sb, "BLOQUE 2 - FORMATO OBLIGATORIO");
            sb.AppendLine("DEBES RESPONDER EXACTAMENTE CON ESTA ESTRUCTURA:");
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
            sb.AppendLine("No agregues texto extra fuera de este formato.");
            sb.AppendLine();

            AppendSectionHeader(sb, "BLOQUE 3 - REGLAS ESTRICTAS PARA INGREDIENTES");
            sb.AppendLine("Para ingredientes con cantidad:");
            sb.AppendLine("- Formato: - [CANTIDAD] [UNIDAD] - [NOMBRE]");
            sb.AppendLine("- Ejemplo: - 500 gramos - roast beef");
            sb.AppendLine("- Ejemplo: - 2 unidades - cebolla");
            sb.AppendLine("- Ejemplo: - 3 dientes - ajo");
            sb.AppendLine();
            sb.AppendLine("Para ingredientes 'a gusto':");
            sb.AppendLine("- Formato: - a gusto - [NOMBRE]");
            sb.AppendLine("- Ejemplo: - a gusto - sal");
            sb.AppendLine("- Ejemplo: - a gusto - pimienta negra");
            sb.AppendLine("- NUNCA escribas: - a gusto - a gusto - sal");
            sb.AppendLine();
            sb.AppendLine("Reglas adicionales:");
            sb.AppendLine("- Separador: siempre ' - ' (espacio-guion-espacio)");
            sb.AppendLine("- No unas palabras: escribe 'roast beef' no 'roastbeef'");
            sb.AppendLine("- Cada ingrediente en una línea nueva");
            sb.AppendLine();

            AppendSectionHeader(sb, "BLOQUE 4 - REGLAS PARA LOS PASOS");
            sb.AppendLine("- Numerados: 1. , 2. , 3. , etc.");
            sb.AppendLine("- Claros y prácticos");
            sb.AppendLine("- Mínimo 3 pasos, máximo 12 pasos");
            sb.AppendLine("- Cada paso en una línea");
            sb.AppendLine();

            return sb.ToString();
        }

        public string BuildUserPrompt(RecipeRequestDto request, IReadOnlyCollection<DietaryRestriction> dietaryRestrictions)
        {
            var sb = new StringBuilder();

            AppendSectionHeader(sb, "BLOQUE 1 - INSTRUCCIÓN GENERAL");
            sb.AppendLine("Genera una receta con los datos que siguen.");
            sb.AppendLine();

            if (dietaryRestrictions.Count > 0)
            {
                AppendSectionHeader(sb, "BLOQUE 2 - RESTRICCIONES DIETÉTICAS");
                sb.AppendLine("IMPORTANTE: el usuario tiene las siguientes restricciones que deben respetarse estrictamente:");

                foreach (var restriction in dietaryRestrictions.DistinctBy(r => r.Id))
                {
                    sb.AppendLine(string.IsNullOrWhiteSpace(restriction.Description)
                        ? $"- {restriction.Name}"
                        : $"- {restriction.Name}: {restriction.Description}");
                }

                sb.AppendLine();
            }

            if (HasPreferences(request))
            {
                AppendSectionHeader(sb, "BLOQUE 3 - PREFERENCIAS DE LA RECETA");

                if (request.MaxCookingTimeMinutes.HasValue)
                {
                    sb.AppendLine($"- La receta debe poder prepararse en menos de {request.MaxCookingTimeMinutes} minutos.");
                }

                if (request.Servings.HasValue)
                {
                    sb.AppendLine($"- Ajustar las cantidades para {request.Servings} porciones.");
                }

                if (!string.IsNullOrWhiteSpace(request.Difficulty))
                {
                    sb.AppendLine($"- Nivel de dificultad deseado: {request.Difficulty}.");
                }

                sb.AppendLine();
            }

            AppendSectionHeader(sb, "BLOQUE 4 - INGREDIENTES DISPONIBLES");
            foreach (var ingredient in request.Ingredients.Where(i => !string.IsNullOrWhiteSpace(i)))
            {
                sb.AppendLine($"- {ingredient}");
            }

            sb.AppendLine();
            AppendSectionHeader(sb, "BLOQUE 5 - INSTRUCCIÓN FINAL");
            sb.AppendLine("Ahora genera la receta COMPLETA siguiendo el formato exacto.");
            sb.AppendLine("DEBE INCLUIR TODOS LOS INGREDIENTES Y TODOS LOS PASOS.");

            return sb.ToString();
        }

        private static bool HasPreferences(RecipeRequestDto request)
        {
            return request.Servings.HasValue || request.MaxCookingTimeMinutes.HasValue || !string.IsNullOrWhiteSpace(request.Difficulty);
        }

        private static void AppendSectionHeader(StringBuilder sb, string title)
        {
            sb.AppendLine(title);
            sb.AppendLine(new string('=', Math.Min(title.Length, 60)));
        }
    }
}