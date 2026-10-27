import { useRef, useState, type FormEvent } from 'react';
import Modal from '../Workspace/Modal';
import { ErrorMessage } from '../Workspace/Workspace';
import PhotoInput from '../ProfilePhoto/PhotoInput';
import ApiPhoto from '../ProfilePhoto/ApiPhoto';
import { useCompanyJobs } from '../../context/CompanyJobsContext';
import { apiRequest } from '../../utils/api';
import { jobCalendarDate } from '../../utils/dates';
import type { CompletedWorkPost } from '../../types/completedWork';

export default function CompletedWorkForm({ post, onClose, onSaved }: {
  post?: CompletedWorkPost; onClose: () => void; onSaved: () => void;
}) {
  const { jobs, loading, error: jobsError } = useCompanyJobs();
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const [title, setTitle] = useState(post?.title ?? '');
  const [description, setDescription] = useState(post?.description ?? '');
  const [location, setLocation] = useState(post?.location ?? '');
  const [completedOn, setCompletedOn] = useState(post?.completedOn ?? jobCalendarDate());
  const [jobId, setJobId] = useState(post?.jobId ?? '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (submitting.current) return;
    submitting.current = true; setSaving(true); setError('');
    try {
      const body = new FormData();
      for (const [key, value] of Object.entries({ title: title.trim(), description: description.trim(), location: location.trim(), completedOn })) body.append(key, value);
      if (jobId) body.append('jobId', jobId);
      if (photo) body.append('photo', photo);
      await apiRequest('/api/Companies/me/completed-work' + (post ? '/' + post.id : ''), { method: post ? 'PUT' : 'POST', body });
      onSaved();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save this completed work.'); }
    finally { submitting.current = false; setSaving(false); }
  };
  return <Modal title={post ? 'Edit completed work' : 'Add completed work'} onClose={() => { if (!saving) onClose(); }}>
    <p className="subtext">Share work your company has completed. Your post appears only on your business information page.</p>
    <form className="portfolio-form" onSubmit={submit} data-completed-work-form>
      <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 16 }}>
        <div><label htmlFor="work-source">Work source</label><select id="work-source" name="jobId" value={jobId} onChange={event => {
          setJobId(event.target.value);
          const job = completedJobs.find(item => item.id === event.target.value);
          if (job) { if (!title.trim()) setTitle(job.title); if (!description.trim()) setDescription(job.description); }
        }}><option value="">Past project outside Build &amp; Hire</option>
          {completedJobs.map(job => <option key={job.id} value={job.id}>Completed job: {job.title}</option>)}
        </select><p className="hint">{loading ? 'Loading completed jobs…' : jobsError ? 'Completed jobs could not load. You can still add a past project.' : 'Only your completed Build & Hire jobs can be linked. Past projects can be added separately.'}</p></div>
        <div><label htmlFor="work-title">Project title</label><input id="work-title" name="title" required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. A new kitchen in Gardens" /></div>
        <div><label htmlFor="work-description">What did your company complete?</label><textarea id="work-description" name="description" required maxLength={2000} value={description} onChange={event => setDescription(event.target.value)} placeholder="Describe the finished work and the result." /></div>
        <div className="formgrid"><div><label htmlFor="work-date">Completion date</label><input id="work-date" name="completedOn" type="date" required min="1900-01-01" max={jobCalendarDate()} value={completedOn} onChange={event => setCompletedOn(event.target.value)} /></div>
          <div><label htmlFor="work-location">Area or city (optional)</label><input id="work-location" name="location" maxLength={120} value={location} onChange={event => setLocation(event.target.value)} placeholder="e.g. Cape Town" /></div></div>
        <PhotoInput file={photo} onChange={setPhoto} required={!post} disabled={saving} label="Completed project photo"
          existing={post ? <ApiPhoto path={post.photoUrl} alt={post.title} /> : <span>Add a photo of the finished work</span>} />
        <p className="fieldnote">Share only photos you have permission to publish. Keep customer names, private addresses and other personal details out of your post.</p>
        <ErrorMessage error={error} />
        <div className="photo-actions"><button type="submit" className="primary">{saving ? 'Saving…' : post ? 'Save changes' : 'Publish completed work'}</button><button type="button" className="secondary" onClick={onClose}>Cancel</button></div>
      </fieldset>
    </form>
  </Modal>;
}
