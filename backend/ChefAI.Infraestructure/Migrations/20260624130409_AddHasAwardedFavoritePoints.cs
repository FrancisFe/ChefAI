using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChefAI.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHasAwardedFavoritePoints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasAwardedFavoritePoints",
                table: "recipes",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasAwardedFavoritePoints",
                table: "recipes");
        }
    }
}
