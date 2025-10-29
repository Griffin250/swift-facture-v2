import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const DataMigration = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(10);
    setStatus('Connecting to original database...');

    try {
      const { data, error } = await supabase.functions.invoke('export-original-data');

      if (error) throw error;

      setProgress(100);
      setStatus('Export completed!');
      setExportData(data);
      
      toast({
        title: 'Export Successful',
        description: `Exported ${data.tables_exported} tables with ${Object.values(data.record_counts).reduce((a, b) => a + b, 0)} total records`,
      });

      console.log('Export summary:', data.record_counts);

    } catch (error) {
      console.error('Export error:', error);
      setStatus('Export failed');
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!exportData) {
      toast({
        title: 'No Data to Import',
        description: 'Please export data first',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setProgress(10);
    setStatus('Starting import to Lovable Cloud...');

    try {
      const { data, error } = await supabase.functions.invoke('import-original-data', {
        body: { data: exportData.data }
      });

      if (error) throw error;

      setProgress(100);
      setStatus('Import completed!');
      
      const totalImported = Object.values(data.imported).reduce((a, b) => a + b, 0);
      
      toast({
        title: 'Import Successful',
        description: `Imported ${totalImported} records. ${data.errors.length > 0 ? `${data.errors.length} errors occurred.` : ''}`,
      });

      console.log('Import results:', data);

      if (data.errors.length > 0) {
        console.error('Import errors:', data.errors);
      }

    } catch (error) {
      console.error('Import error:', error);
      setStatus('Import failed');
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Database Migration</h1>
          <p className="text-muted-foreground">
            Migrate data from your original database to Lovable Cloud
          </p>
        </div>

        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Step 1: Export Data
            </CardTitle>
            <CardDescription>
              Export all data from your original Supabase database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExport} 
              disabled={isExporting || isImporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : exportData ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Export Complete - Re-export
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Start Export
                </>
              )}
            </Button>

            {exportData && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Export Summary
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(exportData.record_counts).map(([table, count]) => (
                    <div key={table} className="flex justify-between">
                      <span className="text-muted-foreground">{table}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Step 2: Import Data
            </CardTitle>
            <CardDescription>
              Import the exported data into Lovable Cloud database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleImport} 
              disabled={!exportData || isExporting || isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Start Import
                </>
              )}
            </Button>

            {!exportData && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4" />
                Please complete Step 1 (Export) first
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        {(isExporting || isImporting) && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{status}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-800 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>This will overwrite any test data in the current database</li>
              <li>Original database remains unchanged and can be used as backup</li>
              <li>User authentication data is preserved with original UUIDs</li>
              <li>Users will need to reset their passwords after migration</li>
              <li>Avatar images will need to be migrated separately</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataMigration;
