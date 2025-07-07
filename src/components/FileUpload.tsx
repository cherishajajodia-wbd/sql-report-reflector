import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { SQLTestCase } from '@/types/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onDataLoad: (data: SQLTestCase[]) => void;
  onError: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoad, onError }) => {
  const [uploading, setUploading] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setUploading(true);
    
    try {
      const fileContent = await file.text();
      
      if (file.name.endsWith('.json')) {
        // Parse JSON file
        const jsonData = JSON.parse(fileContent);
        const testCases = Array.isArray(jsonData) ? jsonData : [jsonData];
        onDataLoad(testCases);
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV file
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          transform: (value, field) => {
            // Convert string booleans to actual booleans
            if (field === 'codebert_match' || field === 'flane5_match' || field === 'exact_match') {
              return value.toLowerCase() === 'true';
            }
            // Convert numeric fields
            if (field === 'syntax_score' || field === 'semantic_score' || field === 'n_gram_score' || 
                field === 'bleu_score' || field === 'rouge_score' || field === 'execution_accuracy') {
              return parseFloat(value) || 0;
            }
            return value;
          },
          complete: (results) => {
            if (results.errors.length > 0) {
              onError(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
              return;
            }
            onDataLoad(results.data as SQLTestCase[]);
          },
          error: (error) => {
            onError(`Failed to parse CSV: ${error.message}`);
          }
        });
      } else {
        onError('Unsupported file type. Please upload a CSV or JSON file.');
      }
    } catch (error) {
      onError(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  }, [onDataLoad, onError]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: false
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Test Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your file here' : 'Upload SQL validation results'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop your CSV or JSON file, or click to browse
              </p>
            </div>
            <Button variant="outline" disabled={uploading}>
              {uploading ? 'Processing...' : 'Choose File'}
            </Button>
          </div>
        </div>
        
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Expected format: CSV/JSON with columns: id, user_prompt, expected_sql, generated_sql, 
            syntax_score, semantic_score, codebert_match, flane5_match, true_label
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};