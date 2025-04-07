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
    handleDeleteEmail,
    setEmailToDelete,
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
          <div className='page-container'>
            <div className='profile-card'>
              {userData ? (
                <>
                  <h4>General Information</h4>
                  <p style={{ marginTop: '5%' }}>
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
                    {userData.dateJoined
                      ? new Date(userData.dateJoined).toLocaleDateString()
                      : 'N/A'}
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
                      <button
                        className='login-button'
                        style={{ marginLeft: '1rem' }}
                        onClick={handleResetPassword}>
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
                <div>
                  <div>
                    <p className='confirm-text'>
                      Are you sure you want to delete user <strong>{userData?.username}</strong>?
                      This action cannot be undone.
                    </p>
                    <button
                      className='delete-button'
                      onClick={() => pendingAction && pendingAction()}>
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
        </Tab>
        <Tab eventKey='stats' title='User Statistics'>
          <div className='page-container'>
            <div className='profile-card'>
              {userData ? (
                <>
                  <h4>Statistical Information: {userData.username}</h4>
                  <h6 style={{ marginTop: '5%' }}>
                    <strong>Pinned Badges:</strong>
                    {userData.pinnedBadge && userData.pinnedBadge !== '' && (
                      <img
                        src={userData.pinnedBadge}
                        alt='No image found'
                        style={{ marginLeft: '1rem', height: '75px', width: '75px' }}
                      />
                    )}
                  </h6>
                  {/* ---- Badges Section ---- */}
                  {userData.badges.length > 0 && (
                    <div style={{ margin: '1rem 0' }}>
                      <h6>
                        <strong>Badges:</strong>
                      </h6>
                      <p>
                        {userData.badges.map(img => (
                          <div key={img} style={{ display: 'inline-block', marginRight: '1rem' }}>
                            <img src={img} style={{ width: '100px', height: '100px' }} />
                            {canEditProfile && (
                              <button
                                className='login-button'
                                style={{
                                  display: 'block',
                                  marginTop: '0.5rem',
                                  marginLeft: '18px',
                                }}
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
                  {/* ---- Daily Streak Tracker Section ---- */}
                  {
                    <h6 style={{ paddingTop: '20px' }}>
                      <strong>Current Streak: </strong>{' '}
                      {userData.streak ? userData.streak.length : 0} day(s)
                    </h6>
                  }
                  {/* ---- Daily Streak Tracker Section ---- */}
                  {
                    <h6 style={{ paddingTop: '20px' }}>
                      <strong>Contribution Statistics </strong>
                    </h6>
                  }
                </>
              ) : (
                <p>No user data found. Make sure the username parameter is correct.</p>
              )}
            </div>
          </div>
        </Tab>
        {canEditProfile && (
          <Tab eventKey='notifications' title='Email and Notifications'>
            <div className='page-container'>
              <div className='profile-card'>
                {userData ? (
                  <>
                    <h4>Email and Notification Settings</h4>
                    {/* ---- Email Section ---- */}
                    {!addEmailMode && !replaceEmailMode && (
                      <div>
                        <h6>
                          <strong>Emails</strong>
                        </h6>
                        {userData.emails.map(email => (
                          <div key={email}>
                            <EmailDisplayItem
                              key={email}
                              email={email}
                              selectReplaceEmail={setEmailToReplace}
                              currEditMode={replaceEmailMode}
                              toggleReplace={() => {
                                setReplaceEmailMode(true);
                              }}
                              handleDeleteEmail={handleDeleteEmail}
                              setDeleteEmail={setEmailToDelete}
                            />
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
                            <EmailDisplayItem
                              key={email}
                              email={email}
                              selectReplaceEmail={setEmailToReplace}
                              currEditMode={replaceEmailMode}
                              toggleReplace={() => {
                                setReplaceEmailMode(true);
                              }}
                              handleDeleteEmail={handleDeleteEmail}
                              setDeleteEmail={setEmailToDelete}
                            />
                          ),
                        )}
                      </div>
                    )}

                    {/* ---- Toggling Notifications Section ---- */}
                    {canEditProfile && (
                      <>
                        <h4>Notifications</h4>
                        <div className='notification-display'>
                          <p>Browser-Side Notifications</p>
                          <input
                            type='checkbox'
                            checked={userData.browserNotif}
                            onChange={() => handleSubscription('browser')}
                          />
                        </div>
                        <div>
                          <input
                            type='checkbox'
                            checked={
                              userData.mutedTime && new Date() < new Date(userData.mutedTime)
                            }
                            onChange={() => handleMuteNotifications()}
                          />
                          <label>Mute Notification</label>
                        </div>
                        <div className='notification-display'>
                          <p>Email Notification</p>
                          <input
                            type='checkbox'
                            checked={userData.emailNotif}
                            onChange={() => handleSubscription('email')}
                          />
                        </div>
                        {userData.emailNotif && (
                          <div>
                            <input
                              type='radio'
                              value='weekly'
                              checked={userData.emailFrequency === 'weekly'}
                              onClick={() => handleChangeFrequency('weekly')}
                            />
                            <label>Weekly</label>
                            <input
                              type='radio'
                              value='hourly'
                              checked={userData.emailFrequency === 'hourly'}
                              onClick={() => handleChangeFrequency('hourly')}
                            />
                            <label>Hourly</label>
                            <input
                              type='radio'
                              value='daily'
                              checked={userData.emailFrequency === 'daily'}
                              onClick={() => handleChangeFrequency('daily')}
                            />
                            <label>Daily</label>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <p>No user data found. Make sure the username parameter is correct.</p>
                )}
              </div>
            </div>
          </Tab>
        )}
      </Tabs>
    </>
  );
};

export default ProfileSettings;
