using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ChefAI.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class BadgeSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasUsedPhotoDetection",
                table: "user_profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Condition",
                table: "badges",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ConditionValue",
                table: "badges",
                type: "integer",
                nullable: true);

            migrationBuilder.InsertData(
                table: "badges",
                columns: new[] { "Id", "Condition", "ConditionValue", "Description", "IconUrl", "Name" },
                values: new object[,]
                {
                    { 1, "TotalRecipes", 1, "Generá tu primera receta", "", "Primera receta" },
                    { 2, "TotalRecipes", 10, "Generá 10 recetas", "", "Cocinero curioso" },
                    { 3, "TotalRecipes", 50, "Generá 50 recetas", "", "Chef prolífico" },
                    { 4, "CurrentStreak", 7, "Mantené una racha de 7 días", "", "Racha de fuego" },
                    { 5, "TotalFavorites", 5, "Marcá 5 recetas como favoritas", "", "Coleccionista" },
                    { 6, "HasParticipatedInChallenge", null, "Participá en tu primer desafío", "", "Primer desafío" },
                    { 7, "TotalVotesReceived", 10, "Recibí 10 votos en desafíos", "", "Popular" },
                    { 8, "HasUsedPhotoDetection", null, "Usá la detección por foto", "", "Explorador" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "badges",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "badges",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "badges",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "badges",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "badges",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "badges",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "badges",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "badges",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DropColumn(
                name: "HasUsedPhotoDetection",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "Condition",
                table: "badges");

            migrationBuilder.DropColumn(
                name: "ConditionValue",
                table: "badges");
        }
    }
}
