import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { StoryReader } from './components/StoryReader';
import { ModeSelection } from './components/ModeSelection';
import { StoryCategorySelection } from './components/StoryCategorySelection';
import './styles/App.css';

function PracticePlaceholder() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Practice Mode</h1>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}

function ModeSelectionWithNavigation() {
  const navigate = useNavigate();

  const handleSelectMode = (mode: "read" | "practice") => {
    if (mode === "read") {
      navigate('/story/category');
    } else {
      navigate('/practice');
    }
  };

  return <ModeSelection onSelectMode={handleSelectMode} />;
}

function StoryCategoryWithNavigation() {
  const navigate = useNavigate();

  const handleSelectDomain = (domain: string) => {
    navigate(`/story/${domain}`);
  };

  return <StoryCategorySelection onSelectDomain={handleSelectDomain} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ModeSelectionWithNavigation />} />
        <Route path="/story/category" element={<StoryCategoryWithNavigation />} />
        <Route path="/story/:domain" element={<StoryReader />} />
        <Route path="/practice" element={<PracticePlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
