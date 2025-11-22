import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { env } from "@/config/env";

export default function EnvCheck() {
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    const runTests = async () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        environment: {},
        validation: {},
        supabaseTest: {},
        networkTest: {},
      };

      // Check environment variables
      results.environment = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?
          `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET',
        hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        fromEnvConfig: {
          url: env.supabaseUrl || 'NOT SET',
          keyPresent: !!env.supabaseAnonKey,
        }
      };

      // Check validation results
      results.validation = {
        isSupabaseConfigured,
        urlLength: env.supabaseUrl?.length || 0,
        keyLength: env.supabaseAnonKey?.length || 0,
      };

      // Test Supabase connection
      try {
        console.log('[EnvCheck] Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();
        results.supabaseTest = {
          success: !error,
          hasSession: !!data?.session,
          error: error ? {
            name: error.name,
            message: error.message,
          } : null,
        };
      } catch (error: any) {
        console.error('[EnvCheck] Supabase test failed:', error);
        results.supabaseTest = {
          success: false,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        };
      }

      // Test network connectivity to Supabase
      if (env.supabaseUrl && env.supabaseAnonKey) {
        try {
          console.log('[EnvCheck] Testing network connectivity...');
          const response = await fetch(`${env.supabaseUrl}/rest/v1/`, {
            method: 'GET',
            headers: {
              'apikey': env.supabaseAnonKey,
            },
          });
          results.networkTest = {
            success: true,
            status: response.status,
            statusText: response.statusText,
            url: env.supabaseUrl,
          };
        } catch (error: any) {
          console.error('[EnvCheck] Network test failed:', error);
          results.networkTest = {
            success: false,
            error: {
              name: error.name,
              message: error.message,
            },
          };
        }
      } else {
        results.networkTest = {
          success: false,
          skipped: true,
          message: 'Skipped: Supabase URL or Key not configured',
        };
      }

      console.log('[EnvCheck] All tests complete:', results);
      setTestResults(results);
    };

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment & Configuration Check</CardTitle>
            <CardDescription>
              Diagnostic tool to check Supabase configuration and connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!testResults ? (
              <p className="text-muted-foreground">Running tests...</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">🔧 Environment Variables</h3>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(testResults.environment, null, 2)}
                  </pre>
                  <div className="mt-2 space-y-1">
                    <div className={`text-sm ${testResults.environment.hasUrl ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.environment.hasUrl ? '✅' : '❌'} VITE_SUPABASE_URL is {testResults.environment.hasUrl ? 'set' : 'NOT set'}
                    </div>
                    <div className={`text-sm ${testResults.environment.hasKey ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.environment.hasKey ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY is {testResults.environment.hasKey ? 'set' : 'NOT set'}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">✅ Validation Results</h3>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(testResults.validation, null, 2)}
                  </pre>
                  <div className="mt-2">
                    <div className={`text-sm ${testResults.validation.isSupabaseConfigured ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.validation.isSupabaseConfigured ? '✅' : '❌'} Supabase is {testResults.validation.isSupabaseConfigured ? 'configured' : 'NOT configured'}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🔌 Supabase Connection Test</h3>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(testResults.supabaseTest, null, 2)}
                  </pre>
                  <div className="mt-2">
                    <div className={`text-sm ${testResults.supabaseTest.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.supabaseTest.success ? '✅' : '❌'} Supabase client {testResults.supabaseTest.success ? 'working' : 'FAILED'}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🌐 Network Connectivity Test</h3>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(testResults.networkTest, null, 2)}
                  </pre>
                  <div className="mt-2">
                    <div className={`text-sm ${testResults.networkTest.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.networkTest.success ? '✅' : '❌'} Network connectivity {testResults.networkTest.success ? 'OK' : 'FAILED'}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">🔍 Troubleshooting Guide</h3>
                  <div className="text-sm space-y-2">
                    {!testResults.environment.hasUrl && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                        <p className="font-semibold text-destructive">❌ Missing VITE_SUPABASE_URL</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Set in Vercel: Settings → Environment Variables → Add VITE_SUPABASE_URL
                        </p>
                      </div>
                    )}
                    {!testResults.environment.hasKey && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                        <p className="font-semibold text-destructive">❌ Missing VITE_SUPABASE_ANON_KEY</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Set in Vercel: Settings → Environment Variables → Add VITE_SUPABASE_ANON_KEY
                        </p>
                      </div>
                    )}
                    {!testResults.validation.isSupabaseConfigured && testResults.environment.hasUrl && testResults.environment.hasKey && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                        <p className="font-semibold text-destructive">❌ Invalid credentials</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Environment variables are set but failed validation. Check for typos or placeholder values.
                        </p>
                      </div>
                    )}
                    {!testResults.networkTest.success && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                        <p className="font-semibold text-destructive">❌ Network error</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Cannot reach Supabase. Check: 1) Supabase project is not paused, 2) No CORS issues, 3) No firewall blocking
                        </p>
                      </div>
                    )}
                    {testResults.environment.hasUrl && testResults.environment.hasKey && testResults.validation.isSupabaseConfigured && testResults.networkTest.success && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                        <p className="font-semibold text-green-600">✅ All checks passed!</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Configuration is correct. Authentication should work.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Timestamp: {testResults.timestamp}</p>
                  <p>Check browser console for detailed logs</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <a href="/auth" className="text-sm text-primary hover:underline">
            → Go to Auth Page
          </a>
          <a href="/" className="text-sm text-primary hover:underline">
            → Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}
