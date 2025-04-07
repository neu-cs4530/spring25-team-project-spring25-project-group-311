import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import CalendarHeatmap from 'react-calendar-heatmap';
import useProfileSettings from '../../hooks/useProfileSettings';
import EmailDisplayItem from './emailDisplayItem';
import { useHeaderContext } from '../../contexts/HeaderContext';
import { Challenge } from '../../types/types';

const PROFILE_API_URL = `${process.env.REACT_APP_SERVER_URL}/challenges`;

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
    errorMessage,
    emailToReplace,
    showConfirmation,
    pendingAction,
    canEditProfile,
    convertActivityToValues,
    getColorClass,
    floatingContent,

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
    handleAddNewBanner,
    handleNewSelectedBanner,
    handleChangeFrequency,
    handleMuteNotifications,
    handleAddPinnedBadge,
    handleMouseOver,
    handleMouseLeave,
    handleMouseMove,
    handleDeleteEmail,
    handleRemovePinnedBadge,
  } = useProfileSettings();
  const { setHeaderBackground } = useHeaderContext();

  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  useEffect(() => {
    const fetchDailyChallenge = async () => {
      try {
        const response = await axios.get(`${PROFILE_API_URL}/daily`);
        setDailyChallenge(response.data);
        setChallengeCompleted(response.data.completed);
      } catch (error) {
        console.error('Error fetching daily challenge:', error);
      }
    };

    fetchDailyChallenge();
  }, []);

  const handleCompleteChallenge = async () => {
    if (!dailyChallenge || !dailyChallenge._id) return;

    try {
      const url = `${PROFILE_API_URL}/complete/${dailyChallenge._id}`;
      const response = await axios.post(url);
      if (response.status === 200) {
        setChallengeCompleted(true);
        handleRefresh();
      } else {
        throw new Error(`Failed to complete challenge with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to complete challenge:', error);
    }
  };

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
              {errorMessage && <p className='error-message'>{errorMessage}</p>}
              {userData ? (
                <>
                  <h2>General Information</h2>
                  <h6 style={{ marginTop: '5%' }}>
                    <strong>Username:</strong> {userData.username}
                  </h6>
                  {/* ---- Biography Section ---- */}
                  {!editBioMode && (
                    <h6>
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
                    </h6>
                  )}
    <div className='page-container'>
      <div className='profile-card'>
        <h2>Profile</h2>
        {successMessage && <p className='success-message'>{successMessage}</p>}
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        {userData ? (
          <>
            <button
              className='login-button'
              onClick={() => {
                handleRefresh();
              }}>
              Refresh
            </button>
            <h4>General Information</h4>
            <p>
              <strong>Username:</strong> {userData.username}
              {userData.pinnedBadge && userData.pinnedBadge !== '' && (
                <img
                  src={userData.pinnedBadge}
                  alt='No image found'
                  style={{ marginLeft: '1rem', height: '75px', width: '75px' }}
                />
              )}
            </p>

            {/* ---- Daily Streak Tracker Section ---- */}
            {
              <p>
                <strong>Current Streak: </strong> {userData.streak ? userData.streak.length : 0}
              </p>
            }

            {/* ---- Heatmap Section ---- */}
            {
              <div onMouseMove={handleMouseMove} style={{ position: 'relative' }}>
                <CalendarHeatmap
                  startDate={new Date('2025-01-01')}
                  endDate={new Date('2025-12-31')}
                  values={convertActivityToValues() || []}
                  classForValue={value => {
                    if (!value || !value.count) return 'color-empty';
                    return getColorClass(value.count);
                  }}
                  onMouseOver={handleMouseOver}
                  onMouseLeave={handleMouseLeave}
                />
                {floatingContent.visible && (
                  <div
                    className='tooltip'
                    style={{
                      position: 'fixed',
                      left: floatingContent.x + 10,
                      top: floatingContent.y + 10,
                      backgroundColor: 'white',
                      border: '1px solid black',
                      padding: '5px',
                      zIndex: 1000,
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                      borderRadius: '4px',
                      color: '#000',
                    }}>
                    {floatingContent.content}
                  </div>
                )}
              </div>
            }

            {/* Daily Challenge Section */}
            {dailyChallenge && (
              <div>
                <h4>Daily Challenge</h4>
                <span>{dailyChallenge.description}</span>
                <span
                  className={`challenge-status ${challengeCompleted ? 'challenge-completed' : 'challenge-pending'}`}>
                  {challengeCompleted ? 'Completed' : 'Not Completed'}
                </span>
              </div>
            )}

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

                  <h6>
                    <strong>Date Joined:</strong>{' '}
                    {userData.dateJoined
                      ? new Date(userData.dateJoined).toLocaleDateString()
                      : 'N/A'}
                  </h6>

                  {/* ---- Reset Password Section ---- */}
                  {canEditProfile && (
                    <>
                      <h5 style={{ marginTop: '5%' }}>
                        <strong>Reset Password</strong>
                      </h5>
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
                      <h5 style={{ marginTop: '5%' }}>
                        <strong>Danger Zone</strong>
                      </h5>
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
              {errorMessage && <p className='error-message'>{errorMessage}</p>}
              {userData ? (
                <>
                  <h2>Statistical Information: {userData.username}</h2>
                  <h6 style={{ marginTop: '5%' }}>
                    <strong>Pinned Badges:</strong>
                    {userData.pinnedBadge &&
                      userData.pinnedBadge.length > 0 &&
                      userData.pinnedBadge.map(pb => (
                        <img
                          className='badge-image'
                          key={pb}
                          src={pb}
                          alt='No image found'
                          style={{ marginLeft: '1rem', height: '75px', width: '75px' }}
                          onClick={() => handleRemovePinnedBadge(pb)}
                        />
                      ))}
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

                  {/* ---- Heatmap Section ---- */}
                  {
                    <div onMouseMove={handleMouseMove} style={{ position: 'relative' }}>
                      <CalendarHeatmap
                        startDate={new Date('2025-01-01')}
                        endDate={new Date('2025-12-31')}
                        values={convertActivityToValues() || []}
                        classForValue={value => {
                          if (!value || !value.count) return 'color-empty';
                          return getColorClass(value.count);
                        }}
                        onMouseOver={handleMouseOver}
                        onMouseLeave={handleMouseLeave}
                      />
                      {floatingContent.visible && (
                        <div
                          className='heatmap-tooltip'
                          style={{
                            position: 'fixed',
                            left: floatingContent.x + 10,
                            top: floatingContent.y + 10,
                            backgroundColor: 'white',
                            border: '1px solid black',
                            padding: '5px',
                            zIndex: 1000,
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            borderRadius: '4px',
                            color: '#000',
                          }}>
                          {floatingContent.content}
                        </div>
                      )}
                    </div>
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
                {errorMessage && <p className='error-message'>{errorMessage}</p>}
                {userData ? (
                  <>
                    <h2>Email and Notification Settings</h2>
                    <h5 style={{ marginTop: '5%' }}>
                      <strong>{userData.username} Emails</strong>
                    </h5>
                    {/* ---- Email Section ---- */}
                    {!addEmailMode && !replaceEmailMode && (
                      <div>
                        {userData.emails.map(email => (
                          <div key={email}>
                            <EmailDisplayItem
                              email={email}
                              selectReplaceEmail={setEmailToReplace}
                              currEditMode={replaceEmailMode}
                              toggleReplace={() => setReplaceEmailMode(true)}
                              handleDeleteEmail={handleDeleteEmail}
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
                              selectReplaceEmail={setEmailToReplace}
                              currEditMode={replaceEmailMode}
                              toggleReplace={() => setReplaceEmailMode(true)}
                              handleDeleteEmail={handleDeleteEmail}
                            />
                          ),
                        )}
                      </div>
                    )}

                    {/* ---- Toggling Notifications Section ---- */}
                    {
                      <>
                        <h5 style={{ marginTop: '10%' }}>
                          <strong>{userData.username} Notification Types</strong>
                        </h5>
                        <div className='notification-display'>
                          <input
                            type='checkbox'
                            checked={userData.browserNotif}
                            onChange={() => handleSubscription('browser')}
                          />
                          <label style={{ marginLeft: '10px' }}>
                            <strong>Browser-Side Notifications</strong>
                          </label>
                          {userData.browserNotif && (
                            <div style={{ marginTop: '1.5%', marginLeft: '7%' }}>
                              <input
                                type='checkbox'
                                checked={
                                  userData.mutedTime && new Date() < new Date(userData.mutedTime)
                                }
                                onChange={() => handleMuteNotifications()}
                              />
                              <label style={{ marginLeft: '10px' }}>
                                <strong>Mute Browser Notifications</strong> (for an hour)
                              </label>
                            </div>
                          )}
                        </div>

                        <div className='notification-display'>
                          <input
                            type='checkbox'
                            checked={userData.emailNotif}
                            onChange={() => handleSubscription('email')}
                          />
                          <label style={{ marginLeft: '10px' }}>
                            <strong>Email Notifications</strong>
                          </label>
                        </div>
                        {userData.emailNotif && (
                          <div style={{ marginTop: '1.5%', marginLeft: '7%' }}>
                            <h6>
                              <strong>Frequency of Email Notifications</strong>
                            </h6>
                            <div>
                              <input
                                type='radio'
                                value='weekly'
                                checked={userData.emailFrequency === 'weekly'}
                                onClick={() => handleChangeFrequency('weekly')}
                              />
                              <label style={{ marginLeft: '10px' }}>Weekly</label>
                            </div>
                            <div>
                              <input
                                type='radio'
                                value='hourly'
                                checked={userData.emailFrequency === 'hourly'}
                                onClick={() => handleChangeFrequency('hourly')}
                              />
                              <label style={{ marginLeft: '10px' }}>Hourly</label>
                            </div>
                            <div>
                              <input
                                type='radio'
                                value='daily'
                                checked={userData.emailFrequency === 'daily'}
                                onClick={() => handleChangeFrequency('daily')}
                              />
                              <label style={{ marginLeft: '10px' }}>Daily</label>
                            </div>
                          </div>
                        )}
                      </>
                    }
                  </>
                ) : (
                  <p>No user data found. Make sure the username parameter is correct.</p>
                )}
              </div>
            </div>
          </Tab>
        )}
        {canEditProfile && (
          <Tab eventKey='customization' title='Customization'>
            <div className='page-container'>
              <div className='profile-card'>
                {errorMessage && <p className='error-message'>{errorMessage}</p>}
                {userData ? (
                  <>
                    <h2>Customize User Experience</h2>
                    <h5 style={{ marginTop: '5%' }}>
                      <strong>Banners Available to {userData.username}</strong>
                    </h5>
                    {/* ---- Banners Section ---- */}
                    {
                      <div style={{ margin: '1rem 0' }}>
                        <p>
                          {userData.banners?.map(img => (
                            <div key={img} style={{ display: 'inline-block', marginRight: '1rem' }}>
                              <button
                                className='login-button'
                                style={{
                                  display: 'block',
                                  marginTop: '0.5rem',
                                  marginLeft: '10px',
                                  backgroundColor: img,
                                  width: '60px',
                                  height: '30px',
                                }}
                                onClick={() => {
                                  handleNewSelectedBanner(img);
                                  setHeaderBackground(img);
                                }}></button>
                            </div>
                          ))}
                        </p>
                      </div>
                    }
                    {
                      <div style={{ margin: '5% 0' }}>
                        <h5>
                          <strong>Banner Store</strong>
                        </h5>
                        <p>
                          {['red', 'orange', 'yellow', 'purple'].map(color => (
                            <div
                              key={color}
                              style={{
                                display: 'inline-block',
                                marginRight: '1rem',
                                textAlign: 'center',
                              }}>
                              <div>
                                <div
                                  className='user-badge'
                                  style={{
                                    backgroundColor: color,
                                    width: '60px',
                                    height: '30px',
                                    margin: '0 auto',
                                  }}></div>
                                {userData.badges.length > 0 && (
                                  <button
                                    className='login-button'
                                    style={{
                                      width: '60px',
                                      height: '30px',
                                      marginTop: '1rem',
                                      marginLeft: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    onClick={() => {
                                      handleAddNewBanner(color);
                                    }}>
                                    Buy
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </p>
                      </div>
                    }
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
