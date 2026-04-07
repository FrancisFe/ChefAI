using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChefAI.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class CambiosRecipe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Steps",
                table: "recipes",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Steps",
                table: "recipes");
        }
    }
}
