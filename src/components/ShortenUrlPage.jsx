
import  { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ShortenUrlPage = () => {
    const { url } = useParams();

    useEffect(() => {
        if (url) {
            const backendUrl = import.meta.env.VITE_BACKEND_URL
                .replace(/\/+$/, '');

            window.location.href = `${backendUrl}/${url}`;
        }
    }, [url]);

    return <p className="redirect-message" role="status" aria-live="polite">Redirecting to your destination…</p>;
};

export default ShortenUrlPage;
