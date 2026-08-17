using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Infrastructure.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly BuildAndHireDbContext _context;

        public AdminRepository(BuildAndHireDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Admin>> GetAllAdmins()
        {
            return await _context.Admin
                .ToListAsync();
        }

        public async Task<Admin?> GetAdminById(Guid id)
        {
            return await _context.Admin
                .FirstOrDefaultAsync(a => a.AdminId == id);
        }

        public async Task<Admin?> GetAdminByUsername(string username)
        {
            return await _context.Admin
                .FirstOrDefaultAsync(a => a.UserName == username);
        }

        public async Task<Admin> RegisterAdmin(Admin admin)
        {
            await _context.Admin.AddAsync(admin);
            await _context.SaveChangesAsync();

            return admin;
        }

        public async Task<Admin?> UpdateAdmin(Admin dto)
        {
            var admin = await _context.Admin
                .FindAsync(dto.AdminId);

            if (admin == null)
                return null;

            admin.UserName = dto.UserName;
            admin.PasswordHash = dto.PasswordHash;
            admin.Status = dto.Status;
            admin.AdminRole = dto.AdminRole;

            await _context.SaveChangesAsync();

            return admin;
        }

        public async Task<string?> DeleteAdmin(Guid id)
        {
            var admin = await _context.Admin
                .FindAsync(id);

            if (admin == null)
                return null;

            _context.Admin.Remove(admin);

            await _context.SaveChangesAsync();

            return "Admin deleted";
        }
    }
}
