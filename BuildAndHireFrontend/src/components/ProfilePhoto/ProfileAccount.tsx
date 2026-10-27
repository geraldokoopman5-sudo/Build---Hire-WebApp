import { Link } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import './profilePhoto.css';

export default function ProfileAccount() {
  const { profile } = useProfile();
  const initials = (profile?.displayName ?? 'My profile').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('');
  return <Link to="/profile" className="profile-account" aria-label="My profile and photo">
    <span className="profile-avatar">{profile?.photoDataUrl
      ? <img src={profile.photoDataUrl} alt="" /> : <span aria-hidden="true">{initials}</span>}</span>
    <span><strong>{profile?.displayName || 'My profile'}</strong><small>Manage profile photo</small></span>
  </Link>;
}
