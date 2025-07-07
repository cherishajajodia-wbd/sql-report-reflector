import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Image as ImageIcon, BarChart3 } from 'lucide-react';
import { ConfusionMatrixData } from '@/types/validation';

interface ConfusionMatrixProps {
  data?: ConfusionMatrixData;
  onImageUpload?: (file: File) => void;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ data, onImageUpload }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      if (onImageUpload) {
        onImageUpload(file);
      }
    }
  };

  const HeatmapCell = ({ value, max, row, col }: { value: number; max: number; row: number; col: number }) => {
    const intensity = max > 0 ? value / max : 0;
    const isCorrect = row === col;
    
    return (
      <div
        className={`
          w-16 h-16 flex items-center justify-center text-sm font-semibold border
          ${isCorrect 
            ? 'bg-success text-success-foreground border-success' 
            : 'bg-error/20 text-error border-error/30'
          }
        `}
        style={{
          opacity: 0.3 + (intensity * 0.7)
        }}
        title={`Predicted: ${data?.labels[col]}, Actual: ${data?.labels[row]}, Count: ${value}`}
      >
        {value}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Confusion Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upload Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="matrix-upload"
            />
            <label htmlFor="matrix-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Matrix Image
                </span>
              </Button>
            </label>
            <span className="text-sm text-muted-foreground">
              Upload a PNG/JPG confusion matrix image
            </span>
          </div>
        </div>

        {/* Uploaded Image Display */}
        {uploadedImage && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Uploaded Confusion Matrix
            </h3>
            <div className="bg-background border rounded-lg p-4">
              <img 
                src={uploadedImage} 
                alt="Confusion Matrix" 
                className="max-w-full h-auto rounded-md shadow-md"
              />
            </div>
          </div>
        )}

        {/* Interactive Heatmap */}
        {data && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Interactive Confusion Matrix: {data.title}
            </h3>
            
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Column Headers */}
                <div className="flex">
                  <div className="w-16 h-16 flex items-center justify-center font-semibold text-sm">
                    <div className="transform -rotate-45 origin-center">Actual</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="h-8 flex items-center justify-center font-semibold text-sm">
                      Predicted
                    </div>
                    <div className="flex">
                      {data.labels.map((label, index) => (
                        <div key={index} className="w-16 h-8 flex items-center justify-center text-xs font-medium">
                          <Badge variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Matrix Rows */}
                <div className="flex flex-col">
                  {data.matrix.map((row, rowIndex) => {
                    const maxValue = Math.max(...data.matrix.flat());
                    return (
                      <div key={rowIndex} className="flex">
                        {/* Row Label */}
                        <div className="w-16 h-16 flex items-center justify-center">
                          <Badge variant="outline" className="text-xs">
                            {data.labels[rowIndex]}
                          </Badge>
                        </div>
                        {/* Matrix Cells */}
                        <div className="flex">
                          {row.map((value, colIndex) => (
                            <HeatmapCell
                              key={colIndex}
                              value={value}
                              max={maxValue}
                              row={rowIndex}
                              col={colIndex}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Matrix Statistics */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Samples</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.matrix.flat().reduce((sum, val) => sum + val, 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    {(
                      (data.matrix.reduce((sum, row, i) => sum + row[i], 0) / 
                       data.matrix.flat().reduce((sum, val) => sum + val, 0)) * 100
                    ).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.labels.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Misclassified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-error">
                    {data.matrix.flat().reduce((sum, val) => sum + val, 0) - 
                     data.matrix.reduce((sum, row, i) => sum + row[i], 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!data && !uploadedImage && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No confusion matrix data available.</p>
            <p className="text-sm mt-2">Upload an image or provide matrix data to display results.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};