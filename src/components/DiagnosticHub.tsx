import { useState } from 'react';
import { X, Heart, Upload, FlaskConical, ChefHat, AlertCircle, CheckCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LabResult {
  test_name: string;
  value: string;
  unit: string;
  normal_range: string;
  status: string;
  clinical_note: string;
}

interface VitalReading {
  date: string;
  systolic: number;
  diastolic: number;
}

interface LabAnalysisData {
  patient_summary: {
    overall_status: string;
    key_findings: string[];
  };
  results: LabResult[];
  recommendations: {
    diet: string[];
  };
  vitals?: {
    blood_pressure?: string;
  };
}

interface KitchenResult {
  item_name: string;
  condition: string;
  confidence: number;
  chef_recommendation: string;
}

interface DiagnosticHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiagnosticHub({ isOpen, onClose }: DiagnosticHubProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<LabAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [kitchenFile, setKitchenFile] = useState<File | null>(null);
  const [kitchenResult, setKitchenResult] = useState<KitchenResult | null>(null);
  const [isKitchenProcessing, setIsKitchenProcessing] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [vitalReadings, setVitalReadings] = useState<VitalReading[]>([]);

  const parseBloodPressure = (bpString: string): VitalReading | null => {
    const match = bpString.match(/(\d+)\D+(\d+)/);
    if (!match) return null;
    return {
      date: new Date().toISOString().split('T')[0],
      systolic: parseInt(match[1]),
      diastolic: parseInt(match[2])
    };
  };

  const extractBPFromResults = (results: LabResult[]): VitalReading | null => {
    const bpResult = results.find(r => 
      r.test_name.toLowerCase().includes('blood pressure') || 
      r.test_name.toLowerCase().includes('systolic') ||
      r.test_name.toLowerCase().includes('diastolic')
    );
    
    if (bpResult && bpResult.value.includes('/')) {
      const [systolic, diastolic] = bpResult.value.split('/').map(v => parseInt(v.trim()));
      return { 
        systolic, 
        diastolic, 
        date: new Date().toISOString().split('T')[0] 
      };
    }
    
    return null;
  };

  const MAX_FILE_SIZE_KB = 100; // 100KB in KB
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024;

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeInKB = (file.size / 1024).toFixed(2);
      const maxSizeInKB = (MAX_FILE_SIZE_BYTES / 1024).toFixed(2);
      toast({
        title: "File Too Large",
        description: `File size: ${fileSizeInKB} KB. Maximum allowed: ${maxSizeInKB} KB`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFileSize(file)) {
        setSelectedFile(file);
        setAnalysisResult(null);
      } else {
        // Reset the input
        e.target.value = '';
      }
    }
  };

  const handleKitchenPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFileSize(file)) {
        setKitchenFile(file);
        toast({
          title: "File Uploading",
          description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        });

        setIsKitchenProcessing(true);

        try {
          console.log('Uploading kitchen photo:', file.name, file.size, 'bytes');
          
          // Use FormData for multipart file upload instead of base64
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileName', file.name);
          formData.append('fileSize', file.size.toString());
          formData.append('fileType', file.type);

          const response = await fetch('https://shaven-luz-superideally.ngrok-free.dev/webhook-test/kitchen', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - browser will set it with boundary
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Webhook error response:', errorText, 'Status:', response.status);
            throw new Error(`Webhook error: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          let result;
          try {
            result = await response.json();
          } catch (e) {
            // If response isn't JSON, that's okay - treat as success
            console.log('Response received (no JSON body)');
            result = { item_name: 'Image', condition: 'Processed', confidence: 100, chef_recommendation: 'Photo received and processing...' };
          }
          console.log('Kitchen photo response:', result);
          
          // Handle the webhook response - it may be wrapped in an array
          const kitchenData = Array.isArray(result) && result[0]?.output 
            ? (typeof result[0].output === 'string' ? JSON.parse(result[0].output) : result[0].output)
            : result;
          
          setKitchenResult(kitchenData);
          
          toast({
            title: "Kitchen Photo Processed",
            description: "Recipe suggestion ready!",
          });
        } catch (error) {
          console.error('Error uploading kitchen photo:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast({
            title: "Upload Failed",
            description: `Error: ${errorMessage}`,
            variant: "destructive",
          });
        } finally {
          setIsKitchenProcessing(false);
        }
      } else {
        // Reset the input
        e.target.value = '';
      }
    }
  };

  const handleDeleteKitchenPhoto = () => {
    setKitchenFile(null);
    setKitchenResult(null);
    toast({
      title: "Photo Deleted",
      description: "Previous image has been removed",
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const response = await fetch('https://shaven-luz-superideally.ngrok-free.dev/webhook-test/lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileData: fileData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze report');
      }

      const rawData = await response.json();
      
      // Handle webhook response format (array with output as JSON string)
      const data: LabAnalysisData = typeof rawData[0]?.output === 'string' 
        ? JSON.parse(rawData[0].output) 
        : rawData;
      
      setAnalysisResult(data);

      // Extract and save vital reading if blood pressure is available
      const bpReading = extractBPFromResults(data.results);
      if (bpReading) {
        setVitalReadings(prev => [
          ...prev.slice(-4), // Keep last 5 readings
          bpReading
        ]);
        toast({
          title: "Analysis Complete",
          description: `BP: ${bpReading.systolic}/${bpReading.diastolic} mmHg recorded`,
        });
      }
    } catch (error) {
      console.error('Error analyzing report:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the blood report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSetAppointment = () => {
    if (appointmentDate) {
      toast({
        title: "Appointment Set",
        description: `Your next doctor appointment is set for ${new Date(appointmentDate).toLocaleDateString()}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-floating overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Diagnostic Hub</span>
          </div>
          <button onClick={onClose} title="Close" className="hover:bg-destructive-foreground/10 p-1 rounded">
            <X className="w-5 h-5" aria-label="Close dialog" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs defaultValue="blood" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="blood" className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                Blood/Lab Check
              </TabsTrigger>
              <TabsTrigger value="kitchen" className="flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                Kitchen Helper
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blood" className="space-y-4">
              {/* Info Alert */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-primary">
                Upload a picture of your blood test report. AI will extract GFR, Potassium, and Sodium levels. (Max 100KB)
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Upload Report</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">
                      {selectedFile ? selectedFile.name : 'Choose File'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Blood Report'}
              </Button>

              {/* Analysis Result */}
              {analysisResult && (
                <div className="space-y-4">
                  {/* Patient Summary */}
                  <div className={cn(
                    "rounded-lg p-4 border",
                    analysisResult.patient_summary.overall_status === "Mild Concern" 
                      ? "bg-warning/10 border-warning/30" 
                      : analysisResult.patient_summary.overall_status === "Normal"
                      ? "bg-success/10 border-success/30"
                      : "bg-destructive/10 border-destructive/30"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-warning" />
                      <span className="font-semibold text-foreground">
                        Status: {analysisResult.patient_summary.overall_status}
                      </span>
                    </div>
                    <ul className="text-sm text-foreground space-y-1">
                      {analysisResult.patient_summary.key_findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-warning">•</span>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Test Results */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2 font-medium text-foreground">
                      Lab Results
                    </div>
                    <div className="divide-y divide-border">
                      {analysisResult.results.map((result, idx) => (
                        <div key={idx} className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{result.test_name}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              result.status === "Low" 
                                ? "bg-warning/20 text-warning" 
                                : result.status === "High"
                                ? "bg-destructive/20 text-destructive"
                                : "bg-success/20 text-success"
                            )}>
                              {result.status === "Low" && <TrendingDown className="w-3 h-3 inline mr-1" />}
                              {result.status === "High" && <TrendingUp className="w-3 h-3 inline mr-1" />}
                              {result.status === "Normal" && <Minus className="w-3 h-3 inline mr-1" />}
                              {result.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-foreground font-semibold">{result.value} {result.unit}</span>
                            <span className="text-muted-foreground">Normal: {result.normal_range}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.clinical_note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysisResult.recommendations?.diet && (
                    <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="font-semibold text-foreground">Diet Recommendations</span>
                      </div>
                      <ul className="text-sm text-foreground space-y-1">
                        {analysisResult.recommendations.diet.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-success">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Vitals Chart */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-primary mb-3">Your Vitals Tracker</h4>
                {vitalReadings.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-destructive rounded" /> Systolic
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-primary rounded" /> Diastolic
                      </span>
                    </div>
                    <div className="h-32 bg-muted/30 rounded flex items-end justify-between gap-1 p-3">
                      {vitalReadings.map((reading, idx) => {
                        const maxValue = 200;
                        const systolicPercent = Math.round((reading.systolic / maxValue) * 100);
                        const diastolicPercent = Math.round((reading.diastolic / maxValue) * 100);
                        
                        // Create bars using consistent heights
                        const getSystolicHeight = () => {
                          if (systolicPercent >= 90) return 'h-28';
                          if (systolicPercent >= 75) return 'h-24';
                          if (systolicPercent >= 60) return 'h-20';
                          if (systolicPercent >= 45) return 'h-16';
                          return 'h-12';
                        };
                        
                        const getDiastolicHeight = () => {
                          if (diastolicPercent >= 90) return 'h-28';
                          if (diastolicPercent >= 75) return 'h-24';
                          if (diastolicPercent >= 60) return 'h-20';
                          if (diastolicPercent >= 45) return 'h-16';
                          return 'h-12';
                        };
                        
                        return (
                          <div key={idx} className="flex-1 flex items-end gap-0.5 justify-center">
                            <div 
                              className={cn("w-2 bg-destructive rounded-t transition-all", getSystolicHeight())}
                              title={`${reading.date}: ${reading.systolic} mmHg (Systolic)`}
                            />
                            <div 
                              className={cn("w-2 bg-primary rounded-t transition-all", getDiastolicHeight())}
                              title={`${reading.date}: ${reading.diastolic} mmHg (Diastolic)`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      Last reading: {vitalReadings[vitalReadings.length - 1].systolic}/{vitalReadings[vitalReadings.length - 1].diastolic} mmHg
                    </div>
                  </>
                ) : (
                  <div className="h-24 bg-muted/30 rounded flex items-center justify-center p-2 text-xs text-muted-foreground">
                    <div className="text-center">
                      <p>No vital readings yet</p>
                      <p className="text-xs mt-1">Upload a blood report to record readings</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Appointment */}
              <div className="flex items-center gap-2">
                <label htmlFor="appointment-date" className="text-sm text-foreground">Next Doctor Appointment:</label>
                <input
                  id="appointment-date"
                  type="date"
                  placeholder="Select appointment date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-background"
                  aria-label="Appointment date"
                />
                <Button size="sm" onClick={handleSetAppointment}>Set</Button>
              </div>
            </TabsContent>

            <TabsContent value="kitchen" className="space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm text-success">
                Upload a photo of your kitchen ingredients. AI will suggest kidney-friendly recipes! (Max 100KB)
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Upload Fruit Photo:</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">
                      {kitchenFile ? kitchenFile.name : 'Choose File'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKitchenPhotoChange}
                      className="hidden"
                    />
                  </label>
                  {kitchenFile && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={handleDeleteKitchenPhoto}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Kitchen Result Display */}
              {kitchenResult && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-foreground mb-2">
                      {kitchenResult.item_name}-{kitchenResult.condition}
                    </h3>
                    <div className="inline-block bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded">
                      {kitchenResult.confidence.toFixed(2)}% Confidence
                    </div>
                  </div>

                  <div className="bg-success/5 border border-success/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-success flex items-center gap-2">
                      🍽 Chef's Recommendation:
                    </h4>
                    <p className="text-sm text-foreground">
                      <span className="text-success mr-2">✓</span>
                      {kitchenResult.chef_recommendation}
                    </p>
                  </div>
                </div>
              )}

              {!kitchenResult && (
                <Button 
                  disabled={isKitchenProcessing}
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                >
                  {isKitchenProcessing ? 'Processing...' : 'Scan & Get Recipe'}
                </Button>
              )}

              {/* Vitals Tracker in Kitchen Tab */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-primary mb-3">Your Vitals Tracker</h4>
                {vitalReadings.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-destructive rounded" /> Systolic
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-primary rounded" /> Diastolic
                      </span>
                    </div>
                    <div className="h-32 bg-muted/30 rounded flex items-end justify-between gap-1 p-3">
                      {vitalReadings.map((reading, idx) => {
                        const maxValue = 200;
                        const systolicPercent = Math.round((reading.systolic / maxValue) * 100);
                        const diastolicPercent = Math.round((reading.diastolic / maxValue) * 100);
                        
                        const getSystolicHeight = () => {
                          if (systolicPercent >= 90) return 'h-28';
                          if (systolicPercent >= 75) return 'h-24';
                          if (systolicPercent >= 60) return 'h-20';
                          if (systolicPercent >= 45) return 'h-16';
                          return 'h-12';
                        };
                        
                        const getDiastolicHeight = () => {
                          if (diastolicPercent >= 90) return 'h-28';
                          if (diastolicPercent >= 75) return 'h-24';
                          if (diastolicPercent >= 60) return 'h-20';
                          if (diastolicPercent >= 45) return 'h-16';
                          return 'h-12';
                        };
                        
                        return (
                          <div key={idx} className="flex-1 flex items-end gap-0.5 justify-center">
                            <div 
                              className={cn("w-2 bg-destructive rounded-t transition-all", getSystolicHeight())}
                              title={`${reading.date}: ${reading.systolic} mmHg (Systolic)`}
                            />
                            <div 
                              className={cn("w-2 bg-primary rounded-t transition-all", getDiastolicHeight())}
                              title={`${reading.date}: ${reading.diastolic} mmHg (Diastolic)`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      Last reading: {vitalReadings[vitalReadings.length - 1].systolic}/{vitalReadings[vitalReadings.length - 1].diastolic} mmHg
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No vital readings yet. Upload a blood report to get started.</p>
                )}
              </div>

              {/* Appointment */}
              <div className="flex items-center gap-2">
                <label htmlFor="kitchen-appointment-date" className="text-sm text-foreground">Next Doctor Appointment:</label>
                <input
                  id="kitchen-appointment-date"
                  type="date"
                  placeholder="Select appointment date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-background"
                  aria-label="Appointment date"
                />
                <Button size="sm" onClick={handleSetAppointment}>Set</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
