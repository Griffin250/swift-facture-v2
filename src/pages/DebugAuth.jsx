import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugAuth = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 1: Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      addResult('Environment Variables', true, `URL: ${supabaseUrl.substring(0, 30)}...`);
    } else {
      addResult('Environment Variables', false, 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
    }

    // Test 2: Check Supabase connection
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      addResult('Supabase Connection', true, 'Successfully connected to Supabase');
    } catch (error) {
      addResult('Supabase Connection', false, error.message);
    }

    // Test 3: Test signup with a dummy email
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123456',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
          },
        },
      });

      if (error) {
        addResult('Test Signup', false, error.message);
      } else if (data.user && !data.session) {
        addResult('Test Signup', true, 'Email confirmation required - this is normal');
      } else if (data.user && data.session) {
        addResult('Test Signup', true, 'User created and logged in successfully');
        // Clean up - sign out the test user
        await supabase.auth.signOut();
      } else {
        addResult('Test Signup', false, 'Unexpected response from signup');
      }
    } catch (error) {
      addResult('Test Signup', false, error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} disabled={loading} className="w-full">
              {loading ? 'Running Tests...' : 'Run Authentication Tests'}
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.test}</span>
                      <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.success ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    <p className="text-xs text-gray-400">{result.timestamp}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900">Common Issues:</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Email confirmation might be enabled in Supabase settings</li>
                <li>• Check that environment variables are properly set</li>
                <li>• Ensure password meets minimum requirements (6+ characters)</li>
                <li>• Verify all required fields are filled</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugAuth;