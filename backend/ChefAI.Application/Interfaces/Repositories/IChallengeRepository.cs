using ChefAI.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace ChefAI.Application.Interfaces.Repositories
{
    public interface IChallengeRepository
    {
        Task<bool> GetActiveAsync();
        Task<ChallengeEntry?> GetByIdAsync(int id);
        Task<bool> HasUserParticipatedAsync(int challengeId, int userId);
    }
}
