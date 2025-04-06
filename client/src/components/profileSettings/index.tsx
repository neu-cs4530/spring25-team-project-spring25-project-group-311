import React from 'react';
import './index.css';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import useProfileSettings from '../../hooks/useProfileSettings';
import EmailDisplayItem from './emailDisplayItem';
import { useHeaderContext } from '../../contexts/HeaderContext';

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
    handleRefresh,
    handleAddNewBanner,
    handleNewSelectedBanner,
    handleChangeFrequency,
    handleMuteNotifications,
    handleAddPinnedBadge,
  } = useProfileSettings();

  const { setHeaderBackground } = useHeaderContext();

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
    <>
      <Tabs defaultActiveKey='generalInfo' id='justify-tab-example' justify>
        <Tab eventKey='generalInfo' title='General Info'>
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

              {/* ---- Reset Password Section ---- */}
              {canEditProfile && (
                <>
                  <h4>Reset Password</h4>
                  <input
                    className='input-text'
                    type={'text'}
                    placeholder='New Password'
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <input
                    className='input-text'
                    type={'text'}
                    placeholder='Confirm New Password'
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                  />
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
        </Tab>
        <Tab eventKey='stats' title='User Statistics'>
          {userData ? (
            <>
              <h4>User Statistics</h4>
              <div>
                <h6>Pinned Badges</h6>
                {userData.pinnedBadge && userData.pinnedBadge !== '' && (
                  <img
                    src={userData.pinnedBadge}
                    alt='No image found'
                    style={{ marginLeft: '1rem', height: '75px', width: '75px' }}
                  />
                )}
              </div>
              {
                <p>
                  <strong>Current Streak: </strong> {userData.streak ? userData.streak.length : 0}
                </p>
              }
              {/* ---- Badges Section ---- */}
              {userData.badges.length > 0 && (
                <div style={{ margin: '1rem 0' }}>
                  <p>
                    {userData.badges.map(img => (
                      <div key={img} style={{ display: 'inline-block', marginRight: '1rem' }}>
                        <img src={img} style={{ width: '100px', height: '100px' }} />
                        {canEditProfile && (
                          <button
                            className='login-button'
                            style={{ display: 'block', marginTop: '0.5rem' }}
                            // Pinning a badge to the user's profile
                            onClick={() => {
                              handleAddPinnedBadge(img);
                            }}>
                            Pin
                          </button>
                        )}
                      </div>
                    ))}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p>No user data found. Make sure the username parameter is correct.</p>
          )}
        </Tab>
        {canEditProfile && (
          <Tab eventKey='notifications' title='User Notifications'>
            {userData ? (
              <>
                <h4>Notifications</h4>
                <h6>Emails</h6>
                {/* ---- Email Section ---- */}
                {!addEmailMode && !replaceEmailMode && (
                  <div>
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

                {addEmailMode && (
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
                {replaceEmailMode && (
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
                        <EmailDisplayItem
                          key={email}
                          email={email}
                          selectEmail={setEmailToReplace}
                        />
                      ),
                    )}
                  </div>
                )}
              </>
            ) : (
              <p>No user data found. Make sure the username parameter is correct.</p>
            )}
          </Tab>
        )}
      </Tabs>
    </>
  );
};

export default ProfileSettings;
