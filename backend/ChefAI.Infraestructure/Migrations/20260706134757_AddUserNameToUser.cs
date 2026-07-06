using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChefAI.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserNameToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'users' AND column_name = 'UserName'
                    ) THEN
                        ALTER TABLE users ADD "UserName" character varying(50) NOT NULL DEFAULT '';
                    END IF;
                END $$;
                """);

            migrationBuilder.Sql("""
                UPDATE users
                SET "UserName" = SPLIT_PART("Email", '@', 1)
                WHERE "UserName" = '';
                """);

            migrationBuilder.CreateIndex(
                name: "IX_users_UserName",
                table: "users",
                column: "UserName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_UserName",
                table: "users");

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'users' AND column_name = 'UserName'
                    ) THEN
                        ALTER TABLE users DROP COLUMN "UserName";
                    END IF;
                END $$;
                """);
        }
    }
}
