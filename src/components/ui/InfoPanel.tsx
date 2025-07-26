import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';

interface InfoPanelProps {
  pigCount: number;
  fps: number;
  onReset: () => void;
}

const InfoPanel = ({ pigCount, fps, onReset }: InfoPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="fixed bottom-4 right-4 w-64 shadow-nature">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Scene Info</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Pigs:</span>
              <div className="font-medium">{pigCount}</div>
            </div>
            <div>
              <span className="text-muted-foreground">FPS:</span>
              <div className={`font-medium ${fps < 30 ? 'text-destructive' : fps < 45 ? 'text-amber-500' : 'text-grass-primary'}`}>
                {fps}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={onReset}
              size="sm"
              className="w-full"
              variant="outline"
            >
              Reset Pigs
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Pigs wander autonomously with realistic AI behavior including boundary avoidance and social dynamics.</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default InfoPanel;