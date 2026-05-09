const FRANKFURTER_API_URL = "https://api.frankfurter.dev/v1/latest";
const REQUEST_TIMEOUT_MS = 5000;

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

export async function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const { signal, cleanup } = createTimeoutSignal(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${FRANKFURTER_API_URL}?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Exchange rate request failed with status ${response.status}`,
      );
    }

    const data = await response.json();
    const rate = Number(data?.rates?.[toCurrency]);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Exchange rate API returned an invalid rate");
    }

    return rate;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Exchange rate request timed out");
    }

    throw error;
  } finally {
    cleanup();
  }
}
