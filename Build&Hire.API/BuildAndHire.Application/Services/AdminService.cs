using BuildAndHire.Application.DTOs.AdminDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IAdminRepository _repo;
        private readonly IPasswordService _passwordService;

        public AdminService(IAdminRepository repo, IPasswordService passwordService)
        {
            _repo = repo;
            _passwordService = passwordService;
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
                AdminRole = a.AdminRole,
                accountType = a.accountType,
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
                AdminRole = admin.AdminRole,
                accountType = admin.accountType,
            };
        }


        public async Task<AdminDto> RegisterAdminAsync(AddAdmin dto)
        {
            var admin = new Admin
            {
                UserName = dto.UserName,
                Email = dto.Email,
                PasswordHash = _passwordService.HashPassword(
                    dto.PasswordHash),
                Status = dto.Status,
                AdminRole = dto.AdminRole,
                accountType = dto.accountType,
            };

            var createdAdmin = await _repo.RegisterAdmin(admin);

            return new AdminDto
            {
                UserName = createdAdmin.UserName,
                Email = createdAdmin.Email,
                Status = createdAdmin.Status,
                AdminRole = createdAdmin.AdminRole,
                accountType = createdAdmin.accountType
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
