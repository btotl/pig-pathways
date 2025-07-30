import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Upload, Plus, Trash2, Settings, Link as LinkIcon, 
  Palette, Clock, Camera, Sun, Droplets 
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { PlacedModel, PigState, AdminSettings } from '../types';

interface AdvancedAdminPanelProps {
  isVisible: boolean;
  adminSettings: AdminSettings;
  onUpdateSettings: (updates: Partial<AdminSettings>) => void;
  pigCount: number;
  onAddPig: () => void;
  onRemovePig: (pigId: string) => void;
  onResetField: () => void;
  pigs: PigState[];
  placedModels: PlacedModel[];
  onAddPlacedModel: (model: Omit<PlacedModel, 'id'>) => void;
  onUpdatePlacedModel: (id: string, updates: Partial<PlacedModel>) => void;
  onRemovePlacedModel: (id: string) => void;
  onAssignUrl: (objectId: string, url: string) => void;
  onRemoveUrlAssignment: (objectId: string) => void;
  urlAssignments: Record<string, string>;
}

interface UploadedModelFile {
  id: string;
  name: string;
  file: File;
  url: string;
}

const AdvancedAdminPanel = ({
  isVisible,
  adminSettings,
  onUpdateSettings,
  pigCount,
  onAddPig,
  onRemovePig,
  onResetField,
  pigs,
  placedModels,
  onAddPlacedModel,
  onUpdatePlacedModel,
  onRemovePlacedModel,
  onAssignUrl,
  onRemoveUrlAssignment,
  urlAssignments
}: AdvancedAdminPanelProps) => {
  const [uploadedModels, setUploadedModels] = useState<UploadedModelFile[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [selectedModelForPlacement, setSelectedModelForPlacement] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('pigs');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        continue;
      }

      if (!file.name.toLowerCase().endsWith('.glb')) {
        toast({
          title: "Invalid File Type",
          description: "Only .glb files are supported",
          variant: "destructive",
        });
        continue;
      }

      const model: UploadedModelFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        file,
        url: URL.createObjectURL(file),
      };

      setUploadedModels(prev => [...prev, model]);
      toast({
        title: "Model Uploaded",
        description: `${file.name} ready for placement`,
      });
    }
  };

  const handleSkyImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Sky image must be under 5MB",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    onUpdateSettings({
      environment: {
        ...adminSettings.environment,
        skyImage: url
      }
    });

    toast({
      title: "Sky Updated",
      description: "Background sky image has been changed",
    });
  };

  const handlePlaceModel = useCallback((position: { x: number; y: number; z: number }) => {
    if (!selectedModelForPlacement) return;

    const modelFile = uploadedModels.find(m => m.id === selectedModelForPlacement);
    if (!modelFile) return;

    const newModel: Omit<PlacedModel, 'id'> = {
      name: modelFile.name,
      url: modelFile.url,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      attractiveness: 50,
      isFood: false,
      foodTimer: 0,
      isVisible: true
    };

    onAddPlacedModel(newModel);
    setSelectedModelForPlacement(null);

    toast({
      title: "Model Placed",
      description: `${modelFile.name} added to the field`,
    });
  }, [selectedModelForPlacement, uploadedModels, onAddPlacedModel]);

  const handleAssignUrl = () => {
    if (!selectedObject || !urlInput) return;

    onAssignUrl(selectedObject, urlInput);
    setSelectedObject(null);
    setUrlInput('');

    toast({
      title: "URL Assigned",
      description: "Object will now redirect when clicked",
    });
  };

  if (!isVisible) return null;

  return (
    <Card className={`fixed top-4 right-4 z-50 bg-card/95 backdrop-blur-sm border-2 border-primary/20 transition-all duration-300 ${
      isMinimized ? 'w-16' : 'w-96 max-h-[90vh] overflow-y-auto'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className={`flex items-center gap-2 ${isMinimized ? 'hidden' : ''}`}>
          <Settings className="h-5 w-5" />
          Advanced Admin
          <Badge variant="secondary" className="bg-primary/20">Active</Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? '⬆️' : '⬇️'}
        </Button>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="p-4 pt-0 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 text-xs">
              <TabsTrigger value="pigs">🐷</TabsTrigger>
              <TabsTrigger value="models">📦</TabsTrigger>
              <TabsTrigger value="urls">🔗</TabsTrigger>
              <TabsTrigger value="environment">🌍</TabsTrigger>
              <TabsTrigger value="settings">⚙️</TabsTrigger>
            </TabsList>
            
            {/* Pig Management */}
            <TabsContent value="pigs" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pigs: {pigCount}</span>
                <Button onClick={onAddPig} size="sm" className="gap-1">
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {pigs.map((pig) => (
                  <div key={pig.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                    <span>🐷 {pig.id.split('-')[1]}</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {pig.state}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemovePig(pig.id)}
                        className="h-5 w-5 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button onClick={onResetField} variant="destructive" size="sm" className="w-full">
                Reset All
              </Button>
            </TabsContent>
            
            {/* Model Management */}
            <TabsContent value="models" className="space-y-4">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-muted-foreground rounded-lg p-3 text-center">
                <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mb-2">
                  Upload .glb models (max 10MB)
                </p>
                <Input
                  type="file"
                  accept=".glb"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="model-upload"
                />
                <Button asChild size="sm">
                  <label htmlFor="model-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
              </div>
              
              {/* Model Library */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-xs truncate flex-1">{model.name}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={selectedModelForPlacement === model.id ? "default" : "outline"}
                        onClick={() => setSelectedModelForPlacement(
                          selectedModelForPlacement === model.id ? null : model.id
                        )}
                        className="h-6 w-6 p-0"
                      >
                        📍
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setUploadedModels(prev => prev.filter(m => m.id !== model.id))}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedModelForPlacement && (
                <div className="p-2 bg-primary/10 rounded text-xs">
                  📍 Click anywhere on the field to place the selected model
                </div>
              )}
              
              {/* Placed Models */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Placed Models ({placedModels.length})</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {placedModels.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-xs truncate flex-1">{model.name}</span>
                      <div className="flex gap-1 items-center">
                        <Badge variant="outline" className="text-xs">
                          {model.attractiveness}
                        </Badge>
                        {model.isFood && <span className="text-xs">🍎</span>}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onRemovePlacedModel(model.id)}
                          className="h-5 w-5 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* URL Assignment */}
            <TabsContent value="urls" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Select Object</Label>
                  <Select value={selectedObject || ''} onValueChange={setSelectedObject}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose object..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pigs.map((pig) => (
                        <SelectItem key={pig.id} value={pig.id}>
                          🐷 Pig {pig.id.split('-')[1]}
                        </SelectItem>
                      ))}
                      {placedModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          📦 {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Assign URL</Label>
                  <Input
                    placeholder="https://example.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleAssignUrl}
                  disabled={!selectedObject || !urlInput}
                  className="w-full gap-2"
                  size="sm"
                >
                  <LinkIcon className="h-4 w-4" />
                  Assign URL
                </Button>
              </div>
              
              {/* Current URL Assignments */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Active URLs</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(urlAssignments).map(([objectId, url]) => (
                    <div key={objectId} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {pigs.find(p => p.id === objectId) ? 
                            `🐷 Pig ${objectId.split('-')[1]}` : 
                            placedModels.find(m => m.id === objectId)?.name || 'Unknown'
                          }
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{url}</div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveUrlAssignment(objectId)}
                        className="h-5 w-5 p-0 ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Environment Settings */}
            <TabsContent value="environment" className="space-y-4">
              {/* Sky Background */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Sky Background
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleSkyImageUpload}
                  className="text-xs"
                />
              </div>
              
              {/* Grass Settings */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  🌱 Grass Settings
                </Label>
                
                <div className="space-y-2">
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={adminSettings.environment.grassColor}
                    onChange={(e) => onUpdateSettings({
                      environment: {
                        ...adminSettings.environment,
                        grassColor: e.target.value
                      }
                    })}
                    className="h-8"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Density: {adminSettings.environment.grassDensity}</Label>
                  <Slider
                    value={[adminSettings.environment.grassDensity]}
                    onValueChange={([value]) => onUpdateSettings({
                      environment: {
                        ...adminSettings.environment,
                        grassDensity: value
                      }
                    })}
                    min={100}
                    max={2000}
                    step={50}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Wind: {adminSettings.environment.windStrength.toFixed(1)}</Label>
                  <Slider
                    value={[adminSettings.environment.windStrength]}
                    onValueChange={([value]) => onUpdateSettings({
                      environment: {
                        ...adminSettings.environment,
                        windStrength: value
                      }
                    })}
                    min={0}
                    max={3}
                    step={0.1}
                  />
                </div>
              </div>
              
              {/* Lighting */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Lighting
                </Label>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Shadows</Label>
                  <Switch
                    checked={adminSettings.environment.shadowsEnabled}
                    onCheckedChange={(checked) => onUpdateSettings({
                      environment: {
                        ...adminSettings.environment,
                        shadowsEnabled: checked
                      }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Fog</Label>
                  <Switch
                    checked={adminSettings.environment.fogEnabled}
                    onCheckedChange={(checked) => onUpdateSettings({
                      environment: {
                        ...adminSettings.environment,
                        fogEnabled: checked
                      }
                    })}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* General Settings */}
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Default Pig Size: {adminSettings.defaultPigSize.toFixed(1)}</Label>
                  <Slider
                    value={[adminSettings.defaultPigSize]}
                    onValueChange={([value]) => onUpdateSettings({ defaultPigSize: value })}
                    min={0.5}
                    max={3}
                    step={0.1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Speed Multiplier: {adminSettings.pigSpeedMultiplier.toFixed(1)}</Label>
                  <Slider
                    value={[adminSettings.pigSpeedMultiplier]}
                    onValueChange={([value]) => onUpdateSettings({ pigSpeedMultiplier: value })}
                    min={0.1}
                    max={3}
                    step={0.1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Pig Color Tint</Label>
                  <Input
                    type="color"
                    value={adminSettings.pigColorTint}
                    onChange={(e) => onUpdateSettings({ pigColorTint: e.target.value })}
                    className="h-8"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Hide Interface</Label>
                  <Switch
                    checked={adminSettings.hideInterface}
                    onCheckedChange={(checked) => onUpdateSettings({ hideInterface: checked })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedAdminPanel;