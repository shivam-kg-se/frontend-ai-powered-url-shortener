export const getApiErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data;
  const validationErrors = responseData?.validationErrors;

  if (validationErrors && typeof validationErrors === "object") {
    const messages = Object.values(validationErrors)
      .filter((message) => typeof message === "string" && message.trim());

    if (messages.length) {
      return messages.join(" ");
    }
  }

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return typeof responseData?.message === "string" && responseData.message.trim()
    ? responseData.message
    : fallback;
};
