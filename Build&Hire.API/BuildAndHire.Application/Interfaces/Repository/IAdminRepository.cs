using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Repository
{
    public interface IAdminRepository
    {
        Task<IEnumerable<Admin>> GetAllAdmins();

        Task<Admin?> GetAdminById(Guid id);

        Task<Admin> RegisterAdmin(Admin admin);

        Task<Admin?> UpdateAdmin(Admin admin);

        Task<string?> DeleteAdmin(Guid id);
    }
}
