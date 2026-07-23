

using BuildAndHire.Application.Interfaces.Repository;

namespace BuildAndHire.Infrastructure.Repositories
{
    public class WorkerRepository : IWorkersRepository
    {
        private readonly BuildAndHireDbContext _context;

        public WorkerRepository(BuildAndHireDbContext context)
        {
            _context = context;
        }
       
        public async Task<IEnumerable<Workers>> GetAllWorkers()
        {
            return await _context.Workers.Include(w => w.Job)
                .Include(wc => wc.ResidingCompany)
                .ToListAsync();
        }

        public async Task<Workers?> GetWorkersById(Guid Id)
        {
            return await _context.Workers.Include(w => w.Job)
                .Include(wc => wc.ResidingCompany)
                .FirstOrDefaultAsync(i => i.WorkerId == Id);
        }

        public async Task<Workers> RegisterWorker(Workers dto)
        {
            await _context.Workers.AddAsync(dto);
            await _context.SaveChangesAsync();

            return dto;
        }

        public async Task<Workers> UpdateWorkerDetail(Workers dto)
        {
            Workers? workers = await _context.Workers.FindAsync(dto.WorkerId);
                if (workers == null) return null;

                workers.WorkerFirstName = dto.WorkerFirstName;
                workers.WorkerLastNAme = dto.WorkerLastNAme;
                workers.WorkerStatus = dto.WorkerStatus;
              
              await _context.SaveChangesAsync();
            
            return workers;
        }

        public async Task<string> DeleteAbdu(Guid Id)
        {
            var fired = await _context.Workers.FindAsync(Id);

            if (Id == null) return null;

            _context.Workers.Remove(fired);
            await _context.SaveChangesAsync();

            return "Worker let go";
        }

    }
}
