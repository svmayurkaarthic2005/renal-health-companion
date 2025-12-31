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

interface LabAnalysisData {
  patient_summary: {
    overall_status: string;
    key_findings: string[];
  };
  results: LabResult[];
  recommendations: {
    diet: string[];
  };
}

interface DiagnosticHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiagnosticHub({ isOpen, onClose }: DiagnosticHubProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<LabAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAnalysisResult(null);
    }
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
          <button onClick={onClose} className="hover:bg-destructive-foreground/10 p-1 rounded">
            <X className="w-5 h-5" />
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
                Upload a picture of your blood test report. AI will extract GFR, Potassium, and Sodium levels.
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

              {/* Vitals Chart Placeholder */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-primary mb-3">Your Vitals Tracker</h4>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-destructive rounded" /> Systolic
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-primary rounded" /> Diastolic
                  </span>
                </div>
                <div className="h-24 bg-muted/30 rounded flex items-end justify-center gap-2 p-2">
                  <div className="w-8 bg-muted rounded h-12"></div>
                  <div className="w-8 bg-muted rounded h-8"></div>
                  <div className="w-8 bg-muted rounded h-16"></div>
                  <div className="w-8 bg-muted rounded h-10"></div>
                  <div className="w-8 bg-muted rounded h-14"></div>
                </div>
              </div>

              {/* Appointment */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">Next Doctor Appointment:</span>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-background"
                />
                <Button size="sm" onClick={handleSetAppointment}>Set</Button>
              </div>
            </TabsContent>

            <TabsContent value="kitchen" className="space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm text-success">
                Upload a photo of your kitchen ingredients. AI will suggest kidney-friendly recipes!
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Upload Kitchen Photo</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
                Get Recipe Suggestions
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
