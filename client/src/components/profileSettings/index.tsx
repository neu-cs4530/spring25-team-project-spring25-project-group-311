import React from 'react';
import './index.css';
import useProfileSettings from '../../hooks/useProfileSettings';
import EmailDisplayItem from './emailDisplayItem';
import NotificationToggleItem from './notificationToggleItem';

const ProfileSettings: React.FC = () => {
  const {
    userData,
    loading,
    editBioMode,
    newBio,
    replaceEmailMode,
    addEmailMode,
    replacementEmail,
    newEmail,
    newPassword,
    confirmNewPassword,
    successMessage,
    errorMessage,
    emailToReplace,
    showConfirmation,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,

    setEditBioMode,
    setEmailToReplace,
    setReplaceEmailMode,
    setAddEmailMode,
    setNewBio,
    setNewEmail,
    setReplacementEmail,
    setNewPassword,
    setConfirmNewPassword,
    setShowConfirmation,

    handleResetPassword,
    handleAddEmail,
    handleReplaceEmail,
    handleUpdateBiography,
    handleDeleteUser,
    handleSubscription,
  } = useProfileSettings();

  if (loading) {
    return (
      <div className='page-container'>
        <div className='profile-card'>
          <h2>Loading user data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className='page-container'>
      <div className='profile-card'>
        <h2>Profile</h2>
        {successMessage && <p className='success-message'>{successMessage}</p>}
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        {userData ? (
          <>
            <h4>General Information</h4>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>

            {/* ---- Biography Section ---- */}
            {!editBioMode && (
              <p>
                <strong>Biography:</strong> {userData.biography || 'No biography yet.'}
                {canEditProfile && (
                  <button
                    className='login-button'
                    style={{ marginLeft: '1rem' }}
                    onClick={() => {
                      setEditBioMode(true);
                      setNewBio(userData.biography || '');
                    }}>
                    Edit
                  </button>
                )}
              </p>
            )}

            {editBioMode && canEditProfile && (
              <div style={{ margin: '1rem 0' }}>
                <input
                  className='input-text'
                  type='text'
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                />
                <button
                  className='login-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={handleUpdateBiography}>
                  Save
                </button>
                <button
                  className='delete-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={() => setEditBioMode(false)}>
                  Cancel
                </button>
              </div>
            )}

            <p>
              <strong>Date Joined:</strong>{' '}
              {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
            </p>

            {/* ---- Badges Section ---- */}
            {userData.badges.length > 0 && (
              <p>
                <strong>Badges:</strong> {userData.badges.join(', ')}
              </p>
            )}

            {/* ---- Email Section ---- */}
            {!addEmailMode && !replaceEmailMode && (
              <div>
                <h4>Emails</h4>
                {userData.emails.map(email => (
                  <div key={email}>
                    <EmailDisplayItem email={email} selectEmail={setEmailToReplace} />
                    <button
                      className='replace-email-button'
                      style={{ marginLeft: '1rem' }}
                      onClick={() => setReplaceEmailMode(true)}>
                      Replace Email
                    </button>
                  </div>
                ))}
                <button
                  className='add-email-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={() => setAddEmailMode(true)}>
                  Add Email
                </button>
              </div>
            )}

            {addEmailMode && canEditProfile && (
              <div style={{ margin: '1rem 0' }}>
                <input
                  className='input-text'
                  type='text'
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
                <button
                  className='login-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={handleAddEmail}>
                  Add Email
                </button>
                <button
                  className='delete-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={() => setAddEmailMode(false)}>
                  Cancel
                </button>
              </div>
            )}

            {/* ---- If the email we are trying to replace is the same as 
            the current email, we put in the input text. Else we display the email as is.---- */}
            {replaceEmailMode && canEditProfile && (
              <div>
                {userData.emails.map(email =>
                  email === emailToReplace ? (
                    <div key={email}>
                      <input
                        className='input-text'
                        type='text'
                        value={replacementEmail}
                        onChange={e => setReplacementEmail(e.target.value)}
                      />
                      <button
                        className='login-button'
                        style={{ marginLeft: '1rem' }}
                        onClick={handleReplaceEmail}>
                        Replace Email
                      </button>
                      <button
                        className='delete-button'
                        style={{ marginLeft: '1rem' }}
                        onClick={() => setReplaceEmailMode(false)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <EmailDisplayItem key={email} email={email} selectEmail={setEmailToReplace} />
                  ),
                )}
              </div>
            )}

            {/* ---- Toggling Notifications Section ---- */}
            {canEditProfile && (
              <>
                <h4>Notifications</h4>
                <NotificationToggleItem
                  notifType={{ type: 'browser' }}
                  toggleNotif={handleSubscription}
                />
                <NotificationToggleItem
                  notifType={{ type: 'email' }}
                  toggleNotif={handleSubscription}
                />
              </>
            )}

            {/* ---- Reset Password Section ---- */}
            {canEditProfile && (
              <>
                <h4>Reset Password</h4>
                <input
                  className='input-text'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='New Password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <input
                  className='input-text'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Confirm New Password'
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                />
                <button className='toggle-password-button' onClick={togglePasswordVisibility}>
                  {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                </button>
                <button className='login-button' onClick={handleResetPassword}>
                  Reset
                </button>
              </>
            )}

            {/* ---- Danger Zone (Delete User) ---- */}
            {canEditProfile && (
              <>
                <h4>Danger Zone</h4>
                <button className='delete-button' onClick={handleDeleteUser}>
                  Delete This User
                </button>
              </>
            )}
          </>
        ) : (
          <p>No user data found. Make sure the username parameter is correct.</p>
        )}

        {/* ---- Confirmation Modal for Delete ---- */}
        {showConfirmation && (
          <div className='modal'>
            <div className='modal-content'>
              <p>
                Are you sure you want to delete user <strong>{userData?.username}</strong>? This
                action cannot be undone.
              </p>
              <button className='delete-button' onClick={() => pendingAction && pendingAction()}>
                Confirm
              </button>
              <button className='cancel-button' onClick={() => setShowConfirmation(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
