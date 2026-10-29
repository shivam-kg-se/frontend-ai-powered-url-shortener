import { useCallback, useEffect, useRef, useState } from "react";
import { FiCamera, FiCheck, FiInfo, FiTrash2, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import { getApiErrorMessage } from "../api/errorMessage";
import AccountPageNav from "./AccountPageNav";

const PROFILE_PICTURE_URL = "/api/users/me/profile-picture";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

const ProfilePage = () => {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUsername, setSavingUsername] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [pictureError, setPictureError] = useState("");
  const [profileRequest, setProfileRequest] = useState(0);

  const loadProfile = useCallback(async (signal) => {
    const response = await api.get("/api/users/me", { signal });
    if (signal?.aborted) return;

    setProfile(response.data);
    setUsername(response.data.username || "");

    if (!response.data.hasProfilePicture) {
      setImageUrl("");
      setPictureError("");
      return;
    }

    try {
      const picture = await api.get(PROFILE_PICTURE_URL, {
        responseType: "blob",
        signal,
      });
      const objectUrl = URL.createObjectURL(picture.data);
      if (signal?.aborted) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setImageUrl(objectUrl);
      setPictureError("");
    } catch (pictureRequestError) {
      if (
        pictureRequestError.name !== "CanceledError"
        && pictureRequestError.code !== "ERR_CANCELED"
      ) {
        setImageUrl("");
        setPictureError("The saved profile picture could not be loaded. You can upload another image.");
      }
    }
  }, []);

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    loadProfile(controller.signal)
      .catch((requestError) => {
        if (
          requestError.name !== "CanceledError"
          && requestError.code !== "ERR_CANCELED"
        ) {
          setError(getApiErrorMessage(requestError, "We couldn't load your profile."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [loadProfile, profileRequest]);

  const saveUsername = async (event) => {
    event.preventDefault();
    setUsernameError("");
    setSavingUsername(true);

    try {
      const { data } = await api.patch("/api/users/me", { username });
      setProfile(data);
      setUsername(data.username);
      toast.success("Username updated.");
    } catch (requestError) {
      setUsernameError(getApiErrorMessage(requestError, "We couldn't update your username."));
    } finally {
      setSavingUsername(false);
    }
  };

  const uploadPicture = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a PNG, JPEG, or GIF image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setPictureLoading(true);
    setPictureError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(PROFILE_PICTURE_URL, formData);
      await loadProfile();
      toast.success("Profile picture updated.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "We couldn't upload that picture."));
    } finally {
      setPictureLoading(false);
    }
  };

  const deletePicture = async () => {
    if (!window.confirm("Remove your current profile picture?")) return;

    setPictureLoading(true);
    setPictureError("");
    try {
      await api.delete(PROFILE_PICTURE_URL);
      setProfile((currentProfile) => ({ ...currentProfile, hasProfilePicture: false }));
      setImageUrl("");
      toast.success("Profile picture removed.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "We couldn't remove your picture."));
    } finally {
      setPictureLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="dashboard-shell profile-shell" aria-busy="true">
        <div className="dashboard-content">
          <div className="page-loading" role="status">Loading your profile…</div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="dashboard-shell profile-shell">
        <div className="dashboard-content">
          <div className="page-error" role="alert">
            <h1>Profile unavailable</h1>
            <p>{error || "Profile information could not be loaded."}</p>
            <button
              type="button"
              className="button-secondary"
              onClick={() => setProfileRequest((request) => request + 1)}
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const initials = profile.username
    ? profile.username.slice(0, 2).toUpperCase()
    : "U";
  const usernameChanged = username !== (profile.username || "");

  return (
    <main className="dashboard-shell profile-shell">
      <div className="dashboard-content">
        <header className="dashboard-heading account-page-heading">
          <div>
            <span className="dashboard-eyebrow">ACCOUNT SETTINGS</span>
            <h1>Profile</h1>
            <p>Manage how your Linkora-AI account is identified.</p>
          </div>
        </header>

        <AccountPageNav />

        <section className="account-profile-panel" aria-label="Profile settings">
          <div className="account-profile-overview">
            <div className="account-profile-identity">
              {imageUrl ? (
                <img
                  className="profile-avatar-image"
                  src={imageUrl}
                  alt={`Profile picture for ${profile.username || "your account"}`}
                />
              ) : (
                <span className="profile-avatar" aria-hidden="true">
                  {profile.username ? initials : <FiUser />}
                </span>
              )}
              <div className="profile-user-summary">
                <span className="account-overline">YOUR ACCOUNT</span>
                <h2>{profile.username || "Account"}</h2>
                <p>{profile.email || "Email is not available."}</p>
              </div>
            </div>
            <div className="profile-picture-actions">
              <input
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/gif"
                aria-label="Choose profile picture"
                className="visually-hidden"
                onChange={uploadPicture}
                type="file"
              />
              <button
                className="action-button"
                disabled={pictureLoading}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <FiCamera aria-hidden="true" />
                {pictureLoading ? "Uploading…" : profile.hasProfilePicture ? "Change picture" : "Add picture"}
              </button>
              {profile.hasProfilePicture && (
                <button
                  className="action-button action-button-danger"
                  disabled={pictureLoading}
                  onClick={() => void deletePicture()}
                  type="button"
                >
                  <FiTrash2 aria-hidden="true" />
                  Remove
                </button>
              )}
              <span className="field-help">PNG, JPEG, or GIF · up to 5 MB</span>
              {pictureError && <p className="account-inline-error" role="alert">{pictureError}</p>}
            </div>
          </div>

          <div className="account-profile-details">
            <form className="account-username-form" onSubmit={saveUsername}>
              <div className="account-section-title">
                <div>
                  <h2>Username</h2>
                  <p>This is the name associated with your Linkora-AI account.</p>
                </div>
              </div>
              <div className="account-username-control">
                <div className="field-group">
                  <label className="field-label" htmlFor="profile-username">Username</label>
                  <input
                    autoComplete="username"
                    aria-describedby="profile-username-help"
                    aria-invalid={Boolean(usernameError)}
                    className="field-input"
                    id="profile-username"
                    maxLength={50}
                    minLength={3}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setUsernameError("");
                    }}
                    pattern="[A-Za-z0-9._-]+"
                    required
                    value={username}
                  />
                  <span className="field-help" id="profile-username-help">3–50 characters: letters, numbers, dots, underscores, and hyphens.</span>
                  {usernameError && <p className="account-inline-error" role="alert">{usernameError}</p>}
                </div>
                <button
                  className="button-primary profile-save"
                  disabled={savingUsername || !usernameChanged}
                  type="submit"
                >
                  <FiCheck aria-hidden="true" />
                  {savingUsername ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>

            <section className="account-information" aria-labelledby="account-information-title">
              <div className="account-section-title">
                <div>
                  <h2 id="account-information-title">Account information</h2>
                  <p>Details currently associated with your account.</p>
                </div>
              </div>
              <dl className="account-information-list">
                <div>
                  <dt>Email address</dt>
                  <dd>{profile.email || "Not available"}</dd>
                </div>
                {profile.id != null && (
                  <div>
                    <dt>Account ID</dt>
                    <dd><code>{profile.id}</code></dd>
                  </div>
                )}
              </dl>
              <p className="account-information-note">
                <FiInfo aria-hidden="true" />
                <span>To change your email or password, visit <Link to="/settings">Security settings</Link>.</span>
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
