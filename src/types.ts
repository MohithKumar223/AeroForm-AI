export interface JumpMetric {
  label: string;
  value: string;
  unit?: string;
  status?: 'optimal' | 'warning' | 'alert';
}

export interface HistoryItem {
  id: string;
  date: string;
  sportName: string;
  score: number;
  location: string;
  thumbnail: string;
  fullData: AnalysisResult;
}

export interface AnalysisResult {
  sportName: string;
  frames: {
    id: string;
    imageUrl: string;
    description: string;
    telemetry: JumpMetric[];
    keyPoints: { x: number; y: number; label: string }[];
  }[];
  overallCritique: string;
  criticalDemands: {
    label: string;
    description: string;
    importance: 'high' | 'critical' | 'extreme';
  }[];
  score: number; // 0-100
  metadata: {
    location: string;
    timestamp: string;
    coordinates: { lat: number; lng: number };
  };
}
