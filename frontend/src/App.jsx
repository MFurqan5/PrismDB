import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Table as TableIcon,
  Play,
  History as HistoryIcon,
  Layers,
  Search,
  FileSpreadsheet,
  FileJson,
  Copy,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
  Check,
  AlertCircle,
  BarChart2,
  PieChart as PieIcon,
  Trash2,
  Edit3,
  RefreshCw,
  Sparkles,
  Info,
  Network
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

const COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#fb923c', '#f43f5e', '#a78bfa', '#34d399', '#facc15'];

function GraphVisualizer({ graphData }) {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const width = 600;
  const height = 240;

  // Initialize nodes
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;
    const initialNodes = graphData.nodes.map((n, index) => {
      const angle = (index / graphData.nodes.length) * 2 * Math.PI;
      const radius = 60 + Math.random() * 20;
      return {
        ...n,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        vx: 0,
        vy: 0
      };
    });
    setNodes(initialNodes);
  }, [graphData]);

  // Animation Loop
  useEffect(() => {
    if (nodes.length === 0 || draggedNode) return;

    let animId;
    const updatePhysics = () => {
      setNodes(currentNodes => {
        const nextNodes = currentNodes.map(n => ({ ...n }));

        // 1. Repulsion (Coulomb force)
        for (let i = 0; i < nextNodes.length; i++) {
          const nodeA = nextNodes[i];
          for (let j = i + 1; j < nextNodes.length; j++) {
            const nodeB = nextNodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 150) {
              const force = 300 / (dist * dist);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              nodeA.vx -= fx;
              nodeA.vy -= fy;
              nodeB.vx += fx;
              nodeB.vy += fy;
            }
          }
        }

        // 2. Attraction along edges (spring force)
        graphData.edges.forEach(edge => {
          const source = nextNodes.find(n => n.id === edge.from);
          const target = nextNodes.find(n => n.id === edge.to);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desiredDist = 90;
            const k = 0.04;
            const force = k * (dist - desiredDist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // 3. Center gravity and update positions
        nextNodes.forEach(node => {
          const dx = width / 2 - node.x;
          const dy = height / 2 - node.y;
          node.vx += dx * 0.005;
          node.vy += dy * 0.005;

          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.85;
          node.vy *= 0.85;

          node.x = Math.max(30, Math.min(width - 30, node.x));
          node.y = Math.max(30, Math.min(height - 30, node.y));
        });

        return nextNodes;
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [nodes.length, draggedNode, graphData.edges]);

  const handleMouseDown = (nodeId, e) => {
    e.preventDefault();
    setDraggedNode(nodeId);
  };

  const handleMouseMove = (e) => {
    if (!draggedNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;
    setNodes(prev => prev.map(n => n.id === draggedNode ? { ...n, x, y, vx: 0, vy: 0 } : n));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const getNodeColor = (table) => {
    switch (table) {
      case 'users': return '#00d4ff';
      case 'threats': return '#f43f5e';
      case 'scans': return '#7c3aed';
      case 'cache_stats': return '#10b981';
      default: return '#fb923c';
    }
  };

  return (
    <div className="relative w-full h-[230px] bg-[#05070a] rounded border border-white/5 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b0c10]/80 border-b border-white/5 select-none">
        <span className="text-[10px] font-mono text-cyber-cyan uppercase font-bold flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5" /> Interactive Relationship Graph
        </span>
        <span className="text-[9px] font-mono text-cyber-muted">Drag nodes to rearrange. Hover to inspect documents.</span>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-grab active:cursor-grabbing w-full h-full"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f5b66" />
            </marker>
          </defs>

          {/* Edges */}
          {graphData.edges.map((edge, idx) => {
            const source = nodes.find(n => n.id === edge.from);
            const target = nodes.find(n => n.id === edge.to);
            if (!source || !target) return null;

            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#2d3748"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />
                <rect
                  x={midX - 35}
                  y={midY - 7}
                  width={70}
                  height={14}
                  rx={3}
                  fill="#07080b"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.5"
                />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fill="#8b949e"
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const color = getNodeColor(node.table);
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDown(node.id, e)}
                onMouseEnter={(e) => {
                  setHoveredNode(node);
                  setTooltipPos({ x: node.x + 15, y: node.y - 15 });
                }}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <circle
                  r="16"
                  fill="#07080b"
                  stroke={color}
                  strokeWidth="2"
                  className="transition-all duration-150 hover:r-18"
                  style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
                />
                <text
                  textAnchor="middle"
                  y="3"
                  fill="#ffffff"
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {node.id.length > 8 ? node.id.substring(0, 7) + '..' : node.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredNode && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(width - 240, Math.max(10, tooltipPos.x))}px`,
              top: `${Math.min(height - 180, Math.max(10, tooltipPos.y))}px`,
              pointerEvents: 'none'
            }}
            className="w-56 bg-[#090d16]/95 border border-white/10 rounded shadow-cyan-glow p-2 text-[9px] font-mono z-50 text-left select-none"
          >
            <div className="font-bold text-cyber-cyan border-b border-white/5 pb-1 mb-1.5 flex justify-between items-center">
              <span>{hoveredNode.id}</span>
              <span className="text-[7.5px] px-1 bg-white/10 text-white/70 uppercase rounded">{hoveredNode.table}</span>
            </div>
            <pre className="text-white/90 overflow-x-auto whitespace-pre-wrap max-h-32 text-[8px] leading-3 scrollbar-none">
              {JSON.stringify(hoveredNode.doc, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // --- Workspace & Panel Sizing States ---
  const [leftWidth, setLeftWidth] = useState(265);
  const [rightWidth, setRightWidth] = useState(280);
  const [bottomHeight, setBottomHeight] = useState(280);
  const [activeSidebarTab, setActiveSidebarTab] = useState('explorer'); // explorer, history, sample

  // --- API / Database States ---
  const [schemaData, setSchemaData] = useState([]);
  const [activeDatabase, setActiveDatabase] = useState('prismdb');
  const [selectedTable, setSelectedTable] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, uri: '', error: null });
  const [connectionMessage, setConnectionMessage] = useState('');

  // --- Tabbed Query States ---
  const [tabs, setTabs] = useState([
    {
      id: 1,
      title: 'query_1.sql',
      code: 'SELECT * FROM users;',
      results: null,
      error: null,
      time: null,
      loading: false,
      inTransaction: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [bottomTab, setBottomTab] = useState('grid');

  // --- Search, Sort & Filter Grid States ---
  const [tableSearchText, setTableSearchText] = useState('');
  const [resultsSearchFilters, setResultsSearchFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'ASC' });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // --- Interactive Auto-Complete States ---
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // --- Table Tree Context Menu States ---
  const [contextMenu, setContextMenu] = useState(null); // { x, y, tableName, dbName }
  const [renameModal, setRenameModal] = useState(null); // { tableName, newName }

  // --- Copy indicators ---
  const [copiedCellVal, setCopiedCellVal] = useState(null);

  // --- Refs ---
  const editorRef = useRef(null);
  const editorHighlightRef = useRef(null);

  // -------------------------------------------------------------------------
  // INITIAL LOAD & TELEMETRY SYNC
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchStatus();
    fetchSchema();
    fetchHistory();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setConnectionStatus(data);
      if (!data.connected) {
        setConnectionMessage('Offline - PrismDB local mode only. Atlas configuration pending.');
      } else {
        setConnectionMessage('Connected to MongoDB Atlas clusters.');
      }
    } catch (err) {
      setConnectionStatus({ connected: false, uri: 'Unknown', error: err.message });
      setConnectionMessage('PrismDB API Server unreachable. Check local server.');
    }
  };

  const fetchSchema = async () => {
    try {
      const res = await fetch('/api/schema');
      if (res.ok) {
        const data = await res.json();
        setSchemaData(data.databases || []);
      }
    } catch (err) {
      console.error('Failed to load databases schema hierarchy', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setQueryHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load query history logs', err);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateActiveTab = (updates) => {
    setTabs(prev => prev.map(t => (t.id === activeTabId ? { ...t, ...updates } : t)));
  };

  // -------------------------------------------------------------------------
  // RUN QUERY EXECUTION
  // -------------------------------------------------------------------------
  const handleRunQuery = async (queryToRun = null) => {
    let code = queryToRun;
    if (!code) {
      const area = editorRef.current;
      if (area && area.selectionStart !== area.selectionEnd) {
        code = activeTab.code.substring(area.selectionStart, area.selectionEnd);
      } else {
        code = activeTab.code;
      }
    }
    if (!code || code.trim() === '') return;

    updateActiveTab({ loading: true, error: null });

    try {
      const startTime = Date.now();
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: code, activeDb: activeDatabase, sessionId: "tab_" + activeTabId })
      });

      const data = await res.json();
      const totalTime = Date.now() - startTime;

      if (data.success) {
        updateActiveTab({
          results: {
            columns: data.columns || [],
            rows: data.rows || [],
            rowsAffected: data.rowsAffected || 0,
            graphVisualizer: data.graphVisualizer || null
          },
          inTransaction: !!data.inTransaction,
          error: null,
          time: data.executionTimeMs !== undefined ? data.executionTimeMs : totalTime,
          loading: false
        });

        // If active database changed due to "USE mydb"
        if (data.activeDatabase) {
          setActiveDatabase(data.activeDatabase);
        }

        if (data.graphVisualizer) {
          setBottomTab('graph');
        } else {
          setBottomTab('grid');
        }

        // Refresh Schema & History
        fetchSchema();
        fetchHistory();
        setResultsSearchFilters({});
        setCurrentPage(1);
      } else {
        // Syntax / parsing error
        updateActiveTab({
          results: null,
          inTransaction: !!data.inTransaction,
          error: {
            message: data.error || 'Query failed execution',
            position: data.position || 0,
            line: data.line || 1,
            column: data.column || 1
          },
          time: totalTime,
          loading: false
        });
      }
    } catch (err) {
      updateActiveTab({
        results: null,
        error: { message: `Request Error: ${err.message}`, line: 1, column: 1 },
        loading: false
      });
    }
  };

  // -------------------------------------------------------------------------
  // QUERY PARSER UTILITIES (Client Format / Suggestion)
  // -------------------------------------------------------------------------
  const handleFormatQuery = () => {
    // Basic SQL formatter
    let sql = activeTab.code.trim();
    if (!sql) return;

    // Expand formatting rules
    const keyw = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON',
      'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'INSERT INTO', 'VALUES',
      'UPDATE', 'SET', 'DELETE FROM', 'GRAPH LINK', 'GRAPH TRAVERSE', 'FIND IN'
    ];

    let formatted = sql;
    keyw.forEach(k => {
      const rx = new RegExp(`\\b${k}\\b`, 'gi');
      formatted = formatted.replace(rx, `\n${k}`);
    });

    formatted = formatted
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .join('\n');

    // Identations
    formatted = formatted.replace(/\b(AND|OR)\b/gi, '\n  AND');

    updateActiveTab({ code: formatted });
  };

  const handleClearEditor = () => {
    updateActiveTab({ code: '', results: null, error: null });
  };

  // -------------------------------------------------------------------------
  // AUTO-COMPLETE SUGGESTIONS
  // -------------------------------------------------------------------------
  const handleKeyDown = (e) => {
    // Autocomplete navigation
    if (showAutocomplete && autocompleteSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev + 1) % autocompleteSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev - 1 + autocompleteSuggestions.length) % autocompleteSuggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(autocompleteSuggestions[activeSuggestionIdx]);
        return;
      }
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        return;
      }
    }

    // Standard Keyboard Shortcuts
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      handleClearEditor();
    } else if (e.ctrlKey && e.key === 'h') {
      e.preventDefault();
      setActiveSidebarTab('history');
    } else if (e.ctrlKey && e.key === ' ') {
      e.preventDefault();
      triggerAutocompleteManual();
    } else if (e.ctrlKey && e.key === '/') {
      e.preventDefault();
      toggleCommentLine();
    }
  };

  const toggleCommentLine = () => {
    const area = editorRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const lines = activeTab.code.split('\n');
    let charAcc = 0;
    let lineIdx = 0;

    for (let i = 0; i < lines.length; i++) {
      charAcc += lines[i].length + 1; // +1 for newline
      if (start < charAcc) {
        lineIdx = i;
        break;
      }
    }

    if (lines[lineIdx].startsWith('-- ')) {
      lines[lineIdx] = lines[lineIdx].substring(3);
    } else {
      lines[lineIdx] = '-- ' + lines[lineIdx];
    }

    const nextCode = lines.join('\n');
    updateActiveTab({ code: nextCode });
  };

  const triggerAutocompleteManual = () => {
    const allWords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'INNER', 'LEFT', 'RIGHT', 'ORDER BY', 'LIMIT', 'OFFSET',
      'UNION', 'INTERSECT', 'CREATE TABLE', 'DROP TABLE', 'RENAME TABLE', 'INSERT INTO', 'UPDATE', 'SET', 'DELETE FROM',
      'FIND IN', 'GRAPH LINK', 'GRAPH TRAVERSE', 'DEPTH', 'CONTAINS', 'LIKE', 'INDEX CREATE'
    ];

    // Add table and column names from schema
    const activeDbMeta = schemaData.find(d => d.name === activeDatabase);
    if (activeDbMeta) {
      activeDbMeta.tables.forEach(t => {
        allWords.push(t.name);
        t.columns.forEach(c => {
          allWords.push(c.name);
          allWords.push(`${t.name}.${c.name}`);
        });
      });
    }

    setAutocompleteSuggestions(allWords.slice(0, 12));
    setActiveSuggestionIdx(0);
    setShowAutocomplete(true);
  };

  const handleEditorChange = (e) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setCursorPosition(pos);
    updateActiveTab({ code: val });

    // Sync scroll
    if (editorHighlightRef.current) {
      editorHighlightRef.current.scrollTop = e.target.scrollTop;
      editorHighlightRef.current.scrollLeft = e.target.scrollLeft;
    }

    // Simple Autocomplete trigger
    const wordsBefore = val.slice(0, pos).split(/[\s,()]+/);
    const lastWord = wordsBefore[wordsBefore.length - 1].toUpperCase();

    if (lastWord.length >= 2) {
      const candidates = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'INNER', 'LEFT', 'RIGHT', 'ORDER BY', 'LIMIT',
        'UNION', 'INTERSECT', 'INSERT INTO', 'UPDATE', 'SET', 'DELETE FROM', 'FIND', 'GRAPH', 'TRAVERSE',
        'CONTAINS', 'LIKE'
      ];

      // Add tables
      const activeDbMeta = schemaData.find(d => d.name === activeDatabase);
      if (activeDbMeta) {
        activeDbMeta.tables.forEach(t => {
          candidates.push(t.name);
          t.columns.forEach(c => candidates.push(c.name));
        });
      }

      const filtered = candidates.filter(w => w.toUpperCase().startsWith(lastWord));
      if (filtered.length > 0) {
        setAutocompleteSuggestions(filtered);
        setActiveSuggestionIdx(0);
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  const insertSuggestion = (word) => {
    const area = editorRef.current;
    if (!area) return;

    const val = activeTab.code;
    const pos = cursorPosition;

    // Find the word bounds preceding cursor
    const beforePart = val.slice(0, pos);
    const afterPart = val.slice(pos);
    
    // Find index of last separator
    const match = beforePart.match(/[\s,().]+$/);
    const lastSepIdx = match ? beforePart.length - match[0].length : beforePart.length;

    // Look back to strip typed characters
    let lastWordStart = beforePart.search(/[\w.*]+$/);
    if (lastWordStart === -1) lastWordStart = pos;

    const nextCode = val.slice(0, lastWordStart) + word + ' ' + afterPart;
    updateActiveTab({ code: nextCode });
    setShowAutocomplete(false);

    // Reposition cursor
    setTimeout(() => {
      area.focus();
      const nextPos = lastWordStart + word.length + 1;
      area.setSelectionRange(nextPos, nextPos);
      setCursorPosition(nextPos);
    }, 10);
  };

  // -------------------------------------------------------------------------
  // CODE REAL-TIME HIGHLIGHTER DISPLAY
  // -------------------------------------------------------------------------
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const highlightSQL = (text) => {
    if (!text) return '';
    
    const keywords = new Set([
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'SHOW', 'USE', 'DESCRIBE',
      'RENAME', 'TO', 'FROM', 'WHERE', 'JOIN', 'ON', 'INNER', 'LEFT', 'RIGHT', 'ORDER',
      'BY', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'FIND', 'IN', 'CONTAINS', 'INDEX',
      'GRAPH', 'LINK', 'AS', 'TRAVERSE', 'DEPTH', 'AND', 'OR', 'LIKE', 'SET', 'INTO', 'VALUES',
      'DATABASE', 'DATABASES', 'TABLE', 'TABLES'
    ]);

    // Tokenize strings & comments first, then keywords
    // Tokenizer regex splits comments, strings, identifiers, and symbols
    const tokens = text.split(/(\-\-.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\w+\b|[=><!+\-*/]+|->|[(),.;\s])/m);

    let html = '';
    tokens.forEach(tok => {
      if (!tok) return;

      if (tok.startsWith('--')) {
        html += `<span class="text-cyber-muted italic">${escapeHtml(tok)}</span>`;
      } else if ((tok.startsWith("'") && tok.endsWith("'")) || (tok.startsWith('"') && tok.endsWith('"'))) {
        html += `<span class="syntax-string">${escapeHtml(tok)}</span>`;
      } else if (keywords.has(tok.toUpperCase())) {
        html += `<span class="syntax-keyword">${tok.toUpperCase()}</span>`;
      } else if (/^[0-9.]+$/.test(tok)) {
        html += `<span class="syntax-number">${tok}</span>`;
      } else if (/^[=><!+\-*/]+|->$/.test(tok)) {
        html += `<span class="syntax-operator">${tok}</span>`;
      } else if (/^[(),.;]$/.test(tok)) {
        html += `<span class="syntax-punctuation">${tok}</span>`;
      } else if (/\s+/.test(tok)) {
        html += escapeHtml(tok);
      } else {
        html += `<span class="syntax-identifier">${escapeHtml(tok)}</span>`;
      }
    });

    return html;
  };

  // -------------------------------------------------------------------------
  // TREE VIEW ACTIONS & TAB SELECT
  // -------------------------------------------------------------------------
  const handleSelectTable = (tblName) => {
    setSelectedTable(tblName);
    const sql = `SELECT * FROM ${tblName};`;
    updateActiveTab({ code: sql });
    handleRunQuery(sql);
  };

  const handleSelectSample = (sql) => {
    updateActiveTab({ code: sql });
    handleRunQuery(sql);
  };

  const handleSelectHistory = (sql) => {
    updateActiveTab({ code: sql });
  };

  // Tabs additions
  const handleAddTab = () => {
    const nextId = Math.max(...tabs.map(t => t.id), 0) + 1;
    setTabs(prev => [
      ...prev,
      {
        id: nextId,
        title: `query_${nextId}.sql`,
        code: '-- Write your query here\n',
        results: null,
        error: null,
        time: null,
        loading: false,
        inTransaction: false
      }
    ]);
    setActiveTabId(nextId);
  };

  const handleCloseTab = (id, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Must have at least one tab
    setTabs(prev => prev.filter(t => t.id !== id));
    if (activeTabId === id) {
      const remaining = tabs.filter(t => t.id !== id);
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  // -------------------------------------------------------------------------
  // CONTEXT MENUS (DBeaver feel)
  // -------------------------------------------------------------------------
  const handleTableRightClick = (e, dbName, tableName) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      tableName,
      dbName
    });
  };

  const handleRenameTrigger = () => {
    if (!contextMenu) return;
    setRenameModal({ tableName: contextMenu.tableName, newName: contextMenu.tableName });
    setContextMenu(null);
  };

  const executeRenameAction = async () => {
    if (!renameModal) return;
    const query = `RENAME TABLE ${renameModal.tableName} TO ${renameModal.newName};`;
    setRenameModal(null);
    updateActiveTab({ code: query });
    await handleRunQuery(query);
  };

  const handleDropTrigger = async () => {
    if (!contextMenu) return;
    const confirmDrop = window.confirm(`Are you sure you want to drop table '${contextMenu.tableName}'? All data will be lost.`);
    if (confirmDrop) {
      const query = `DROP TABLE ${contextMenu.tableName};`;
      setContextMenu(null);
      updateActiveTab({ code: query });
      await handleRunQuery(query);
    }
  };

  const handleDescribeTrigger = async () => {
    if (!contextMenu) return;
    const query = `DESCRIBE ${contextMenu.tableName};`;
    setContextMenu(null);
    updateActiveTab({ code: query });
    await handleRunQuery(query);
  };

  // Reset demo datasets
  const handleFactoryReset = async () => {
    if (window.confirm('Reset database to default seeded cybersecurity metrics?')) {
      try {
        const res = await fetch('/api/seed', { method: 'POST' });
        if (res.ok) {
          fetchSchema();
          fetchHistory();
          updateActiveTab({ code: 'SELECT * FROM threats;', results: null, error: null });
          handleRunQuery('SELECT * FROM threats;');
          alert('Database reset successful.');
        }
      } catch (err) {
        alert('Failed database reset: ' + err.message);
      }
    }
  };

  // -------------------------------------------------------------------------
  // RESULTS GRID HELPERS (Sorting, Filtering, Pagination, Copy, CSV)
  // -------------------------------------------------------------------------
  const handleCellClick = (val) => {
    if (val === null || val === undefined) return;
    const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
    navigator.clipboard.writeText(strVal);
    setCopiedCellVal(strVal);
    setTimeout(() => setCopiedCellVal(null), 2000);
  };

  const handleSort = (columnName) => {
    setSortConfig(prev => {
      if (prev.column === columnName) {
        return { column: columnName, direction: prev.direction === 'ASC' ? 'DESC' : 'ASC' };
      }
      return { column: columnName, direction: 'ASC' };
    });
  };

  const handleFilterChange = (col, val) => {
    setResultsSearchFilters(prev => ({
      ...prev,
      [col]: val
    }));
    setCurrentPage(1);
  };

  // Process rows
  const getProcessedRows = () => {
    if (!activeTab.results) return [];
    let rows = [...activeTab.results.rows];
    const cols = activeTab.results.columns;

    // Apply column level filters
    Object.keys(resultsSearchFilters).forEach(col => {
      const query = resultsSearchFilters[col].toLowerCase().trim();
      if (query === '') return;
      const idx = cols.indexOf(col);
      if (idx !== -1) {
        rows = rows.filter(r => {
          const cell = r[idx];
          if (cell === null || cell === undefined) return false;
          return String(cell).toLowerCase().includes(query);
        });
      }
    });

    // Apply sorting
    if (sortConfig.column) {
      const idx = cols.indexOf(sortConfig.column);
      if (idx !== -1) {
        rows.sort((a, b) => {
          let valA = a[idx];
          let valB = b[idx];

          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;

          if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'DESC' ? valB - valA : valA - valB;
          }
          return sortConfig.direction === 'DESC'
            ? String(valB).localeCompare(String(valA))
            : String(valA).localeCompare(String(valB));
        });
      }
    }

    return rows;
  };

  const processedRows = getProcessedRows();
  const paginatedRows = processedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(processedRows.length / rowsPerPage) || 1;

  // Export CSV
  const handleExportCSV = () => {
    if (!activeTab.results) return;
    const { columns, rows } = activeTab.results;
    let csv = columns.join(',') + '\n';
    rows.forEach(r => {
      csv += r.map(cell => {
        if (cell === null || cell === undefined) return '';
        const str = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeDatabase}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!activeTab.results) return;
    const { columns, rows } = activeTab.results;
    const arr = rows.map(r => {
      const obj = {};
      columns.forEach((c, idx) => {
        obj[c] = r[idx];
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeDatabase}_export.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------------------
  // AUTO-GENERATING CHARTS FOR VISUALIZATIONS
  // -------------------------------------------------------------------------
  const renderAnalyticsCharts = () => {
    if (!activeTab.results || activeTab.results.rows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-cyber-muted space-y-2">
          <BarChart2 className="w-12 h-12 text-cyber-muted/40 animate-pulse" />
          <p className="text-sm">Execute a query statement to generate visual analytics charts</p>
        </div>
      );
    }

    const { columns, rows } = activeTab.results;

    // Convert rows array to objects list for Recharts
    const chartData = rows.map(row => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    // Detect numeric vs categorical columns
    const numericCols = [];
    const categoricalCols = [];

    columns.forEach(col => {
      // Check first 5 rows to infer types
      let isNumeric = true;
      let hasData = false;

      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const val = chartData[i][col];
        if (val !== null && val !== undefined) {
          hasData = true;
          if (isNaN(Number(val))) {
            isNumeric = false;
            break;
          }
        }
      }

      if (hasData) {
        if (isNumeric) numericCols.push(col);
        else categoricalCols.push(col);
      }
    });

    // Handle group by results automatically
    const isGroupBy = activeTab.code.toUpperCase().includes('GROUP BY');
    let groupByKey = null;
    let aggregateKeys = [];

    if (isGroupBy) {
      // Find group key and aggregate values
      // We can look at what is categorical and what is numeric
      groupByKey = columns.find(c => categoricalCols.includes(c)) || columns[0];
      aggregateKeys = columns.filter(c => c !== groupByKey && numericCols.includes(c));
    } else {
      // Default to ID or first categorical for X, and all numerics for Y
      groupByKey = columns.find(c => c.toLowerCase() === 'id' || c.toLowerCase() === 'layer' || categoricalCols.includes(c)) || columns[0];
      aggregateKeys = numericCols.filter(c => c !== groupByKey).slice(0, 3);
    }

    // Pie chart distribution
    const firstCat = categoricalCols[0] || columns[0];
    const distribution = {};
    chartData.forEach(item => {
      const keyVal = String(item[firstCat]);
      distribution[keyVal] = (distribution[keyVal] || 0) + 1;
    });
    const pieData = Object.keys(distribution).map(name => ({
      name,
      value: distribution[name]
    })).slice(0, 10);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-y-auto p-2">
        {/* Bar/Line Chart */}
        {aggregateKeys.length > 0 && (
          <div className="glass-panel p-4 rounded border border-white/5 flex flex-col h-[280px]">
            <h4 className="text-xs font-semibold text-cyber-cyan uppercase tracking-wider mb-2 flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5" /> Performance & Values Analytics
            </h4>
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(0, 30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey={groupByKey} stroke="#8b949e" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8b949e" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                  <Legend />
                  {aggregateKeys.map((k, idx) => (
                    <Bar key={k} dataKey={k} fill={COLORS[idx % COLORS.length]} radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Categorical Distribution Pie Chart */}
        {categoricalCols.length > 0 && pieData.length > 0 && (
          <div className="glass-panel p-4 rounded border border-white/5 flex flex-col h-[280px]">
            <h4 className="text-xs font-semibold text-cyber-purple uppercase tracking-wider mb-2 flex items-center gap-1">
              <PieIcon className="w-3.5 h-3.5" /> Categorical Fields Distribution ({firstCat})
            </h4>
            <div className="flex-1 w-full text-xs flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Trend Line Chart */}
        {aggregateKeys.length > 0 && (
          <div className="glass-panel p-4 rounded border border-white/5 flex flex-col h-[280px] md:col-span-2">
            <h4 className="text-xs font-semibold text-cyber-green uppercase tracking-wider mb-2 flex items-center gap-1">
              <Network className="w-3.5 h-3.5" /> System Metrics Trend Analysis
            </h4>
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.slice(0, 30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey={groupByKey} stroke="#8b949e" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8b949e" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#e2e8f0' }}
                  />
                  <Legend />
                  {aggregateKeys.map((k, idx) => (
                    <Line key={k} type="monotone" dataKey={k} stroke={COLORS[(idx + 2) % COLORS.length]} strokeWidth={2} dot={{ r: 2 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // INFERRED ACTIVE TABLE INFORMATION (Right Sidebar)
  // -------------------------------------------------------------------------
  const activeDbData = schemaData.find(d => d.name === activeDatabase);
  const activeTableInfo = selectedTable && activeDbData
    ? activeDbData.tables.find(t => t.name === selectedTable)
    : activeDbData && activeDbData.tables.length > 0
    ? activeDbData.tables[0]
    : null;

  // -------------------------------------------------------------------------
  // RESIZE PANEL MOUSE DRAG EVENT HANDLERS
  // -------------------------------------------------------------------------
  const startLeftResize = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      const nextWidth = Math.max(180, Math.min(450, moveEvent.clientX));
      setLeftWidth(nextWidth);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startRightResize = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      const nextWidth = Math.max(180, Math.min(450, window.innerWidth - moveEvent.clientX));
      setRightWidth(nextWidth);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startBottomResize = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      const nextHeight = Math.max(150, Math.min(window.innerHeight - 150, window.innerHeight - moveEvent.clientY));
      setBottomHeight(nextHeight);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // -------------------------------------------------------------------------
  // PRELOADED SAMPLE DATABASE QUERIES
  // -------------------------------------------------------------------------
  const sampleQueries = [
    { title: 'Show all users', sql: 'SELECT * FROM users;' },
    { title: 'Find threats by confidence', sql: 'SELECT * FROM threats WHERE confidence >= 90 ORDER BY confidence DESC;' },
    { title: 'Join scans with users', sql: 'SELECT u.name, s.result, s.duration_ms \nFROM users u \nJOIN scans s ON u.id = s.user_id \nWHERE s.result = "blocked";' },
    { title: 'Cache performance stats', sql: 'SELECT layer, hits, misses, hit_rate FROM cache_stats ORDER BY hit_rate DESC;' },
    { title: 'Group threats by type', sql: 'SELECT type, COUNT(*) AS total_threats, AVG(confidence) AS avg_confidence \nFROM threats \nGROUP BY type;' },
    { title: 'NoSQL: Find nested city', sql: 'FIND IN users WHERE metadata.city = "Lahore";' },
    { title: 'NoSQL: Find role tags', sql: 'FIND IN users WHERE tags CONTAINS "admin";' },
    { title: 'Graph Link: Bind Threat', sql: 'GRAPH LINK users(3) -> threats(2) AS "investigating";' },
    { title: 'Graph Traverse: Path analysis', sql: 'GRAPH TRAVERSE FROM users(1) DEPTH 3;' }
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-cyber-bg text-cyber-text" onClick={() => setContextMenu(null)}>
      
      {/* ---------------------------------------------------------------------
          TOP NAVBAR
          --------------------------------------------------------------------- */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-white/5 bg-cyber-card/80 backdrop-blur-md z-40 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-gradient-to-tr from-cyber-purple to-cyber-cyan text-black font-extrabold text-[10px] tracking-tighter">
              SDB
            </span>
            <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-white via-[#dedede] to-cyber-cyan bg-clip-text text-transparent">
              SENTINEL<span className="text-cyber-cyan">DB</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#7c3aed] border border-[#7c3aed]/30 px-1 rounded bg-[#7c3aed]/5 font-mono ml-2">
              v1.2.0
            </span>
          </div>

          <div className="h-4 w-px bg-white/10 mx-2" />

          {/* Connection Status indicator */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${connectionStatus.connected ? 'bg-cyber-green animate-pulse shadow-green-glow' : 'bg-cyber-red animate-pulse shadow-cyan-glow'}`} />
            <span className={connectionStatus.connected ? 'text-cyber-green' : 'text-cyber-red font-semibold'}>
              {connectionStatus.connected ? 'Atlas Cluster Connected' : 'Local Sandbox Mode'}
            </span>
            <span className="text-cyber-muted text-[10px] max-w-[200px] truncate font-mono">
              ({connectionStatus.connected ? activeDatabase : 'in-memory Mock'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[11px] text-right">
            <span className="text-cyber-muted block text-[10px]">User Role</span>
            <span className="text-cyber-cyan font-mono font-semibold">DBA_ADMIN@prismdb</span>
          </div>

          {/* Factory Seed reset */}
          <button
            onClick={handleFactoryReset}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-mono font-bold tracking-wider rounded border border-cyber-purple/40 hover:border-cyber-purple text-cyber-purple hover:bg-cyber-purple/10 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset Seeder
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------------
          MAIN LAYOUT PANELS
          --------------------------------------------------------------------- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 1. LEFT SIDEBAR: EXPLORER / HISTORY / SAMPLES */}
        <aside
          style={{ width: `${leftWidth}px` }}
          className="flex flex-col border-r border-white/5 bg-[#0b0c10]/95 backdrop-blur-md relative h-full select-none"
        >
          {/* Sidebar Tab Triggers */}
          <div className="flex border-b border-white/5 text-[10px] font-mono tracking-wider font-semibold">
            <button
              onClick={() => setActiveSidebarTab('explorer')}
              className={`flex-1 py-2 text-center border-b ${activeSidebarTab === 'explorer' ? 'text-cyber-cyan border-cyber-cyan bg-white/5' : 'text-cyber-muted border-transparent hover:text-white'}`}
            >
              EXPLORER
            </button>
            <button
              onClick={() => setActiveSidebarTab('sample')}
              className={`flex-1 py-2 text-center border-b ${activeSidebarTab === 'sample' ? 'text-cyber-purple border-cyber-purple bg-white/5' : 'text-cyber-muted border-transparent hover:text-white'}`}
            >
              TEMPLATES
            </button>
            <button
              onClick={() => setActiveSidebarTab('history')}
              className={`flex-1 py-2 text-center border-b ${activeSidebarTab === 'history' ? 'text-cyber-green border-cyber-green bg-white/5' : 'text-cyber-muted border-transparent hover:text-white'}`}
            >
              LOGS
            </button>
          </div>

          {/* Sidebar Body */}
          <div className="flex-1 overflow-y-auto p-3">
            
            {/* tab: DATABASE EXPLORER TREE (DBeaver style) */}
            {activeSidebarTab === 'explorer' && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={tableSearchText}
                    onChange={(e) => setTableSearchText(e.target.value)}
                    className="w-full h-7 pl-7 pr-3 text-[11px] bg-white/5 border border-white/10 rounded focus:border-cyber-cyan focus:outline-none text-cyber-text"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1.5 text-cyber-muted" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyber-cyan py-1">
                    <Database className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>{activeDatabase}</span>
                  </div>

                  <div className="pl-4 space-y-1">
                    {activeDbData && activeDbData.tables ? (
                      activeDbData.tables
                        .filter(t => t.name.toLowerCase().includes(tableSearchText.toLowerCase()))
                        .map(table => {
                          const isSel = selectedTable === table.name;
                          return (
                            <div key={table.name} className="space-y-0.5">
                              {/* Table Node item */}
                              <div
                                onClick={() => handleSelectTable(table.name)}
                                onContextMenu={(e) => handleTableRightClick(e, activeDatabase, table.name)}
                                className={`group flex items-center justify-between pl-2 pr-1 py-1 rounded cursor-pointer transition-colors ${isSel ? 'bg-cyber-cyan/10 text-cyber-cyan border-l-2 border-cyber-cyan' : 'hover:bg-white/5 text-cyber-muted hover:text-cyber-text'}`}
                              >
                                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                                  <TableIcon className="w-3 h-3 text-cyber-muted group-hover:text-cyber-text" />
                                  <span>{table.name}</span>
                                </div>
                                <span className="text-[9px] font-mono font-bold bg-white/10 text-cyber-muted px-1.5 py-0.5 rounded-full">
                                  {table.rowCount}
                                </span>
                              </div>

                              {/* Nested columns list under table */}
                              {isSel && (
                                <div className="pl-6 space-y-0.5 border-l border-white/5 ml-3 my-0.5">
                                  {table.columns.map(col => (
                                    <div key={col.name} className="flex items-center gap-1 text-[10px] text-cyber-muted py-0.5">
                                      <span className="w-1 h-1 rounded-full bg-white/20" />
                                      <span className="font-mono text-white/70">{col.name}</span>
                                      <span className="italic text-[9px] text-cyber-muted">
                                        ({col.type.toLowerCase()}
                                        {col.isPrimaryKey ? ', PK' : ''}
                                        {col.isNotNull ? ', NOT NULL' : ''}
                                        {col.isUnique ? ', UNIQUE' : ''})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-[10px] text-cyber-muted italic pl-2">No tables found.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* tab: SAMPLE PRELOADED QUERIES */}
            {activeSidebarTab === 'sample' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-cyber-purple font-mono mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Click to run template:</span>
                </div>
                <div className="space-y-1.5">
                  {sampleQueries.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(item.sql)}
                      className="w-full text-left p-2 rounded bg-white/5 hover:bg-cyber-purple/10 border border-white/5 hover:border-cyber-purple/30 text-[11px] transition-colors"
                    >
                      <div className="font-semibold text-cyber-purple mb-0.5 font-mono">{item.title}</div>
                      <pre className="text-[9px] text-cyber-muted overflow-hidden text-ellipsis whitespace-nowrap font-mono">{item.sql}</pre>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* tab: QUERY HISTORY LOGS (Last 50) */}
            {activeSidebarTab === 'history' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-cyber-green font-mono mb-2">
                  <span className="flex items-center gap-1"><HistoryIcon className="w-3.5 h-3.5" /> Query History Logs</span>
                  <span className="text-[9px] text-cyber-muted">({queryHistory.length} run)</span>
                </div>

                <div className="space-y-1.5">
                  {queryHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectHistory(item.query)}
                      className="w-full text-left p-2 rounded bg-white/5 hover:bg-cyber-green/10 border border-white/5 hover:border-cyber-green/30 text-[10px] transition-colors font-mono"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-cyber-muted">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.success ? 'bg-cyber-green' : 'bg-cyber-red'}`} />
                          <span className="text-[9px] text-white">{item.executionTimeMs}ms</span>
                        </div>
                      </div>
                      <pre className="text-[9.5px] text-white/80 overflow-x-auto whitespace-pre">{item.query}</pre>
                      {item.error && <p className="text-cyber-red text-[8.5px] truncate mt-1">{item.error}</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Left panel resize handle */}
          <div
            onMouseDown={startLeftResize}
            className="resize-handle-h absolute right-0 top-0 bottom-0 z-50"
          />
        </aside>

        {/* 2. MIDDLE AREA: TABS + QUERY EDITOR + GRID */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#07080b]">
          
          {/* Query Tabs Headers */}
          <div className="flex items-center justify-between h-9 bg-[#0b0c10] border-b border-white/5 px-2 select-none">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map(tab => {
                const isActive = tab.id === activeTabId;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`group flex items-center gap-2 px-3 h-8 text-[11px] font-mono cursor-pointer rounded-t border-t border-x transition-colors ${isActive ? 'bg-cyber-card text-cyber-cyan border-white/10' : 'bg-[#0f141c]/50 text-cyber-muted border-transparent hover:text-white'}`}
                  >
                    <span>{tab.title}</span>
                    {tab.inTransaction && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Active Transaction State" />
                    )}
                    <button
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-cyber-red"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              
              <button
                onClick={handleAddTab}
                className="p-1 rounded text-cyber-muted hover:text-cyber-cyan hover:bg-white/5 ml-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] font-mono text-cyber-muted hidden md:block">
              {activeDatabase} Database Workbench
            </div>
          </div>

          {/* QUERY EDITOR CONTAINER */}
          <div className="flex-1 flex flex-col min-h-0 relative bg-cyber-bg">
            
            {/* Syntax Highlighting IDE Code area */}
            <div className="flex-1 relative overflow-hidden font-mono text-xs">
              
              {/* Line Numbers panel */}
              <div className="absolute left-0 top-0 bottom-0 w-11 bg-white/[0.02] border-r border-white/5 flex flex-col items-end pr-2 text-[#4f5b66] select-none pt-3">
                {activeTab.code.split('\n').map((_, idx) => (
                  <div key={idx} className="h-5 leading-5">{idx + 1}</div>
                ))}
              </div>

              {/* Textarea Input (transparent text, overlays pre block) */}
              <textarea
                ref={editorRef}
                value={activeTab.code}
                onChange={handleEditorChange}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                style={{ caretColor: '#ffffff' }}
                className="absolute left-11 right-0 top-0 bottom-0 p-3 pt-3 pl-3 text-transparent bg-transparent resize-none focus:outline-none font-mono text-xs leading-5 whitespace-pre overflow-auto z-10 select-text"
              />

              {/* Syntax Highlight Overlay Pre block */}
              <pre
                ref={editorHighlightRef}
                dangerouslySetInnerHTML={{ __html: highlightSQL(activeTab.code) }}
                className="absolute left-11 right-0 top-0 bottom-0 p-3 pt-3 pl-3 text-[#abb2bf] pointer-events-none font-mono text-xs leading-5 whitespace-pre overflow-hidden z-0"
              />

              {/* Red squiggly line parser warning overlay */}
              {activeTab.error && activeTab.error.position !== undefined && (
                <div
                  style={{
                    position: 'absolute',
                    top: `${Math.max(0, activeTab.error.line - 1) * 20 + 20}px`,
                    left: '52px',
                    height: '2px',
                    width: '120px',
                    background: 'repeating-linear-gradient(90deg, #f43f5e, #f43f5e 2px, transparent 2px, transparent 4px)',
                    zIndex: 5
                  }}
                  title={activeTab.error.message}
                />
              )}

              {/* Auto-complete suggestions box */}
              {showAutocomplete && autocompleteSuggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '80px',
                    left: '120px',
                    zIndex: 60
                  }}
                  className="w-48 bg-cyber-card border border-white/10 rounded shadow-cyan-glow p-1 text-[11px] font-mono"
                >
                  {autocompleteSuggestions.map((item, idx) => (
                    <div
                      key={item}
                      onClick={() => insertSuggestion(item)}
                      className={`px-2 py-1 rounded cursor-pointer ${idx === activeSuggestionIdx ? 'bg-cyber-cyan text-black font-semibold' : 'text-white hover:bg-white/5'}`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ERROR DISPLAY AREA */}
            {activeTab.error && (
              <div className="mx-4 mb-2 p-2 bg-cyber-red/10 border border-cyber-red/20 rounded flex items-start gap-2 text-cyber-red text-[11px] font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold uppercase">Error near line {activeTab.error.line}, col {activeTab.error.column}: </span>
                  {activeTab.error.message}
                </div>
              </div>
            )}

            {/* Run Operations Control bar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/5 bg-[#0b0c10] select-none">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunQuery()}
                  disabled={activeTab.loading}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyber-cyan hover:bg-[#00b0d6] text-black font-bold font-mono text-[11px] uppercase transition-colors shadow-cyan-glow disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  {activeTab.loading ? 'Running...' : 'Execute (Ctrl+↵)'}
                </button>

                {activeTab.inTransaction && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-mono font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>● STAGED TRANSACTION</span>
                  </div>
                )}

                <button
                  onClick={handleFormatQuery}
                  className="px-2.5 py-1 text-[10px] font-mono border border-white/10 hover:border-white/20 text-cyber-muted hover:text-white rounded transition-colors"
                >
                  Beautify Query
                </button>
                <button
                  onClick={handleClearEditor}
                  className="px-2.5 py-1 text-[10px] font-mono border border-white/10 hover:border-white/20 text-cyber-muted hover:text-white rounded transition-colors"
                >
                  Clear Editor
                </button>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-mono text-cyber-muted">
                <span>Ctrl+Space: Autocomplete</span>
                <span>•</span>
                <span>F5: Reload tree</span>
              </div>
            </div>

          </div>

          {/* 3. BOTTOM RESULTS & GRID DISPLAY PANEL */}
          <section
            style={{ height: `${bottomHeight}px` }}
            className="border-t border-white/5 bg-cyber-card/45 relative flex flex-col min-h-0"
          >
            {/* Bottom Panel resize handle */}
            <div
              onMouseDown={startBottomResize}
              className="resize-handle-v absolute top-0 left-0 right-0 z-50"
            />

            {/* Panel Tab options: Results or Visualizer Analytics */}
            <div className="flex items-center justify-between border-b border-white/5 h-8 bg-[#0b0c10] px-3 select-none">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBottomTab('grid')}
                  className={`px-3 h-8 text-[11px] font-mono font-semibold transition-colors ${bottomTab === 'grid' ? 'text-cyber-cyan border-b-2 border-cyber-cyan bg-white/[0.02]' : 'text-cyber-muted hover:text-white'}`}
                >
                  RESULTS GRID
                </button>
                <button
                  onClick={() => setBottomTab('analytics')}
                  className={`px-3 h-8 text-[11px] font-mono font-semibold transition-colors ${bottomTab === 'analytics' ? 'text-cyber-purple border-b-2 border-cyber-purple bg-white/[0.02]' : 'text-cyber-muted hover:text-white'}`}
                >
                  VISUAL ANALYTICS
                </button>
                {activeTab.results && activeTab.results.graphVisualizer && (
                  <button
                    onClick={() => setBottomTab('graph')}
                    className={`px-3 h-8 text-[11px] font-mono font-semibold transition-colors ${bottomTab === 'graph' ? 'text-cyber-green border-b-2 border-cyber-green bg-white/[0.02]' : 'text-cyber-muted hover:text-white'}`}
                  >
                    GRAPH VISUALIZER
                  </button>
                )}
              </div>

              {/* Data Exporters */}
              {activeTab.results && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border border-white/10 hover:border-cyber-cyan text-[10px] text-cyber-muted hover:text-cyber-cyan font-mono transition-colors"
                  >
                    <FileSpreadsheet className="w-3 h-3" /> Export CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border border-white/10 hover:border-cyber-purple text-[10px] text-cyber-muted hover:text-cyber-purple font-mono transition-colors"
                  >
                    <FileJson className="w-3 h-3" /> Export JSON
                  </button>
                </div>
              )}
            </div>

            {/* Results body contents */}
            <div className="flex-1 overflow-auto p-2">
              
              {activeTab.results ? (
                bottomTab === 'analytics' ? (
                  renderAnalyticsCharts()
                ) : bottomTab === 'graph' && activeTab.results.graphVisualizer ? (
                  <GraphVisualizer graphData={activeTab.results.graphVisualizer} />
                ) : activeTab.results.rows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-cyber-muted space-y-1 py-8">
                    <Info className="w-8 h-8 text-cyber-muted/30" />
                    <p className="text-[11px] font-mono">Statement executed successfully. No rows returned.</p>
                    {activeTab.results.rowsAffected > 0 && (
                      <p className="text-[10px] text-cyber-green">{activeTab.results.rowsAffected} document records affected</p>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    {/* The Grid Table */}
                    <div className="flex-1 overflow-auto rounded border border-white/5 text-[11px] font-mono">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0b0c10]/80 sticky top-0 z-20 select-none">
                          <tr>
                            {activeTab.results.columns.map(col => {
                              const isSorted = sortConfig.column === col;
                              return (
                                <th key={col} className="p-1.5 border-b border-r border-white/5 font-semibold text-white/90">
                                  <div className="flex items-center justify-between">
                                    <span
                                      onClick={() => handleSort(col)}
                                      className="cursor-pointer hover:text-cyber-cyan pr-1 select-none"
                                    >
                                      {col} {isSorted && (sortConfig.direction === 'ASC' ? '▲' : '▼')}
                                    </span>
                                    {/* Column level Filter */}
                                    <input
                                      type="text"
                                      placeholder="Filter..."
                                      value={resultsSearchFilters[col] || ''}
                                      onChange={(e) => handleFilterChange(col, e.target.value)}
                                      className="w-12 h-4 px-1 text-[8.5px] bg-white/5 border border-white/10 rounded focus:border-cyber-cyan text-cyber-text"
                                    />
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-[#0d1117]/40 select-text">
                          {paginatedRows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-white/[0.03] transition-colors">
                              {row.map((cell, cellIdx) => {
                                const isNull = cell === null || cell === undefined;
                                const displayVal = isNull
                                  ? 'null'
                                  : typeof cell === 'object'
                                  ? JSON.stringify(cell)
                                  : String(cell);
                                return (
                                  <td
                                    key={cellIdx}
                                    onClick={() => handleCellClick(cell)}
                                    title="Click to copy cell value"
                                    className={`p-1.5 border-r border-white/5 truncate max-w-[200px] cursor-pointer ${isNull ? 'text-cyber-muted italic font-light' : 'text-white/80'}`}
                                  >
                                    {displayVal}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-cyber-muted select-none">
                      <div>
                        Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, processedRows.length)} of {processedRows.length} rows
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                          className="px-2 py-0.5 rounded border border-white/10 hover:border-white/20 hover:text-white disabled:opacity-30"
                        >
                          First
                        </button>
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                          className="px-2 py-0.5 rounded border border-white/10 hover:border-white/20 hover:text-white disabled:opacity-30"
                        >
                          Prev
                        </button>
                        <span className="px-2 text-white">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="px-2 py-0.5 rounded border border-white/10 hover:border-white/20 hover:text-white disabled:opacity-30"
                        >
                          Next
                        </button>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-2 py-0.5 rounded border border-white/10 hover:border-white/20 hover:text-white disabled:opacity-30"
                        >
                          Last
                        </button>
                      </div>
                    </div>

                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-cyber-muted/50 py-12">
                  <Play className="w-10 h-10 mb-2 stroke-1 text-cyber-muted/30" />
                  <p className="text-[11px] font-mono">No query results compiled yet. Enter statements in query tab above.</p>
                </div>
              )}

            </div>
          </section>
        </main>

        {/* 3. RIGHT SIDEBAR: SCHEMA INSPECTOR + STATS */}
        <aside
          style={{ width: `${rightWidth}px` }}
          className="flex flex-col border-l border-white/5 bg-[#0b0c10]/95 backdrop-blur-md relative h-full select-none"
        >
          {/* Right panel resize handle */}
          <div
            onMouseDown={startRightResize}
            className="resize-handle-h absolute left-0 top-0 bottom-0 z-50"
          />

          <div className="flex border-b border-white/5 text-[10px] font-mono tracking-wider font-semibold h-9 items-center px-3 text-cyber-cyan uppercase">
            <span>Schema Inspector</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            
            {activeTableInfo ? (
              <div className="space-y-4">
                {/* Table general info */}
                <div className="glass-panel p-2.5 rounded border border-white/5">
                  <div className="text-[11px] font-semibold text-white/95 font-mono flex items-center gap-1.5 mb-1.5">
                    <TableIcon className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>table: {activeTableInfo.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-cyber-muted">
                    <div>
                      <span>Rows count:</span>
                      <span className="block text-white font-semibold">{activeTableInfo.rowCount}</span>
                    </div>
                    <div>
                      <span>Columns count:</span>
                      <span className="block text-white font-semibold">{activeTableInfo.columns.length}</span>
                    </div>
                    <div>
                      <span>DB storage:</span>
                      <span className="block text-cyber-cyan font-bold">~{(activeTableInfo.rowCount * 0.45).toFixed(1)} KB</span>
                    </div>
                    <div>
                      <span>Active indexes:</span>
                      <span className="block text-cyber-purple font-mono font-bold">
                        {activeTableInfo.indexes.length} ({activeTableInfo.indexes.join(',')})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Columns inspection list */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-cyber-purple tracking-widest uppercase">Columns Details</h4>
                  
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {activeTableInfo.columns.map(col => (
                      <div key={col.name} className="p-2 rounded bg-white/5 border border-white/5 text-[10px] font-mono">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{col.name}</span>
                          <div className="flex gap-1">
                            {col.isPrimaryKey && <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1 rounded text-[8px] font-bold">PK</span>}
                            {col.isNotNull && <span className="text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1 rounded text-[8px] font-bold">NOT NULL</span>}
                            {col.isUnique && <span className="text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/20 px-1 rounded text-[8px] font-bold">UNIQUE</span>}
                            <span className="text-cyber-cyan bg-cyber-cyan/10 px-1 rounded text-[8.5px] uppercase font-bold">{col.type}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[9px] text-cyber-muted">
                          <div>Null values: {col.nullPercent}% ({col.nullCount})</div>
                          <div>Unique keys: {col.uniqueCount}</div>
                        </div>
                        {col.sample !== null && col.sample !== undefined && (
                          <div className="text-[8.5px] text-cyber-muted mt-1 truncate">
                            sample: <span className="text-cyber-green italic">
                              {typeof col.sample === 'object' ? JSON.stringify(col.sample) : String(col.sample)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-cyber-muted text-[11px] font-mono italic text-center">
                <Info className="w-8 h-8 text-cyber-muted/30 mb-2" />
                Select a table from the explorer tree to inspect columns metadata
              </div>
            )}

            {/* General Database Health Summary */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-cyber-green tracking-widest uppercase">Database Statistics</h4>
              
              <div className="glass-panel p-2.5 rounded border border-white/5 space-y-1 text-[10px] font-mono">
                <div className="flex justify-between text-cyber-muted">
                  <span>Total Databases:</span>
                  <span className="text-white font-bold">{schemaData.length}</span>
                </div>
                <div className="flex justify-between text-cyber-muted">
                  <span>Total Collections:</span>
                  <span className="text-white font-bold">
                    {schemaData.reduce((acc, db) => acc + db.tables.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-cyber-muted">
                  <span>In-Memory Buffer:</span>
                  <span className="text-cyber-green font-bold">99.8% cache rate</span>
                </div>
                <div className="flex justify-between text-cyber-muted">
                  <span>Network Latency:</span>
                  <span className="text-cyber-cyan font-bold">0.4ms avg</span>
                </div>
              </div>
            </div>

            {/* Quick action: Visual Analytics dashboard */}
            {activeTab.results && activeTab.results.rows.length > 0 && (
              <div className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/15 rounded-lg flex flex-col items-center gap-2 select-none">
                <span className="text-[10px] font-semibold text-cyber-cyan font-mono text-center">Real-Time Data Visualizations</span>
                <button
                  onClick={() => setBottomTab('analytics')}
                  className="w-full py-1 bg-cyber-cyan text-black hover:bg-[#00b0d6] font-mono font-bold text-[10px] rounded uppercase flex items-center justify-center gap-1.5 transition-colors shadow-cyan-glow"
                >
                  <BarChart2 className="w-3.5 h-3.5" /> View Analytics Charts
                </button>
              </div>
            )}

          </div>
        </aside>

      </div>

      {/* ---------------------------------------------------------------------
          FOOTER STATUS BAR
          --------------------------------------------------------------------- */}
      <footer className="h-6 border-t border-white/5 bg-[#0b0c10] px-4 flex items-center justify-between text-[10.5px] font-mono text-cyber-muted select-none z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus.connected ? 'bg-cyber-green' : 'bg-cyber-purple'}`} />
            <span className="text-white font-semibold">
              {connectionStatus.connected ? '● Atlas Connected' : '● Local In-Memory Sandbox'}
            </span>
          </div>
          <span>•</span>
          <span>Active DB: <span className="text-cyber-cyan font-semibold">{activeDatabase}</span></span>
          <span>•</span>
          <span>Tables: <span className="text-white">{activeDbData ? activeDbData.tables.length : 0}</span></span>
        </div>

        <div className="flex items-center gap-4">
          {copiedCellVal && (
            <div className="flex items-center gap-1 text-cyber-green font-bold bg-cyber-green/5 px-2 rounded animate-pulse border border-cyber-green/20">
              <Check className="w-3 h-3" /> Cell Copied!
            </div>
          )}
          <span>Rows returned: <span className="text-cyber-cyan font-bold">{activeTab.results ? activeTab.results.rows.length : 0}</span></span>
          <span>•</span>
          <span>Execution time: <span className="text-cyber-green font-bold">{activeTab.time !== null ? `${activeTab.time}ms` : '0ms'}</span></span>
        </div>
      </footer>

      {/* ---------------------------------------------------------------------
          MODALS & OVERLAYS
          --------------------------------------------------------------------- */}
      
      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="absolute z-50 bg-[#0f141c] border border-white/10 rounded shadow-cyan-glow py-1 text-[11px] font-mono w-36 text-left"
        >
          <button
            onClick={handleDescribeTrigger}
            className="w-full px-3 py-1.5 text-left text-white hover:bg-cyber-cyan hover:text-black flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3 h-3" /> Describe Table
          </button>
          <button
            onClick={handleRenameTrigger}
            className="w-full px-3 py-1.5 text-left text-white hover:bg-cyber-cyan hover:text-black flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3 h-3" /> Rename Table
          </button>
          <div className="h-px bg-white/10 my-0.5" />
          <button
            onClick={handleDropTrigger}
            className="w-full px-3 py-1.5 text-left text-cyber-red hover:bg-cyber-red hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Drop Table
          </button>
        </div>
      )}

      {/* Rename Modal */}
      {renameModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-panel p-4 rounded-lg w-80 border border-cyber-cyan/25 space-y-3 font-mono">
            <h3 className="text-xs font-bold text-cyber-cyan uppercase">Rename Table</h3>
            <div className="space-y-1">
              <label className="text-[10px] text-cyber-muted">New Name for '{renameModal.tableName}':</label>
              <input
                type="text"
                value={renameModal.newName}
                onChange={(e) => setRenameModal(prev => ({ ...prev, newName: e.target.value }))}
                className="w-full h-8 px-2 bg-white/5 border border-white/15 focus:border-cyber-cyan rounded focus:outline-none text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 text-[10px]">
              <button
                onClick={() => setRenameModal(null)}
                className="px-3 py-1 rounded border border-white/10 hover:border-white/20 text-cyber-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={executeRenameAction}
                className="px-3 py-1 rounded bg-cyber-cyan text-black font-bold"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
