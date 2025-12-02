import React, { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData } from '../types';

interface GraphViewProps {
  data: GraphData;
  onNodeClick: (node: any) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ data, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const graphRef = useRef<any>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Center graph when data changes
  useEffect(() => {
    if (graphRef.current) {
        // Gentle reheat
        graphRef.current.d3Force('charge').strength(-120);
        graphRef.current.d3Force('link').distance(70);
        graphRef.current.d3ReheatSimulation();
    }
  }, [data]);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    
    // Calculate radius based on val (importance)
    // val 3 (Selected) -> 8
    // val 2 (Parent)   -> 6
    // val 1 (Other)    -> 4
    const radius = node.val === 3 ? 8 : (node.val === 2 ? 6 : 4);

    // Draw Node Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color || '#64748b'; 
    ctx.fill();
    
    // Draw Border (Highlight selected even more)
    ctx.strokeStyle = node.val === 3 ? '#ffffff' : '#1e293b'; 
    ctx.lineWidth = (node.val === 3 ? 2 : 1.5) / globalScale;
    ctx.stroke();

    // Draw Label (Always Visible)
    // Only show if scale is reasonable to avoid clutter when zoomed way out
    if (globalScale > 0.7) {
        ctx.font = `${node.val === 3 ? '700' : '600'} ${fontSize}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Text Shadow/Outline for legibility against dark background
        ctx.lineWidth = 3 / globalScale;
        ctx.strokeStyle = '#0f172a'; // Dark background color
        ctx.strokeText(label, node.x, node.y + radius + 4);
        
        ctx.fillStyle = node.val === 3 ? '#ffffff' : '#e2e8f0'; 
        ctx.fillText(label, node.x, node.y + radius + 4);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative shadow-inner">
      <div className="absolute top-4 right-4 z-10 bg-slate-800/80 px-3 py-1 rounded-full text-xs text-slate-400 pointer-events-none backdrop-blur-sm border border-slate-700">
        Left Click: Select | Drag: Move | Scroll: Zoom
      </div>
      
      {data.nodes.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          Waiting for data...
        </div>
      ) : (
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node: any, color, ctx) => {
              // Expand pointer area slightly for easier clicking
              const radius = node.val === 3 ? 8 : (node.val === 2 ? 6 : 4);
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI, false);
              ctx.fillStyle = color;
              ctx.fill();
          }}
          linkColor={() => '#334155'}
          linkWidth={1.5}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          onNodeClick={(node) => onNodeClick(node)}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          backgroundColor="#0f172a"
        />
      )}
    </div>
  );
};

export default GraphView;