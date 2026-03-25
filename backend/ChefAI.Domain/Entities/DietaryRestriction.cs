namespace ChefAI.Domain.Entities
{
    public class DietaryRestriction
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public List<Recipe> Recipes { get; set; } = new();
        public List<UserProfile> UserProfiles { get; set; } = new();
    }
}
