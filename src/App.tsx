import { HashRouter, Routes, Route } from 'react-router-dom';
import { useConfig } from './hooks/useConfig';
import SearchPage from './pages/SearchPage';
import ResultsPage from './pages/ResultsPage';
import EditPage from './pages/EditPage';

export default function App() {
  const { config, setConfig } = useConfig();

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<EditPage config={config} setConfig={setConfig} />} />
        <Route path="/search" element={<SearchPage config={config} />} />
        <Route path="/results" element={<ResultsPage config={config} />} />
      </Routes>
    </HashRouter>
  );
}
