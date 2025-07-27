import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Upload, Plus, Trash2, Eye, EyeOff, Settings, Link as LinkIcon } from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface AdminPanelProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  pigCount: number;
  onAddPig: () => void;
  onRemovePig: (pigId: string) => void;
  onResetField: () => void;
  pigs: Array<{ id: string; position: { x: number; y: number; z: number } }>;
}

interface UploadedModel {
  id: string;
  name: string;
  file: File;
  url: string;
  thumbnail?: string;
  assignedUrl?: string;
}

const AdminPanel = ({
  isVisible,
  onToggleVisibility,
  pigCount,
  onAddPig,
  onRemovePig,
  onResetField,
  pigs
}: AdminPanelProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [uploadedModels, setUploadedModels] = useState<UploadedModel[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');

  // Simple admin password (in production, use proper authentication)
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    // Load admin state from localStorage
    const savedAuth = localStorage.getItem('adminAuthenticated');
    const savedModels = localStorage.getItem('uploadedModels');
    
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    if (savedModels) {
      try {
        setUploadedModels(JSON.parse(savedModels));
      } catch (error) {
        console.error('Failed to load uploaded models:', error);
      }
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      toast({
        title: "Admin Access Granted",
        description: "You are now in admin mode",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    toast({
      title: "Logged Out",
      description: "You have been logged out of admin mode",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
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

      const model: UploadedModel = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        file,
        url: URL.createObjectURL(file),
      };

      setUploadedModels(prev => {
        const updated = [...prev, model];
        localStorage.setItem('uploadedModels', JSON.stringify(updated.map(m => ({
          ...m,
          file: null, // Don't store file in localStorage
          url: null // Will need to be recreated
        }))));
        return updated;
      });

      toast({
        title: "Model Uploaded",
        description: `${file.name} has been added to your library`,
      });
    }
  };

  const handleDeleteModel = (modelId: string) => {
    setUploadedModels(prev => {
      const updated = prev.filter(m => m.id !== modelId);
      localStorage.setItem('uploadedModels', JSON.stringify(updated));
      return updated;
    });
    
    toast({
      title: "Model Deleted",
      description: "Model has been removed from your library",
    });
  };

  const handleAssignUrl = () => {
    if (!selectedObject || !urlInput) return;

    // In a real implementation, this would update the 3D scene objects
    toast({
      title: "URL Assigned",
      description: `URL assigned to ${selectedObject}`,
    });
    
    setSelectedObject(null);
    setUrlInput('');
  };

  if (!isAuthenticated) {
    return (
      <Card className="fixed top-4 right-4 w-80 z-50 bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isMinimized ? 'w-16' : 'w-96'}`}>
      <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className={`flex items-center gap-2 ${isMinimized ? 'hidden' : ''}`}>
            <Settings className="h-5 w-5" />
            Admin Panel
            <Badge variant="secondary" className="bg-primary/20">Active</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-4 pt-0">
            <Tabs defaultValue="pigs" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pigs">Pigs</TabsTrigger>
                <TabsTrigger value="models">Models</TabsTrigger>
                <TabsTrigger value="urls">URLs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pigs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Current Pigs: {pigCount}
                  </span>
                  <Button onClick={onAddPig} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Pig
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {pigs.map((pig) => (
                    <div key={pig.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-xs">Pig {pig.id.split('-')[1]}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemovePig(pig.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button onClick={onResetField} variant="destructive" className="w-full">
                  Reset Field
                </Button>
              </TabsContent>
              
              <TabsContent value="models" className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
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
                  <Button asChild>
                    <label htmlFor="model-upload" className="cursor-pointer">
                      Choose Files
                    </label>
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadedModels.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-xs truncate">{model.name}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteModel(model.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="urls" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Select Object</label>
                    <select
                      value={selectedObject || ''}
                      onChange={(e) => setSelectedObject(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Choose object...</option>
                      {pigs.map((pig) => (
                        <option key={pig.id} value={pig.id}>
                          Pig {pig.id.split('-')[1]}
                        </option>
                      ))}
                      {uploadedModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Assign URL</label>
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
                  >
                    <LinkIcon className="h-4 w-4" />
                    Assign URL
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AdminPanel;