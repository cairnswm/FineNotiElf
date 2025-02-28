import React, { useState, useEffect } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import AvatarUpload from '../components/profile/AvatarUpload';
import ProfileForm from '../components/profile/ProfileForm';

const Profile = () => {
  const { user, saveUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstname || '');
  const [lastName, setLastName] = useState(user?.lastname || '');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstname || '');
      setLastName(user.lastname || '');
    }
  }, [user]);

  const handleUploadSuccess = async (response) => {
    try {
      if (!response.filename) {
        throw new Error('Invalid upload response - no filename received');
      }

      const updatedUser = {
        ...user,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        avatar: response.filename
      };

      console.log('Saving user with new avatar:', updatedUser);
      const result = await saveUser(updatedUser);
      
      if (result && result.errors) {
        throw new Error('Failed to save user data');
      }

      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      console.error('Avatar update error:', err);
      setError('Failed to update profile picture in database.');
    }
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage || 'Failed to upload image.');
  };

  const handleUploadProgress = (percent) => {
    console.log('Upload progress:', percent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedUser = {
        ...user,
        firstname: firstName,
        lastname: lastName
      };

      const result = await saveUser(updatedUser);
      
      if (result && result.errors) {
        throw new Error('Failed to save user data');
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setFirstName(user?.firstname || '');
    setLastName(user?.lastname || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <Container className="py-5">
      <Card style={{ maxWidth: '600px' }} className="mx-auto">
        <Card.Body>
          <div className="text-center mb-4">
            <AvatarUpload
              user={user}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              onUploadProgress={handleUploadProgress}
            />
            <h2>Profile</h2>
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              {success}
            </Alert>
          )}

          <ProfileForm
            user={user}
            firstName={firstName}
            lastName={lastName}
            isEditing={isEditing}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onSubmit={handleSubmit}
            onEdit={handleEdit}
            onCancel={handleCancel}
          />

          <div className="mt-3 text-center text-muted">
            <small>
              Click on the profile picture to change your avatar
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
