using BuildAndHire.Application.DTOs.AdminDto;
using System;
using System.Collections.Generic;
using System.Text;

namespace BuildAndHire.Application.Interfaces.Services
{
    public interface IAdminService
    {
        
            Task<IEnumerable<AdminDto>> GetAllAdminsAsync();

            Task<AdminDto> GetAdminByIdAsync(Guid id);

            Task<AdminDto> RegisterAdminAsync(AddAdmin dto);

            Task<AdminDto> UpdateAdminAsync(
                Guid id,
                UpdateAdmin dto);

            Task<string> DeleteAdminAsync(Guid id);
    }
}

