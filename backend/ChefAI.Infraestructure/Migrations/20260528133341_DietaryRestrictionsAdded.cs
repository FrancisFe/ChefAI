using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ChefAI.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class DietaryRestrictionsAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "dietary_restrictions",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "No meat or fish, but may include dairy and eggs.", "Vegetarian" },
                    { 2, "No animal products, including dairy and eggs.", "Vegan" },
                    { 3, "No gluten-containing grains such as wheat, barley, and rye.", "Gluten-Free" },
                    { 4, "No dairy products.", "Dairy-Free" },
                    { 5, "No nuts or products containing nuts.", "Nut-Free" },
                    { 6, "No meat, but includes fish and seafood.", "Pescatarian" },
                    { 7, "Low-carb, high-fat diet that focuses on foods like meat, fish, eggs, dairy, nuts, and low-carb vegetables.", "Keto" },
                    { 8, "Excludes pork and pork products.", "No-Pork" },
                    { 9, "Limits carbohydrate intake, focusing on proteins and fats.", "Low-Carb" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 9);
        }
    }
}
