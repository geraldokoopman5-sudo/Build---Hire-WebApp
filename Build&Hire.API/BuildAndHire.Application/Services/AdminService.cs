using BuildAndHire.Application.DTOs.AdminDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IAdminRepository _repo;

        public AdminService(IAdminRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<AdminDto>> GetAllAdminsAsync()
        {
            var admins = await _repo.GetAllAdmins();

            return admins.Select(a => new AdminDto
            {
                AdminId = a.AdminId,
                UserName = a.UserName,
                Email = a.Email,
                PasswordHash = a.PasswordHash,
                Status = a.Status,
                AdminRole = a.AdminRole
            });
        }

        public async Task<AdminDto> GetAdminByIdAsync(Guid id)
        {
            var admin = await _repo.GetAdminById(id);

            if (admin == null)
                throw new KeyNotFoundException("Admin not found");

            return new AdminDto
            {
                AdminId = admin.AdminId,
                UserName = admin.UserName,
                Email = admin.Email,
                PasswordHash = admin.PasswordHash,
                Status = admin.Status,
                AdminRole = admin.AdminRole
            };
        }


        public async Task<AdminDto> RegisterAdminAsync(AddAdmin dto)
        {
            var admin = new Admin
            {
                UserName = dto.UserName,
                Email = dto.Email,
                PasswordHash = dto.PasswordHash,
                Status = dto.Status,
                AdminRole = dto.AdminRole
            };

            var createdAdmin = await _repo.RegisterAdmin(admin);

            return new AdminDto
            {
                UserName = createdAdmin.UserName,
                Email = createdAdmin.Email,
                PasswordHash = createdAdmin.PasswordHash,
                Status = createdAdmin.Status,
                AdminRole = createdAdmin.AdminRole
            };
        }

        public async Task<AdminDto> UpdateAdminAsync(
            Guid id,
            UpdateAdmin dto)
        {
            var admin = await _repo.GetAdminById(id);

            if (admin == null)
                throw new KeyNotFoundException("Admin not found");

            admin.PasswordHash = dto.PasswordHash;
            admin.Email = dto.Email;
            admin.Status = dto.Status;
            admin.AdminRole = dto.AdminRole;

            var updatedAdmin = await _repo.UpdateAdmin(admin);

            if (updatedAdmin == null)
                throw new KeyNotFoundException("Admin not found");

            return new AdminDto
            {
                PasswordHash = updatedAdmin.PasswordHash,
                Email = updatedAdmin.Email,
                Status = updatedAdmin.Status,
                AdminRole = updatedAdmin.AdminRole
            };
        }

        public async Task<string> DeleteAdminAsync(Guid id)
        {
            var admin = await _repo.GetAdminById(id);

            if (admin == null)
                throw new KeyNotFoundException("Admin not found");

            var result = await _repo.DeleteAdmin(id);

            return result ?? "Admin not found";
        }
    }
}
