// API Helper utilities for better reliability

/**
 * Fetches data with automatic retry on failure
 * @param url The URL to fetch
 * @param options Fetch options
 * @param maxRetries Maximum number of retries (default: 3)
 * @param timeout Timeout in milliseconds (default: 30000)
 * @returns Promise with the response
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  timeout: number = 30000
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create an AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // If successful, return immediately
      if (response.ok) {
        return response
      }

      // If client error (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        return response
      }

      // For 5xx errors, retry
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
      console.warn(
        `[fetchWithRetry] Attempt ${attempt}/${maxRetries} failed with status ${response.status}`
      )
    } catch (error: any) {
      lastError = error

      // Don't retry on abort (timeout)
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms: ${url}`)
      }

      console.warn(
        `[fetchWithRetry] Attempt ${attempt}/${maxRetries} failed:`,
        error.message
      )
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // All retries failed
  throw new Error(
    `Failed after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`
  )
}

/**
 * Wrapper for fetch that adds timeout without retry
 * @param url The URL to fetch
 * @param options Fetch options
 * @param timeout Timeout in milliseconds (default: 30000)
 * @returns Promise with the response
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms: ${url}`)
    }

    throw error
  }
}
