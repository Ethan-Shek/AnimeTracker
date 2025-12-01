const React = require('react');
const { useState } = React;

// Component for user profile and premium features
const ProfilePage = (props) => {
  const { userProfile, onProfileUpdate } = props;
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [creditAmount, setCreditAmount] = useState(5);
  const [purchaseError, setPurchaseError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters!');
      return;
    }

    try {
      const response = await fetch('/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setPasswordError(result.error || 'Failed to change password');
        return;
      }

      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordChange(false), 2000);
    } catch (err) {
      console.error(err);
      setPasswordError('Error changing password!');
    }
  };

  const handlePurchaseCredits = async () => {
    setPurchaseError('');

    try {
      const response = await fetch('/purchaseCredits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseInt(creditAmount, 10),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setPurchaseError(result.error || 'Failed to purchase credits');
        return;
      }

      if (onProfileUpdate) {
        onProfileUpdate(result);
      }

      setCreditAmount(5);
    } catch (err) {
      console.error(err);
      setPurchaseError('Error purchasing credits!');
    }
  };

  if (!userProfile) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Your Profile</h2>
      </div>

      <div className="profile-section">
        <h3>Account Information</h3>
        <div className="profile-info">
          <p>
            <strong>Username:</strong>
            {' '}
            {userProfile.username}
          </p>
          <p>
            <strong>Status:</strong>
            {' '}
            {userProfile.isPremium ? (
              <span className="premium-badge">⭐ Premium</span>
            ) : (
              <span>Free</span>
            )}
          </p>
          {userProfile.isPremium && (
            <p>
              <strong>Premium Credits:</strong>
              {' '}
              {userProfile.premiumCredits}
            </p>
          )}
        </div>
      </div>

      <div className="profile-section">
        <button
          type="button"
          className="btn-toggle"
          onClick={() => setShowPasswordChange(!showPasswordChange)}
        >
          {showPasswordChange ? 'Hide' : 'Change Password'}
        </button>

        {showPasswordChange && (
          <form onSubmit={handleChangePassword} className="password-form">
            {passwordError && (
              <div className="error-message">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="success-message">{passwordSuccess}</div>
            )}

            <div className="form-group">
              <label htmlFor="currentPass">Current Password</label>
              <input
                id="currentPass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPass">New Password</label>
              <input
                id="newPass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPass">Confirm New Password</label>
              <input
                id="confirmPass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit">
              Update Password
            </button>
          </form>
        )}
      </div>

      <div className="profile-section">
        <h3>Premium Features</h3>
        <p>
          Get premium access to create custom collections and organize your
          anime the way you like!
        </p>

        {userProfile.isPremium ? (
          <div className="premium-section">
            <p className="premium-text">✨ You are a premium member!</p>
            <div className="credits-section">
              <p>
                <strong>Your Credits:</strong>
                {' '}
                {userProfile.premiumCredits}
              </p>
              <div className="purchase-credits">
                <label htmlFor="creditAmount">Purchase More Credits:</label>
                <select
                  id="creditAmount"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                >
                  <option value={5}>5 credits ($0.99 demo)</option>
                  <option value={10}>10 credits ($1.99 demo)</option>
                  <option value={25}>25 credits ($4.99 demo)</option>
                </select>
                {purchaseError && (
                  <div className="error-message">{purchaseError}</div>
                )}
                <button
                  type="button"
                  className="btn-purchase"
                  onClick={handlePurchaseCredits}
                >
                  Purchase Credits
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="upgrade-section">
            <p className="upgrade-text">
              Unlock premium features by purchasing credits!
            </p>
            <div className="purchase-section">
              <label htmlFor="upgradeCredits">Purchase Credits:</label>
              <select
                id="upgradeCredits"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              >
                <option value={5}>5 credits ($0.99 demo)</option>
                <option value={10}>10 credits ($1.99 demo)</option>
                <option value={25}>25 credits ($4.99 demo)</option>
              </select>
              {purchaseError && (
                <div className="error-message">{purchaseError}</div>
              )}
              <button
                type="button"
                className="btn-upgrade"
                onClick={handlePurchaseCredits}
              >
                Get Premium
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

module.exports = ProfilePage;
