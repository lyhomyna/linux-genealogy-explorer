import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import DistroCard from './components/DistroCard';
import GraphView from './components/GraphView';
import { getDistroDetails, getGenealogyGraph } from './services/sparqlService';
import { DistroDetails, GraphData } from './types';
import { Database, Network } from 'lucide-react';

const App: React.FC = () => {
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [distroDetails, setDistroDetails] = useState<DistroDetails | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Initial Graph Load
  useEffect(() => {
    loadGraph();
  }, []);

  // Update details and graph when a distro is selected
  useEffect(() => {
    if (selectedUri) {
      loadDistroInfo(selectedUri);
      loadGraph(selectedUri);
    }
  }, [selectedUri]);

  const loadGraph = async (centerUri?: string) => {
    try {
      const data = await getGenealogyGraph(centerUri);
      setGraphData(data);
    } catch (e) {
      console.error("Failed to load graph", e);
    }
  };

  const loadDistroInfo = async (uri: string) => {
    setLoadingDetails(true);
    try {
      const details = await getDistroDetails(uri);
      setDistroDetails(details);
    } catch (e) {
      console.error("Failed to load details", e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSearchSelect = (uri: string) => {
    setSelectedUri(uri);
  };

  const handleNodeClick = (node: any) => {
    if (node.id !== selectedUri) {
        setSelectedUri(node.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Network className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Linux<span className="text-blue-500">Genealogy</span>
            </h1>
          </div>
          <SearchBar onSelect={handleSearchSelect} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar: Details */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <div className="flex items-center gap-2 text-slate-400 uppercase text-sm font-semibold tracking-wider">
                <Database className="w-4 h-4" /> Selected Distribution
            </div>
            <DistroCard distro={distroDetails} loading={loadingDetails} />
            
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-sm text-slate-400">
                <h3 className="font-bold text-slate-200 mb-2">About this Project</h3>
                <p className="mb-2">
                    This interactive explorer uses Semantic Web technologies to query <a href="https://wikidata.org" className="text-blue-400 hover:underline">Wikidata</a> directly.
                </p>
                <p>
                    Visualize the "Family Tree" of Linux distributions based on the <code>based on (P144)</code> property.
                </p>
            </div>
        </div>

        {/* Main Area: Graph */}
        <div className="lg:col-span-2 h-[600px] lg:h-auto order-1 lg:order-2 flex flex-col">
           <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-slate-400 uppercase text-sm font-semibold tracking-wider">
                    <Network className="w-4 h-4" /> Interactive Genealogy
               </div>
               {selectedUri && (
                   <button 
                    onClick={() => { setSelectedUri(null); loadGraph(); setDistroDetails(null); }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition-colors border border-slate-700"
                   >
                       Reset View
                   </button>
               )}
           </div>
           <div className="flex-1 relative">
                <GraphView data={graphData} onNodeClick={handleNodeClick} />
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;