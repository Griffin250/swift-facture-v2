// Global debugging interceptor for fetch requests
// Add this to your main.jsx or app entry point

const originalFetch = window.fetch;

window.fetch = function(...args) {
  const url = args[0];
  const options = args[1] || {};
  
  // Only log Supabase function calls
  if (url.toString().includes('supabase.co/functions/v1/')) {
    const functionName = url.toString().split('/functions/v1/')[1];
    
    console.log(`🌐 [FETCH] Starting request to ${functionName}`, {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      timestamp: new Date().toISOString()
    });
    
    const startTime = performance.now();
    
    return originalFetch.apply(this, args)
      .then(response => {
        const duration = Math.round(performance.now() - startTime);
        
        console.log(`📨 [FETCH] Response from ${functionName}`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          duration: `${duration}ms`,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Clone response to read body without consuming original
        const clonedResponse = response.clone();
        
        // Try to read and log response body
        clonedResponse.text().then(text => {
          console.log(`📄 [FETCH] Response body from ${functionName}:`, {
            text: text.substring(0, 1000), // Limit to first 1000 chars
            length: text.length,
            truncated: text.length > 1000
          });
        }).catch(e => {
          console.log(`⚠️ [FETCH] Could not read response body: ${e.message}`);
        });
        
        return response;
      })
      .catch(error => {
        const duration = Math.round(performance.now() - startTime);
        
        console.error(`❌ [FETCH] Network error for ${functionName}`, {
          error,
          message: error.message,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      });
  }
  
  // For non-Supabase requests, use original fetch
  return originalFetch.apply(this, args);
};

console.log('✅ [DEBUG] Global fetch interceptor installed for Supabase functions');