using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChefAI.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class TranslateDietaryRestrictions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Sin carne ni pescado, pero puede incluir lácteos y huevos.", "Vegetariano" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Sin productos de origen animal, incluidos lácteos y huevos.", "Vegano" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Sin cereales que contengan gluten como trigo, cebada y centeno.", "Sin Gluten" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Sin productos lácteos.", "Sin Lácteos" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Sin frutos secos ni productos que los contengan.", "Sin Frutos Secos" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Sin carne, pero incluye pescado y mariscos.", "Pescetariano" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 7,
                column: "Description",
                value: "Dieta baja en carbohidratos y alta en grasas, enfocada en carnes, pescado, huevos, lácteos, frutos secos y vegetales bajos en carbohidratos.");

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Excluye cerdo y productos derivados.", "Sin Cerdo" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Limita la ingesta de carbohidratos, centrándose en proteínas y grasas.", "Bajo en Carbohidratos" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name" },
                values: new object[] { "No meat or fish, but may include dairy and eggs.", "Vegetarian" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name" },
                values: new object[] { "No animal products, including dairy and eggs.", "Vegan" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name" },
                values: new object[] { "No gluten-containing grains such as wheat, barley, and rye.", "Gluten-Free" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name" },
                values: new object[] { "No dairy products.", "Dairy-Free" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name" },
                values: new object[] { "No nuts or products containing nuts.", "Nut-Free" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "No meat, but includes fish and seafood.", "Pescatarian" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 7,
                column: "Description",
                value: "Low-carb, high-fat diet that focuses on foods like meat, fish, eggs, dairy, nuts, and low-carb vegetables.");

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Excludes pork and pork products.", "No-Pork" });

            migrationBuilder.UpdateData(
                table: "dietary_restrictions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Limits carbohydrate intake, focusing on proteins and fats.", "Low-Carb" });
        }
    }
}
