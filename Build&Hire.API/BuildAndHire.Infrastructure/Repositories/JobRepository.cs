
using BuildAndHire.Application.Interfaces.Repository;

namespace BuildAndHire.Infrastructure.Repositories
{
    public class JobRepository : IJobRepository
    {
        private readonly BuildAndHireDbContext _context;

        public JobRepository(BuildAndHireDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Jobs>> GetAllJobs()
        {
            return await _context.Jobs
                .Include(cp => cp.companies)
                .Include(c => c.customer)
                .Include(w => w.Workers).ToListAsync();
        }

        public async Task<Jobs?> GetJobById(Guid id)
        {
            return await _context.Jobs.
                   Include(cp => cp.companies)
                   .Include(c => c.customer)
                   .Include(w => w.Workers).FirstOrDefaultAsync(i => i.JobId == id);

        }
        public async Task<Jobs> RegisterJob(Jobs job)
        {
            await _context.Jobs.AddAsync(job);
            await _context.SaveChangesAsync();

            return job;
        }

        public async Task<Jobs> UpdatejobDetails(Jobs job)
        {
            var ChangeJob = await _context.Jobs.FindAsync(job.JobId);

            if (ChangeJob == null) return null;

            ChangeJob.EndDate = job.EndDate;
            ChangeJob.Workers = job.Workers;
            ChangeJob.DailyRate = job.DailyRate;
            ChangeJob.address = job.address;
            ChangeJob.Status = job.Status;
            
            await _context.SaveChangesAsync();
            return ChangeJob;
        }

        public async Task<string> CancelJob(Guid Id)
        {
            var job = await _context.Jobs.FindAsync(Id);
            if (job == null) return null;

             _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();

            return "Job Canceled";

        }

    }


}
