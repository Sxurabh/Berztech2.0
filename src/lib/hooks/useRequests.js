import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export function useRequests(apiEndpoint = "/api/requests") {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, [apiEndpoint]);

    async function fetchRequests() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(apiEndpoint);
            const json = await res.json();

            if (res.ok) {
                setRequests(json.data || []);
            } else {
                setError(json.error || "Access Denied. Please ensure you are logged in.");
                toast.error("Failed to load requests");
            }
        } catch (err) {
            setError("Network error fetching data. Ensure you are authenticated.");
            toast.error("Error fetching requests data");
        } finally {
            setLoading(false);
        }
    }

    const refreshRequests = () => {
        return fetchRequests();
    };

    return { requests, loading, error, refreshRequests };
}
