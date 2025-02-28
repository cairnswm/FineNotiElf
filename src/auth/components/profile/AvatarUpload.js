import React from 'react';
import { Image, Spinner } from 'react-bootstrap';
import useFileLoader from '../../hooks/useFileLoader';
import { combineUrlAndPath } from '../../utils/combineUrlAndPath';

const AvatarUpload = ({ user, onUploadSuccess, onUploadError, onUploadProgress }) => {
  const [isUploading, setIsUploading] = React.useState(false);

  const {
    fileData,
    fileInputRef,
    percent,
    fileSelected,
    uploadFile,
  } = useFileLoader(
    'AVATAR',
    handleUploadSuccess,
    handleUploadError,
    onUploadProgress
  );

  // Default avatar if none is set
  const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  const getAvatarUrl = (user) => {
    if (!user) {
      return defaultAvatar;
    }

    const avatarPath = user.avatar || user.picture;
    
    if (!avatarPath) {
      return defaultAvatar;
    }

    if (avatarPath.match(/^https?:\/\//)) {
      return avatarPath;
    }

    const fullUrl = combineUrlAndPath(process.env.REACT_APP_FILES, avatarPath);
    return `${fullUrl}?t=${new Date().getTime()}`;
  };

  const handleImageClick = () => {
    if (isUploading) return;
    fileInputRef.current.click();
  };

  const handleFileSelect = async (e) => {
    if (isUploading) return;
    
    fileSelected(e);
    if (e.target.files && e.target.files.length > 0) {
      try {
        setIsUploading(true);
        await uploadFile(e.target.files);
      } catch (err) {
        console.error('File upload error:', err);
        onUploadError('Failed to upload image.');
        setIsUploading(false);
      }
    }
  };

  async function handleUploadSuccess(response) {
    try {
      await onUploadSuccess(response);
    } finally {
      setIsUploading(false);
    }
  }

  function handleUploadError(error) {
    onUploadError(error);
    setIsUploading(false);
  }

  return (
    <div 
      className="position-relative d-inline-block mb-3"
      style={{ cursor: isUploading ? 'wait' : 'pointer' }}
      onClick={handleImageClick}
    >
      <Image
        src={fileData || getAvatarUrl(user)}
        alt={`${user?.firstname} ${user?.lastname}`}
        roundedCircle
        style={{ 
          width: '120px', 
          height: '120px',
          objectFit: 'cover',
          border: '2px solid #dee2e6',
          transition: 'opacity 0.3s',
          opacity: isUploading ? 0.6 : 1
        }}
      />
      {!isUploading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
          style={{
            background: 'rgba(0,0,0,0.5)',
            opacity: 0,
            transition: 'opacity 0.3s',
            ':hover': { opacity: 1 }
          }}
        >
          <span className="text-white">Change Photo</span>
        </div>
      )}
      {isUploading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          <Spinner animation="border" variant="light" />
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
        disabled={isUploading}
      />
    </div>
  );
};

export default AvatarUpload;
