import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { useStoreContext } from '../../contextApi/ContextValue';
import { useForm } from 'react-hook-form';
import TextField from '../TextField';
import { Tooltip } from '@mui/material';
import { FiCheck, FiCopy } from "react-icons/fi";
import { RxCross2 } from 'react-icons/rx';
import api from '../../api/api';
import { getApiErrorMessage } from "../../api/errorMessage";
import toast from 'react-hot-toast';

const CreateNewShorten = ({ setOpen, refetch }) => {
    const { token } = useStoreContext();
    const [loading, setLoading] = useState(false);
    const [createdUrl, setCreatedUrl] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [clipboardFallback, setClipboardFallback] = useState(false);
    const shortUrlInput = useRef(null);
    const submissionGuard = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      originalUrl: "",
    },
    mode: "onTouched",
  });

  const createShortUrlHandler = async (data) => {
    if (submissionGuard.current) return;
    submissionGuard.current = true;
    setErrorMessage("");
    setLoading(true);
    try {
        const { data: res } = await api.post("/api/urls/shorten", data, {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: "Bearer " + token,
            },
          });

          if (typeof res?.shortUrl !== "string" || !res.shortUrl.trim()) {
            setErrorMessage("The link was created, but the server did not return a short URL.");
            return;
          }

          const baseUrl = (
            import.meta.env.VITE_REACT_FRONT_END_URL || window.location.origin
          ).replace(/\/+$/, "");
          const resultUrl = `${baseUrl}/s/${encodeURIComponent(res.shortUrl.trim())}`;

          setCreatedUrl(resultUrl);
          setClipboardFallback(false);
          void refetch();
          reset();
          toast.success("Short link created.");
    } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "We couldn't create your short link. Check the URL and try again.")
        );
    } finally {
        submissionGuard.current = false;
        setLoading(false);
    }
  };

  const copyCreatedUrl = async () => {
    try {
      await navigator.clipboard.writeText(createdUrl);
      setClipboardFallback(false);
      toast.success("Short URL copied.");
    } catch {
      setClipboardFallback(true);
      shortUrlInput.current?.focus();
      shortUrlInput.current?.select();
      toast.error("Clipboard access is unavailable. The URL is selected so you can copy it.");
    }
  };

  const closeForm = () => {
    setOpen(false);
  };

  return (
    <div className="create-dialog-wrap" role="dialog" aria-modal="true" aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      {createdUrl ? (
        <section className="create-form create-result" aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <span className="create-result-icon"><FiCheck aria-hidden="true" /></span>
          <h1 id="modal-modal-title">Your short link is ready</h1>
          <p id="modal-modal-description" className="create-form-description">Copy it now, or select the URL below to copy it manually.</p>
          <div className="field-group">
            <label className="field-label" htmlFor="created-short-url">Short URL</label>
            <input
              ref={shortUrlInput}
              className="field-input created-short-url"
              id="created-short-url"
              onFocus={(event) => event.target.select()}
              readOnly
              value={createdUrl}
            />
          </div>
          {clipboardFallback && (
            <p className="create-copy-help" role="status">The short URL is selected. Use your device’s copy command.</p>
          )}
          <div className="create-result-actions">
            <button className="create-submit" onClick={() => void copyCreatedUrl()} type="button">
              <FiCopy aria-hidden="true" /> Copy short URL
            </button>
            <button className="button-secondary" onClick={closeForm} type="button">Done</button>
          </div>
          <button type="button" onClick={closeForm} className="close-button" aria-label="Close create short URL">
            <RxCross2 aria-hidden="true" />
          </button>
        </section>
      ) : (
        <form onSubmit={handleSubmit(createShortUrlHandler)} className="create-form">
          <h1 id="modal-modal-title">Create a short link</h1>
          <p id="modal-modal-description" className="create-form-description">
            Add a destination to create a shareable short link.
          </p>
          <hr />
          {errorMessage && <p className="form-alert" role="alert">{errorMessage}</p>}
          <TextField
            label="Destination URL"
            required
            id="originalUrl"
            placeholder="https://example.com"
            type="url"
            message="Enter a destination URL"
            register={register}
            errors={errors}
          />
          <button disabled={loading} className="create-submit" type="submit">
            {loading ? "Creating link…" : "Create short link"}
          </button>
          <Tooltip title="Close">
            <button
              type="button"
              disabled={loading}
              onClick={closeForm}
              className="close-button"
              aria-label="Close create short URL"
            >
              <RxCross2 aria-hidden="true" />
            </button>
          </Tooltip>
        </form>
      )}
    </div>
  )
}

CreateNewShorten.propTypes = {
  setOpen: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};

export default CreateNewShorten