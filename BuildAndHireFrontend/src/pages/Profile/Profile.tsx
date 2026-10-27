import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Workspace, { Heading, LoadState, Panel, ErrorMessage } from '../../components/Workspace/Workspace';
import PhotoInput from '../../components/ProfilePhoto/PhotoInput';
import { useProfile } from '../../context/ProfileContext';
import { useConfirmation } from '../../hooks/useConfirmation';
import { getStoredAccountType } from '../../utils/auth';
import { AccountType } from '../../types/enums';

export default function Profile() {
  const { profile, loading, error, refresh, uploadPhoto, removePhoto } = useProfile();
  const confirm = useConfirmation();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [message, setMessage] = useState('');
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (!file || busy) return;
    setBusy(true); setRequestError(''); setMessage('');
    try { await uploadPhoto(file); setFile(null); setMessage('Your profile photo has been saved.'); }
    catch (reason) { setRequestError(reason instanceof Error ? reason.message : 'Could not save your photo.'); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (busy || !await confirm('Remove your current profile photo?', { confirmLabel: 'Remove photo' })) return;
    setBusy(true); setRequestError(''); setMessage('');
    try { await removePhoto(); setFile(null); setMessage('Your profile photo has been removed.'); }
    catch (reason) { setRequestError(reason instanceof Error ? reason.message : 'Could not remove your photo.'); }
    finally { setBusy(false); }
  };
  return <Workspace title="My profile"><Heading title="A face to your name." description="Add a photo to make your workspace feel like yours." eyebrow="MY PROFILE" />
    <LoadState loading={loading} error={error} retry={refresh} />
    {profile && <div className="profile-photo-panel"><Panel title={profile.displayName}>
      <p className="subtext">{profile.email}</p>
      <form onSubmit={save}>
        <PhotoInput key={message} file={file} onChange={setFile} disabled={busy} label="Profile photo"
          existing={profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="Your current profile" /> : <span>No photo yet</span>} />
        <ErrorMessage error={requestError} />
        <div className="photo-actions"><button className="primary" type="submit" disabled={!file || busy}>{busy ? 'Saving…' : 'Save profile photo'}</button>
          {profile.photoDataUrl && <button className="secondary" type="button" disabled={busy} onClick={remove}>Remove photo</button>}</div>
      </form>
      {message && <p className="photo-success" role="status">{message}</p>}
      {getStoredAccountType() === AccountType.Company && <div className="fieldnote">Your company photo also appears on your business information page. <Link className="textbutton" to="/company/business-information">View business information →</Link></div>}
    </Panel></div>}
  </Workspace>;
}
