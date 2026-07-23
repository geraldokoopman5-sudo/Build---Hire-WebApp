

using BuildAndHire.Application.Interfaces.Repository;

namespace BuildAndHire.Infrastructure.Repositories
{
    public class PaymentRepository : IPayementRepository
    {
        private readonly BuildAndHireDbContext _context;

        public PaymentRepository(BuildAndHireDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
        {
            return await _context.Payment.Include(cp => cp.Companies)
                .Include(c => c.Customer)
                .Include(j => j.Job)
                .ToListAsync();
        }

        public async Task<Payment?> GetPaymentsByIdAsync(Guid Id)
        {
            return await _context.Payment.Include(cp => cp.Companies)
                .Include(c => c.Customer)
                .Include(j => j.Job)
                .FirstOrDefaultAsync(i => i.PaymentId == Id);
        }

        public async Task<Payment> CompletePaymentAsync(Payment dto)
        {
            await _context.Payment.AddAsync(dto);
            await _context.SaveChangesAsync();

            return dto;
        }
        public async Task<Payment> PaymentResponseAsync(Payment Id)//Update
        {
            Payment pay = await _context.Payment.FindAsync(Id);
            if (pay == null) return null;

                    pay.Status = Id.Status;

            return pay;
        }

        public async Task<string> DeletePaymentHistoryAsync(Guid Id)
        {
            var Deletepay = await _context.Payment.FindAsync(Id);
            if (Deletepay == null) return null;

            _context.Payment.Remove(Deletepay);
            await _context.SaveChangesAsync();

            return "History Deleted";
        }


    }
}
