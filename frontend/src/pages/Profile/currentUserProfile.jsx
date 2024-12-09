import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "redaxios";
import styles from "./styles/profile.module.scss";


const CurrentUserProfile = () => {
  const { currentUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState(
    currentUser.profilePictureUrl
  );
  const [coverPicture, setCoverPicture] = useState(currentUser.coverPictureUrl);
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [expertise, setExpertise] = useState(currentUser.expertise);
  const [languages, setLanguages] = useState(currentUser.languages);
  const [about, setAbout] = useState(currentUser.about);
  const [isEditing, setIsEditing] = useState(false);

  console.log("Current user in profile component: ", currentUser);

  const handleNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleExpertiseChange = (e) => {
    setExpertise(e.target.value);
  };

  const handleLanguagesChange = (e) => {
    setLanguages(e.target.value);
  };

  const handleAboutChange = (e) => {
    setAbout(e.target.value);
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${
            currentUser._id
          }/profile-picture`
        );
        setProfilePicture(response.data.profilePictureUrl);
      } catch (error) {
        console.log(
          "Error occured in fetching profile picture: ",
          error.message
        );
        console.error("Error fetching profile picture:", error);
      }
    };
    const fetchCoverPicture = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${
            currentUser._id
          }/cover-picture`
        );
        setCoverPicture(response.data.coverPictureUrl);
      } catch (error) {
        console.error("Error fetching cover picture:", error);
      }
    };

    fetchProfilePicture();
    fetchCoverPicture();
  }, [currentUser]);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/${
          currentUser.id
        }/profile-picture`,
        formData
      );
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${
          currentUser.id
        }/profile-picture`
      );
      setProfilePicture(response.data.profilePictureUrl);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleCoverPictureUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("coverPicture", file);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/${
          currentUser.id
        }/cover-picture`,
        formData
      );
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${
          currentUser.id
        }/cover-picture`
      );
      setCoverPicture(response.data.coverPictureUrl);
    } catch (error) {
      console.error("Error uploading cover picture:", error);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/user/${
          currentUser.id
        }/update`,
        {
          firstName,
          lastName,
          expertise,
          languages,
          about,
        }
      );
      setExpertise(response.data.expertise);
      setLanguages(response.data.languages);
      setAbout(response.data.about);
      // setCurrentUser(response.data.user);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const toggleEditMode = async () => {
    if (isEditing) {
      try {
        await updateProfile();
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
    setIsEditing(!isEditing);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.coverPictureContainer}>
        <img
          src={coverPicture}
          alt="Cover Picture"
          className={styles.coverPicture}
        />
        <label htmlFor="coverPictureInput" className={styles.coverPictureLabel}>
          Change Cover Picture
        </label>
        <input
          id="coverPictureInput"
          type="file"
          accept="image/*"
          onChange={handleCoverPictureUpload}
          style={{ display: "none" }}
        />
      </div>

      <div className={styles.mainProfileWrapper}>
        <div className={styles.mainProfileContainer}>
          <div className={styles.profilePictureContainer}>
            <img
              src={currentUser.profilePictureUrl}
              alt="Profile Picture"
              className={styles.profilePicture}
            />

            <>
              <label
                htmlFor="profilePictureInput"
                className={styles.profilePictureLabel}
              >
                Change
              </label>
              <input
                id="profilePictureInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: "none" }}
              />
            </>
          </div>

          {isEditing ? (
            <>
              <label htmlFor="nameInput" className={styles.nameLabel}>
                Name
              </label>

              <input
                className={styles.nameInput}
                type="text"
                value={firstName}
                onChange={handleNameChange}
              />
            </>
          ) : (
            <h2>
              {firstName} {lastName}
            </h2>
          )}

          {isEditing ? (
            <>
              <label htmlFor="expertiseInput" className={styles.expertiseLabel}>
                Expertise
              </label>

              <input
                className={styles.expertiseInput}
                type="text"
                value={expertise}
                onChange={handleExpertiseChange}
              />
            </>
          ) : (
            <h5>{expertise}</h5>
          )}

          {isEditing ? (
            <>
              <label htmlFor="languagesInput" className={styles.languagesLabel}>
                Languages
              </label>

              <input
                className={styles.languagesInput}
                type="text"
                value={languages}
                onChange={handleLanguagesChange}
              />
            </>
          ) : (
            <p>Languages: {languages}</p>
          )}

          {/* <h4>About</h4> */}
          {isEditing ? (
            <>
              <label htmlFor="aboutInput" className={styles.aboutLabel}>
                About
              </label>
              <textarea
                className={styles.aboutInput}
                value={about}
                onChange={handleAboutChange}
              ></textarea>
            </>
          ) : (
            <p>{about}</p>
          )}

          <div className={styles.buttonsContainer}>
            <button onClick={toggleEditMode}>
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
            {isEditing && (
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentUserProfile;
