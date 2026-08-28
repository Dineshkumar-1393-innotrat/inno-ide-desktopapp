import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./styles/index.css";
import CreateProductDefintionModal from "../Product/ProductDefinitionModal/CreateProductDefintionModal";
import { ruleEngineApi } from "../../services/ruleEngineService";
import { useProject } from "../../ProjectContext";
import {
  LayoutDashboard,
  Plus,
  Search,
  Bell,
  Activity,
  Cpu,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  Copy,
  Play,
  Download,
  RefreshCw,
  Wifi,
  Server,
  BarChart2,
  ArrowRight,
  ChevronRight,
  Terminal,
  Sliders,
  TrendingUp,
  Shield,
  FileText,
  Upload,
  Check,
  Radio,
  Grid,
  ChevronLeft,
  Package,
  MoreHorizontal,
  Sparkles,
  FolderOpen,
  HardDrive,
  Eye,
  LineChart as LineChartIcon,
  Gauge,
  ExternalLink,
  Mail,
  Smartphone,
  GitBranch,
  Table
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
const PROJECTS = [
  {
    id: "proj-1",
    name: "Smart Factory Thermal Monitor",
    description: "Real-time temperature and vibration tracking for CNC machines and automated assembly lines.",
    status: "active",
    devices: 12,
    lastModified: "2 mins ago",
    category: "Industrial IoT",
    tags: ["Thermal", "Vibration", "ESP32"]
  },
  {
    id: "proj-2",
    name: "Greenhouse Environmental Control",
    description: "Automated climate control monitoring ambient temperature, humidity, and soil moisture sensors.",
    status: "active",
    devices: 8,
    lastModified: "1 hour ago",
    category: "AgriTech",
    tags: ["Climate", "Soil", "LoRaWAN"]
  },
  {
    id: "proj-3",
    name: "Smart Grid Power Metering",
    description: "Power consumption telemetry and automatic load balancing rules for distribution panels.",
    status: "idle",
    devices: 24,
    lastModified: "1 day ago",
    category: "Energy",
    tags: ["Power", "Metering", "Modbus"]
  }
];

const FILES = [
  { name: "thermal_threshold_config.json", size: "14.2 KB", modified: "10 mins ago", type: "json" },
  { name: "sensor_telemetry_pipeline.py", size: "28.5 KB", modified: "1 hour ago", type: "py" },
  { name: "alert_notification_hooks.cpp", size: "42.0 KB", modified: "Yesterday", type: "cpp" }
];

const SENSOR_DATA_LIVE = [];

const RULES_DATA = [
  { id: "rule-1", name: "High Temperature Critical Shutdown", status: "active", enabled: true, severity: "critical", triggers: 14, conditions: [{ sensor: "temp", operator: ">", threshold: 85 }] },
  { id: "rule-2", name: "Abnormal Vibration Warning", status: "active", enabled: true, severity: "warning", triggers: 6, conditions: [{ sensor: "vibration", operator: ">", threshold: 1.2 }] },
  { id: "rule-3", name: "Low Humidity Irrigation Trigger", status: "active", enabled: true, severity: "info", triggers: 3, conditions: [{ sensor: "humidity", operator: "<", threshold: 40 }] },
  { id: "rule-4", name: "Power Surge Safety Cutoff", status: "active", enabled: true, severity: "critical", triggers: 1, conditions: [{ sensor: "powerDraw", operator: ">", threshold: 750 }] }
];

const ALERTS_HISTORY = [
  { id: "alt-1", title: "High Temperature Critical Shutdown", severity: "critical", timestamp: "Today, 14:32", resolved: false, details: "CNC Machine #4 exceeded 85°C threshold." },
  { id: "alt-2", title: "Abnormal Vibration Warning", severity: "warning", timestamp: "Today, 12:15", resolved: true, details: "Motor B2 vibration spike detected." },
  { id: "alt-3", title: "Power Surge Safety Cutoff", severity: "critical", timestamp: "Yesterday, 18:40", resolved: true, details: "Main distribution bus overload." }
];

const PERF_DATA = [];

const UPTIME_DATA = [
  { name: "Node-01 (CNC Motor)", status: "online", battery: 98, rssi: -62 },
  { name: "Node-02 (HVAC Main)", status: "online", battery: 84, rssi: -71 },
  { name: "Node-03 (Greenhouse A)", status: "online", battery: 91, rssi: -58 },
  { name: "Node-04 (Substation B)", status: "offline", battery: 12, rssi: -94 }
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    muted: "bg-slate-100 text-slate-600 border-slate-200"
  };
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border font-[Inter]", variants[variant], className)}>
    {children}
  </span>;
}
function StatusDot({ status }) {
  const colors = {
    active: "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)]",
    idle: "bg-gray-400",
    error: "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.3)]",
    warning: "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.3)]"
  };
  return <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", colors[status])} />;
}
function Btn({ children, onClick, variant = "primary", className = "", disabled = false, size = "md", style = {} }) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";

  const baseStyle = isPrimary
    ? { backgroundColor: "#2563eb", color: "#ffffff", border: "1px solid #2563eb" }
    : isDanger
      ? { backgroundColor: "#dc2626", color: "#ffffff", border: "1px solid #dc2626" }
      : isSecondary
        ? { backgroundColor: "#ffffff", color: "#2563eb", border: "1px solid #2563eb" }
        : isGhost
          ? { backgroundColor: "transparent", color: "#475569", border: "1px solid transparent" }
          : { backgroundColor: "#ffffff", color: "#334155", border: "1px solid #cbd5e1" };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...style }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm",
        size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-6 py-2.5 text-sm" : "px-4 py-2 text-sm",
        className
      )}
    >
      {children}
    </button>
  );
}
function Input({ label, placeholder, value, onChange, type = "text", className = "" }) {
  return <div className={cn("flex flex-col gap-1.5", className)}>
    {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
  </div>;
}
function Select({ label, options, value, onChange, className = "" }) {
  return <div className={cn("flex flex-col gap-1.5", className)}>
    {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
    >
      {options.map((o) => <option key={o.value} value={o.value} className="bg-white text-slate-800">{o.label}</option>)}
    </select>
  </div>;
}
function Card({ children, className = "" }) {
  return <div className={cn("bg-white border border-slate-200 rounded-xl p-5 shadow-sm", className)}>
    {children}
  </div>;
}
function SectionTitle({ children, sub }) {
  return <div className="mb-5">
    <h2 className="text-foreground font-semibold text-[15px] font-[Outfit]">{children}</h2>
    {sub && <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>}
  </div>;
}
function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: "42px",
        height: "22px",
        backgroundColor: enabled ? "#2563eb" : "#cbd5e1",
        borderRadius: "9999px",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        border: "none",
        outline: "none",
        padding: "0",
        display: "inline-block",
        flexShrink: 0
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: enabled ? "22px" : "2px",
          width: "18px",
          height: "18px",
          backgroundColor: "#ffffff",
          borderRadius: "50%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          transition: "left 0.2s ease"
        }}
      />
    </button>
  );
}
const NAV_ITEMS = [
  { id: "dashboard", label: "Projects", icon: LayoutDashboard, group: "main" },
  { id: "rule-builder", label: "Rule Builder", icon: GitBranch, group: "build" },
  { id: "rule-preview", label: "Rules", icon: Shield, group: "build" },
  { id: "dashboard-builder", label: "Dashboards", icon: Grid, group: "build" },
  { id: "live-monitoring", label: "Live Monitor", icon: Activity, group: "ops" }
];
function SubNavbar({ screen, setScreen }) {
  return (
    <div className="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between overflow-x-auto shrink-0 shadow-2xs">
      <div className="flex items-center gap-3 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              style={
                isActive
                  ? { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
                  : { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap shadow-2xs",
                isActive
                  ? "font-bold text-blue-600 shadow-xs"
                  : "hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
              )}
            >
              <item.icon size={16} style={{ color: isActive ? '#2563eb' : '#64748b' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-6">
        <CreateProductDefintionModal />
      </div>
    </div>
  );
}
function DashboardScreen({
  setScreen,
  projects,
  files,
  setFiles,
  alerts,
  rules
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);

  const fileInputRef = useRef(null);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    setTimeout(() => {
      let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      if (file.size > 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }
      const extension = file.name.split(".").pop() || "unknown";

      const newFile = {
        name: file.name,
        size: sizeStr,
        modified: "Just now",
        type: extension
      };

      setFiles((prev) => [newFile, ...prev]);
      setUploading(false);
    }, 1000);

    e.target.value = ""; // clear
  };

  const handleDownload = (file) => {
    const blob = new Blob([`Mock contents for asset: ${file.name}\nSize: ${file.size}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const stats = [
    { label: "Total Projects", value: projects.length.toString(), delta: `+${projects.filter(p => p.status === 'active').length} active`, icon: FolderOpen, bg: "bg-blue-50 text-blue-600 border border-blue-100" },
    { label: "Active Devices", value: projects.reduce((acc, p) => acc + (p.devices || 0), 0).toString(), delta: "All healthy", icon: Cpu, bg: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
    { label: "Rules Running", value: rules.filter((r) => r.enabled).length.toString(), delta: "Active engine", icon: Shield, bg: "bg-purple-50 text-purple-600 border border-purple-100" },
    { label: "Alerts Today", value: alerts.length.toString(), delta: `${alerts.filter(a => !a.resolved).length} unresolved`, icon: AlertTriangle, bg: "bg-amber-50 text-amber-600 border border-amber-100" }
  ];

  return <div className="p-6 space-y-6">
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      style={{ display: "none" }}
    />

    {/* Stats row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s, i) => <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
        <Card className="flex items-start gap-3.5 p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs", s.bg)}>
            <s.icon size={19} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl font-bold text-slate-900 font-[Outfit] tracking-tight">{s.value}</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">{s.label}</div>
            <div className="text-[11px] font-medium text-slate-400 mt-0.5">{s.delta}</div>
          </div>
        </Card>
      </motion.div>)}
    </div>

    {/* Toolbar */}
    <div className="flex flex-wrap items-center justify-between gap-4 w-full pt-2">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
        <div className="relative flex items-center w-64 shrink-0">
          <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none z-10" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{ backgroundColor: '#ffffff', color: '#000000', paddingLeft: '36px' }}
            className="w-full border border-slate-300 rounded-xl pr-3 text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-2xs h-10 font-[Inter]"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {["all", "active", "warning", "error", "idle"].map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={
                  isActive
                    ? { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
                    : { backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }
                }
                className="px-4 h-10 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer capitalize shadow-2xs hover:bg-slate-100 hover:border-slate-300 flex items-center justify-center whitespace-nowrap"
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>
    </div>

    {/* Project Grid */}
    <div className="grid grid-cols-3 gap-4">
      {filtered.map((project, i) => <motion.div key={project.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
        <div
          className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/30 hover:bg-card/80 transition-all duration-200 group"
          onClick={() => setScreen("live-monitoring")}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <StatusDot status={project.status} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider capitalize font-[JetBrains_Mono]">{project.status}</span>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <MoreHorizontal size={14} className="text-muted-foreground" />
            </button>
          </div>

          <h3 className="text-sm font-semibold text-foreground font-[Outfit] mb-1.5 group-hover:text-primary transition-colors">{project.name}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{project.description}</p>

          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}
            <Badge variant="muted">{project.category}</Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mt-1">
            <div className="flex items-center gap-1.5">
              <Cpu size={12} />
              <span className="font-[JetBrains_Mono]">{project.devices} devices</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} />
              <span>{project.lastModified}</span>
            </div>
          </div>
        </div>
      </motion.div>)}
    </div>

    {/* File Management */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Project Assets</SectionTitle>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm" onClick={handleUploadClick} disabled={uploading}>
            {uploading ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? "Uploading..." : "Upload File"}
          </Btn>
        </div>
      </div>
      <Card className="divide-y divide-border p-0 overflow-hidden">
        {files.map((file, i) => <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors group">
          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
            <FileText size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground font-[JetBrains_Mono] text-xs">{file.name}</div>
            <div className="text-xs text-muted-foreground">{file.size} · Modified {file.modified}</div>
          </div>
          <Badge variant="muted">{file.type}</Badge>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
            <button onClick={() => setViewingFile(file)} className="p-1.5 rounded hover:bg-gray-100 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" title="View Details"><Eye size={13} /></button>
            <button onClick={() => handleDownload(file)} className="p-1.5 rounded hover:bg-gray-100 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" title="Download"><Download size={13} /></button>
            <button onClick={() => handleDeleteFile(file.name)} className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer transition-colors" title="Delete"><Trash2 size={13} /></button>
          </div>
        </div>)}
      </Card>
    </div>

    {/* Viewing File Detail Modal */}
    {viewingFile && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-4 border-b border-border bg-[#EFF6FF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-[#2563EB]" size={16} />
              <span className="font-semibold text-foreground font-[Outfit] text-sm">{viewingFile.name}</span>
            </div>
            <button onClick={() => setViewingFile(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <XCircle size={16} />
            </button>
          </div>
          <div className="p-5 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs border-b border-border pb-3">
              <div>
                <span className="text-muted-foreground block">File Size</span>
                <span className="font-semibold text-foreground">{viewingFile.size}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Modified</span>
                <span className="font-semibold text-foreground">{viewingFile.modified}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Content Preview</span>
              <pre className="bg-slate-50 border border-border rounded p-3 text-[11px] font-[JetBrains_Mono] text-foreground max-h-48 overflow-y-auto leading-relaxed">
                {viewingFile.type === "json" ? `{
  "device": "ESP32-A1",
  "version": "2.0.1",
  "sensors": {
    "temperature": "temp_a1",
    "humidity": "hum_b3"
  }
}` : viewingFile.type === "csv" ? `timestamp,temp,humidity,pressure
1781759800,22.4,58.2,1013.1
1781759802,22.6,58.1,1013.2
1781759804,22.8,58.0,1013.2` : viewingFile.type === "yaml" ? `rules:
  - id: high-temp
    sensor: temp_a1
    operator: >
    value: 75
    actions:
      - alert
      - email` : `[Binary stream or formatted raw source of ${viewingFile.name}]`}
              </pre>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border bg-slate-50/50 flex justify-end gap-2">
            <Btn variant="outline" size="sm" onClick={() => setViewingFile(null)}>Close</Btn>
            <Btn size="sm" onClick={() => { handleDownload(viewingFile); setViewingFile(null); }}>Download File</Btn>
          </div>
        </div>
      </div>
    )}
  </div>;
}
function CreateProjectScreen({ setScreen, setProjects }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "logistics",
    projectType: "bare metal",
    boardType: "STM32 U5",
    feature: "writeCode",
    hardware: "stm32u5",
    tags: ""
  });
  const steps = ["Basic Info", "Configuration", "Tags & Meta", "Review"];
  const categories = [
    { label: "Industrial IoT", value: "industrial" },
    { label: "Environmental", value: "environmental" },
    { label: "Logistics", value: "logistics" },
    { label: "Energy", value: "energy" },
    { label: "Agriculture", value: "agriculture" },
    { label: "Smart Building", value: "building" }
  ];
  const hardwareTypes = [
    { label: "STM32 U5", value: "stm32u5", icon: Cpu },
    { label: "NRF52840", value: "nrf52840", icon: Radio },
    { label: "ESP32", value: "esp32", icon: Cpu },
    { label: "Arduino", value: "arduino", icon: HardDrive },
    { label: "Raspberry Pi", value: "rpi", icon: Server },
    { label: "MQTT Broker", value: "mqtt", icon: Radio },
    { label: "REST API", value: "rest", icon: ExternalLink },
    { label: "Custom Device", value: "custom", icon: Package }
  ];

  const handleCreate = () => {
    const newProject = {
      id: Date.now(),
      name: form.name,
      description: form.description,
      devices: Math.floor(Math.random() * 45) + 5,
      lastModified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "active",
      category: categories.find((c) => c.value === form.category)?.label || "Industrial IoT",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean)
    };
    setProjects((prev) => [...prev, newProject]);
    setScreen("dashboard");
  };

  return <div className="p-6 max-w-3xl">
    {
      /* Step Indicator */
    }
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return <div key={i} className="flex items-center">
          <button
            onClick={() => n < step && setStep(n)}
            className={cn("flex items-center gap-2 cursor-pointer", n > step && "cursor-default")}
          >
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all font-[JetBrains_Mono]",
              done ? "bg-[#EFF6FF] border border-[#2563EB] text-[#2563EB]" : active ? "bg-[#2563EB] text-white shadow-sm" : "bg-secondary text-muted-foreground"
            )}>
              {done ? <Check size={13} /> : n}
            </div>
            <span className={cn("text-xs font-medium hidden sm:block", active ? "text-foreground font-semibold" : done ? "text-secondary-foreground" : "text-muted-foreground")}>{s}</span>
          </button>
          {i < steps.length - 1 && <div className={cn("w-12 h-px mx-3", done ? "bg-[#2563EB]" : "bg-border")} />}
        </div>;
      })}
    </div>

    <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
      {step === 1 && <Card>
        <SectionTitle sub="Enter your project's basic details">Basic Information</SectionTitle>
        <div className="space-y-4">
          <Input label="Project Name *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Smart Factory Monitor" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Describe what this project monitors..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none font-[Inter]"
            />
          </div>
          <Select label="Project Category" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={categories} />

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Project Type *</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center text-sm font-medium text-slate-700 cursor-pointer">
                <input type="radio" name="projectType" value="bare metal" checked={form.projectType === "bare metal"} onChange={(e) => setForm(f => ({ ...f, projectType: e.target.value }))} className="mr-2 text-blue-600 focus:ring-blue-500" />
                Bare Metal
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Board *</label>
            <div className="flex gap-4">
              {["STM32 U5", "NRF52840"].map((b) => (
                <label key={b} className="inline-flex items-center text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="radio" name="boardType" value={b} checked={form.boardType === b} onChange={(e) => setForm(f => ({ ...f, boardType: e.target.value }))} className="mr-2 text-blue-600 focus:ring-blue-500" />
                  {b}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Additional Options</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Write Code", value: "writeCode" },
                { label: "Flow Chart", value: "flowChart" },
                { label: "Block Diagram", value: "blockDiagram" },
                { label: "Simulation", value: "simulation" }
              ].map((opt) => (
                <label key={opt.value} className="inline-flex items-center text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="radio" name="feature" value={opt.value} checked={form.feature === opt.value} onChange={(e) => setForm(f => ({ ...f, feature: e.target.value }))} className="mr-2 text-blue-600 focus:ring-blue-500" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>}

      {step === 2 && <Card>
        <SectionTitle sub="Select your primary hardware type">Hardware Configuration</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {hardwareTypes.map((hw) => <button
            key={hw.value}
            onClick={() => setForm((f) => ({ ...f, hardware: hw.value }))}
            className={cn(
              "p-4 rounded-xl border text-left cursor-pointer transition-all duration-150",
              form.hardware === hw.value ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-secondary/30 hover:border-border/60 hover:bg-secondary/50"
            )}
          >
            <hw.icon size={20} className={form.hardware === hw.value ? "text-primary mb-2" : "text-muted-foreground mb-2"} />
            <div className={cn("text-sm font-semibold font-[Outfit]", form.hardware === hw.value ? "text-foreground" : "text-muted-foreground")}>{hw.label}</div>
          </button>)}
        </div>
      </Card>}

      {step === 3 && <Card>
        <SectionTitle sub="Add tags to help organize and find this project">Tags & Metadata</SectionTitle>
        <div className="space-y-4">
          <Input label="Tags (comma separated)" value={form.tags} onChange={(v) => setForm((f) => ({ ...f, tags: v }))} placeholder="e.g. production, critical, monitored" />
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Preview</label>
            <div className="flex flex-wrap gap-2">
              {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t, i) => <Badge key={i} variant="info">{t}</Badge>)}
            </div>
          </div>
        </div>
      </Card>}

      {step === 4 && <Card>
        <SectionTitle sub="Review your project configuration">Review & Create</SectionTitle>
        <div className="space-y-3">
          {[
            { label: "Project Name", value: form.name },
            { label: "Category", value: categories.find((c) => c.value === form.category)?.label },
            { label: "Hardware", value: hardwareTypes.find((h) => h.value === form.hardware)?.label },
            { label: "Tags", value: form.tags }
          ].map((r, i) => <div key={i} className="flex justify-between py-2.5 border-b border-border last:border-0">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{r.label}</span>
            <span className="text-sm text-foreground font-medium">{r.value}</span>
          </div>)}
        </div>
      </Card>}
    </motion.div>

    <div className="flex items-center justify-between mt-6">
      <Btn variant="ghost" onClick={() => step > 1 ? setStep((s) => s - 1) : setScreen("dashboard")}>
        <ChevronLeft size={15} /> {step > 1 ? "Back" : "Cancel"}
      </Btn>
      <div className="flex gap-3">
        <Btn variant="outline">Save Draft</Btn>
        {step < 4 ? <Btn onClick={() => setStep((s) => s + 1)}>Next <ArrowRight size={15} /></Btn> : <Btn onClick={handleCreate}><Check size={15} /> Create & Continue</Btn>}
      </div>
    </div>
  </div>;
}
function RuleBuilderScreen({
  setScreen,
  rules,
  setRules,
  editingRule,
  setEditingRule
}) {
  const { activeProjectId, activeProductId, user } = useProject();
  const [ruleName, setRuleName] = useState(editingRule ? editingRule.name : "");
  const [ruleDesc, setRuleDesc] = useState(editingRule ? editingRule.description : "");
  const [priority, setPriority] = useState(editingRule ? editingRule.priority : "medium");
  const [combinator, setCombinator] = useState(editingRule ? (editingRule.combinator || "AND") : "AND");
  const [conditions, setConditions] = useState(
    editingRule && editingRule.conditions && editingRule.conditions.length > 0
      ? editingRule.conditions
      : [{ sensor: "temp_a1", operator: ">", value: "" }]
  );
  const [actions, setActions] = useState(
    editingRule && editingRule.actions && editingRule.actions.length > 0
      ? editingRule.actions
      : [{ type: "alert", config: "" }]
  );
  const [saved, setSaved] = useState(false);
  const sensors = [
    { label: "Temperature Sensor A1", value: "temp_a1" },
    { label: "Humidity Sensor B3", value: "hum_b3" },
    { label: "Pressure Sensor C1", value: "pres_c1" },
    { label: "Vibration Sensor D2", value: "vib_d2" },
    { label: "Power Meter E1", value: "power_e1" }
  ];
  const operators = [
    { label: "> Greater than", value: ">" },
    { label: "< Less than", value: "<" },
    { label: "= Equal to", value: "=" },
    { label: ">= Greater or equal", value: ">=" },
    { label: "<= Less or equal", value: "<=" }
  ];
  const actionTypes = [
    { id: "alert", label: "Send Alert", icon: Bell, color: "text-[#2563EB]" },
    { id: "email", label: "Send Email", icon: Mail, color: "text-[#2563EB]" },
    { id: "sms", label: "Send SMS", icon: Smartphone, color: "text-[#2563EB]" },
    { id: "device", label: "Trigger Device", icon: Zap, color: "text-[#2563EB]" },
    { id: "log", label: "Log Event", icon: Terminal, color: "text-[#2563EB]" }
  ];
  const addCondition = () => setConditions((c) => [...c, { sensor: "temp_a1", operator: ">", value: "0" }]);
  const addAction = () => setActions((a) => [...a, { type: "log", config: "" }]);
  const removeCondition = (i) => setConditions((c) => c.filter((_, idx) => idx !== i));
  const removeAction = (i) => setActions((a) => a.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaved(true);

    // Generate text representations
    const firstCond = conditions[0];
    const sensorLabel = sensors.find((s) => s.value === (firstCond?.sensor || ""))?.label || "Unknown Sensor";

    const getUnit = (sensorVal) => {
      if (sensorVal === "temp_a1") return "°C";
      if (sensorVal === "hum_b3") return "%";
      if (sensorVal === "pres_c1") return " hPa";
      if (sensorVal === "vib_d2") return " g";
      if (sensorVal === "power_e1") return " kW";
      return "";
    };

    const conditionStr = conditions
      .map((c) => `${c.operator} ${c.value}${getUnit(c.sensor)}`)
      .join(` ${combinator} `);

    const actionStr = actions
      .map((a) => {
        const at = actionTypes.find((x) => x.id === a.type);
        return at ? at.label : a.type;
      })
      .join(" + ");

    const mapOperator = (op) => {
      if (op === ">") return "GREATER_THAN";
      if (op === "<") return "LESS_THAN";
      if (op === ">=") return "GREATER_EQUAL";
      if (op === "<=") return "LESS_EQUAL";
      return "EQUAL";
    };

    const apiPayload = {
      projectId: activeProjectId || "proj-1",
      productId: activeProductId || "prod-1",
      deviceIds: [],
      ruleName: ruleName || "Untitled Rule",
      priority: (priority || "MEDIUM").toUpperCase(),
      description: ruleDesc || "",
      status: "ACTIVE",
      conditionLogic: combinator,
      conditions: conditions.map((c) => ({
        parameter: c.sensor,
        operator: mapOperator(c.operator),
        value: parseFloat(c.value) || 0
      })),
      actions: actions.map((a) => ({
        type: a.type === "alert" ? "SEND_ALERT" : a.type === "email" ? "SEND_EMAIL" : a.type === "sms" ? "SEND_SMS" : a.type === "device" ? "TRIGGER_DEVICE" : "LOG_EVENT",
        config: typeof a.config === 'object' ? a.config : { details: a.config || "" }
      })),
      createdBy: user?.userId || "user-1"
    };

    let backendRule = null;
    try {
      if (editingRule && (editingRule._id || editingRule.id)) {
        const targetId = editingRule._id || editingRule.id;
        const res = await ruleEngineApi.updateRule(targetId, apiPayload);
        backendRule = res?.data;
      } else {
        const res = await ruleEngineApi.createRule(apiPayload);
        backendRule = res?.data;
      }
    } catch (err) {
      console.warn("[RuleEngineApp] Backend rule save fallback to local state:", err?.message);
    }

    const savedId = backendRule?._id || backendRule?.ruleId || (editingRule ? editingRule.id : Date.now());

    if (editingRule) {
      setRules((prevRules) =>
        prevRules.map((r) =>
          r.id === editingRule.id || r._id === editingRule._id
            ? {
              ...r,
              _id: savedId,
              name: ruleName,
              description: ruleDesc,
              priority,
              sensor: sensorLabel,
              condition: conditionStr,
              combinator,
              action: actionStr,
              conditions,
              actions
            }
            : r
        )
      );
    } else {
      const newRule = {
        id: savedId,
        _id: savedId,
        name: ruleName,
        description: ruleDesc,
        priority,
        sensor: sensorLabel,
        condition: conditionStr,
        combinator,
        action: actionStr,
        status: "active",
        enabled: true,
        triggers: 0,
        lastRun: "Never",
        conditions,
        actions
      };
      setRules((prevRules) => [...prevRules, newRule]);
    }

    setTimeout(() => {
      setSaved(false);
      setEditingRule(null);
      setScreen("rule-preview");
    }, 1000);
  };

  return <div className="p-6 max-w-4xl space-y-5">
    {/* Rule meta */}
    <Card>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Rule Name" value={ruleName} onChange={setRuleName} placeholder="e.g. High Temperature Alert" />
        <Select label="Priority" value={priority} onChange={setPriority} options={[
          { label: "🔴 Critical", value: "critical" },
          { label: "🟠 High", value: "high" },
          { label: "🟡 Medium", value: "medium" },
          { label: "🟢 Low", value: "low" }
        ]} />
        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
          <input value={ruleDesc} onChange={(e) => setRuleDesc(e.target.value)} placeholder="Rule description..." className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
        </div>
      </div>
    </Card>

    {/* IF Block */}
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
            <span className="text-[10px] font-bold text-foreground font-[JetBrains_Mono]">IF</span>
          </div>
          <span className="text-sm font-semibold text-foreground font-[Outfit]">Conditions</span>
          <Select
            value={combinator}
            onChange={setCombinator}
            options={[
              { label: "ALL must match (AND)", value: "AND" },
              { label: "ANY can match (OR)", value: "OR" }
            ]}
            className="w-48 text-xs font-[Inter]"
          />
        </div>
        <Btn variant="ghost" size="sm" onClick={addCondition}><Plus size={13} /> Add Condition</Btn>
      </div>

      <div className="space-y-3">
        {conditions.map((cond, i) => <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          {i > 0 && <div className="text-xs text-[#2563EB] font-bold w-10 text-center font-[JetBrains_Mono]">{combinator}</div>}
          {i === 0 && <div className="w-10" />}
          <div className="flex-1 grid grid-cols-3 gap-3">
            <Select options={sensors} value={cond.sensor} onChange={(v) => setConditions((c) => c.map((x, idx) => idx === i ? { ...x, sensor: v } : x))} />
            <Select options={operators} value={cond.operator} onChange={(v) => setConditions((c) => c.map((x, idx) => idx === i ? { ...x, operator: v } : x))} />
            <Input value={cond.value} onChange={(v) => setConditions((c) => c.map((x, idx) => idx === i ? { ...x, value: v } : x))} placeholder="threshold value" />
          </div>
          <button onClick={() => removeCondition(i)} className="p-1.5 rounded hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <XCircle size={14} />
          </button>
        </motion.div>)}
      </div>
    </Card>

    {/* THEN Block */}
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#2563EB] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white font-[JetBrains_Mono]">THEN</span>
          </div>
          <span className="text-sm font-semibold text-foreground font-[Outfit]">Actions</span>
        </div>
        <Btn variant="ghost" size="sm" onClick={addAction}><Plus size={13} /> Add Action</Btn>
      </div>

      <div className="space-y-3">
        {actions.map((action, i) => <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            {actionTypes.map((at) => <button
              key={at.id}
              onClick={() => setActions((a) => a.map((x, idx) => idx === i ? { ...x, type: at.id } : x))}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer",
                action.type === at.id ? "border-current bg-current/10" : "border-border text-muted-foreground hover:border-border/60",
                action.type === at.id ? at.color : ""
              )}
            >
              <at.icon size={12} />
              {at.label}
            </button>)}
          </div>
          <div className="flex-1">
            <Input value={action.config} onChange={(v) => setActions((a) => a.map((x, idx) => idx === i ? { ...x, config: v } : x))} placeholder="Configuration (target, channel, number...)" />
          </div>
          <button onClick={() => removeAction(i)} className="p-1.5 rounded hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <XCircle size={14} />
          </button>
        </motion.div>)}
      </div>
    </Card>

    {/* Rule Preview summary */}
    <Card className="bg-secondary/30 border-dashed">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Rule Summary</div>
      <div className="font-[JetBrains_Mono] text-sm text-foreground leading-relaxed">
        IF {conditions.map((c, i) => `[${sensors.find((s) => s.value === c.sensor)?.label || c.sensor}] ${c.operator} ${c.value}`).join(` ${combinator} `)}
        <br />
        THEN {actions.map((a) => actionTypes.find((at) => at.id === a.type)?.label || a.type).join(", ")}
      </div>
    </Card>

    <div className="flex justify-between">
      <Btn variant="ghost" onClick={() => {
        setEditingRule(null);
        setScreen("rule-preview");
      }}><ChevronLeft size={15} /> {editingRule ? "Cancel" : "Back"}</Btn>
      <div className="flex gap-3">
        <Btn variant="outline" onClick={() => {
          setEditingRule(null);
          setScreen("rule-preview");
        }}>Save Draft</Btn>
        <Btn onClick={handleSave}>
          {saved ? <><Check size={15} /> Saved!</> : <>Save Rule <ArrowRight size={15} /></>}
        </Btn>
      </div>
    </div>
  </div>;
}
function RulePreviewScreen({ setScreen, rules, setRules, setEditingRule }) {
  const { activeDeviceId } = useProject();
  const [simulating, setSimulating] = useState(false);
  const [simOutput, setSimOutput] = useState([]);
  const [simSensors, setSimSensors] = useState({
    temp: "",
    humidity: "",
    pressure: "",
    vibration: "",
    powerDraw: ""
  });

  const toggleRule = async (rule) => {
    const targetId = rule._id || rule.id;
    const nextEnabled = !rule.enabled;
    try {
      if (nextEnabled) {
        await ruleEngineApi.enableRule(targetId);
      } else {
        await ruleEngineApi.disableRule(targetId);
      }
    } catch (err) {
      console.warn("[RuleEngineApp] Backend toggle rule fallback to local state:", err?.message);
    }
    setRules((rs) => rs.map((r) => r.id === rule.id || r._id === rule._id ? { ...r, enabled: nextEnabled } : r));
  };

  const deleteRule = async (rule) => {
    const targetId = rule._id || rule.id;
    try {
      await ruleEngineApi.deleteRule(targetId);
    } catch (err) {
      console.warn("[RuleEngineApp] Backend delete rule fallback to local state:", err?.message);
    }
    setRules((rs) => rs.filter((r) => r.id !== rule.id && r._id !== targetId));
  };

  const runSim = async () => {
    setSimulating(true);
    setSimOutput([]);

    const sensorPayload = {
      temp: parseFloat(simSensors.temp) || 0,
      humidity: parseFloat(simSensors.humidity) || 0,
      pressure: parseFloat(simSensors.pressure) || 0,
      vibration: parseFloat(simSensors.vibration) || 0,
      powerDraw: parseFloat(simSensors.powerDraw) || 0
    };

    // Attempt backend simulation API call
    const activeRule = rules.find((r) => r.enabled);
    if (activeRule && (activeRule._id || activeRule.id)) {
      try {
        const simRes = await ruleEngineApi.runSimulation({
          ruleId: activeRule._id || activeRule.id,
          deviceId: activeDeviceId || "device-1",
          inputParameters: sensorPayload
        });
        if (simRes && simRes.data) {
          console.log("[RuleEngineApp] Simulation API response:", simRes.data);
        }
      } catch (err) {
        console.warn("[RuleEngineApp] Backend simulation API fallback to dynamic simulation:", err?.message);
      }
    }

    const lines = [];
    const timestamp = new Date().toLocaleTimeString();
    lines.push(`[${timestamp}] Sandbox simulation started.`);
    lines.push(`[${timestamp}] Input payload: Temp=${sensorPayload.temp}°C, Humidity=${sensorPayload.humidity}%, Pressure=${sensorPayload.pressure}hPa, Vibration=${sensorPayload.vibration}g, Power=${sensorPayload.powerDraw}kW.`);

    let activeRulesCount = 0;
    let triggeredCount = 0;

    rules.forEach((rule) => {
      if (!rule.enabled) {
        lines.push(`[${timestamp}] Rule "${rule.name}" is disabled. Skipping.`);
        return;
      }

      activeRulesCount++;
      lines.push(`[${timestamp}] Evaluating rule: "${rule.name}"...`);

      const getSensorLabel = (sensorId) => {
        const map = {
          temp_a1: "Temperature",
          hum_b3: "Humidity",
          pres_c1: "Pressure",
          vib_d2: "Vibration",
          power_e1: "Power"
        };
        return map[sensorId] || "Sensor";
      };

      const getSensorValue = (sensorId, tp) => {
        if (sensorId === "temp_a1") return tp.temp;
        if (sensorId === "hum_b3") return tp.humidity;
        if (sensorId === "pres_c1") return tp.pressure;
        if (sensorId === "vib_d2") return tp.vibration;
        if (sensorId === "power_e1") return tp.powerDraw;
        return 0;
      };

      const results = (rule.conditions || []).map((c) => {
        const val = getSensorValue(c.sensor, sensorPayload);
        const target = parseFloat(c.value);
        let res = false;

        switch (c.operator) {
          case ">": res = val > target; break;
          case "<": res = val < target; break;
          case ">=": res = val >= target; break;
          case "<=": res = val <= target; break;
          case "=":
          case "==": res = val === target; break;
          case "!=": res = val !== target; break;
          default: res = false;
        }

        lines.push(`[${timestamp}]   Condition: ${getSensorLabel(c.sensor)} (${val}) ${c.operator} ${c.value} → ${res ? "TRUE" : "FALSE"}`);
        return res;
      });

      const combinator = rule.combinator || "AND";
      let rulePassed = false;
      if (results.length > 0) {
        if (combinator === "OR") {
          rulePassed = results.some((r) => r === true);
        } else {
          rulePassed = results.every((r) => r === true);
        }
      }

      lines.push(`[${timestamp}]   Logical Combination (${combinator}): ${rulePassed ? "PASSED" : "FAILED"}`);

      if (rulePassed) {
        triggeredCount++;
        lines.push(`[${timestamp}]   ✓ Rule "${rule.name}" triggered!`);
        (rule.actions || []).forEach((a) => {
          lines.push(`[${timestamp}]     Action Executed: ${(a.type || "LOG").toUpperCase()} → ${typeof a.config === 'object' ? JSON.stringify(a.config) : a.config}`);
        });
      }
    });

    lines.push(`[${timestamp}] Simulation completed.`);
    lines.push(`[${timestamp}] Summary: ${activeRulesCount} active rules evaluated, ${triggeredCount} rules triggered.`);

    lines.forEach((line, i) => {
      setTimeout(() => setSimOutput((o) => [...o, line]), i * 150);
    });

    setTimeout(() => setSimulating(false), lines.length * 150 + 100);
  };

  return <div className="p-6 space-y-5">
    {
      /* Rules Table */
    }
    <div className="flex items-center justify-between mb-1">
      <SectionTitle sub={`${rules.filter((r) => r.enabled).length} active rules`}>Rule Engine</SectionTitle>
      <Btn onClick={() => {
        setEditingRule(null);
        setScreen("rule-builder");
      }}><Plus size={14} /> New Rule</Btn>
    </div>

    <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-xs bg-white rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-blue-50/70">
              <th className="px-6 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Rule Name</th>
              <th className="px-6 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Sensor</th>
              <th className="px-6 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Condition</th>
              <th className="px-6 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Triggers</th>
              <th className="px-6 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4 font-semibold text-slate-800 text-sm">{rule.name}</td>
                <td className="px-6 py-4 text-slate-600 font-[JetBrains_Mono] text-xs">{rule.sensor}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold font-[JetBrains_Mono] bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                    {rule.condition}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 text-xs font-medium">{rule.action}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-[JetBrains_Mono] bg-slate-100 text-slate-700">
                    {rule.triggers}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Toggle enabled={rule.enabled} onChange={() => toggleRule(rule)} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setScreen("rule-builder");
                      }}
                      style={{ backgroundColor: '#ffffff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                      className="p-1.5 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors shadow-2xs"
                      title="Edit Rule"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        const newId = rules.length > 0 ? Math.max(...rules.map((r) => typeof r.id === 'number' ? r.id : 0)) + 1 : 1;
                        const duplicatedRule = {
                          ...rule,
                          id: newId,
                          name: `${rule.name} (Copy)`,
                          triggers: 0
                        };
                        setRules([...rules, duplicatedRule]);
                      }}
                      style={{ backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1' }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs"
                      title="Duplicate Rule"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => deleteRule(rule)}
                      style={{ backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5' }}
                      className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors shadow-2xs"
                      title="Delete Rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    {
      /* Simulation Panel */
    }
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold font-[Outfit] text-foreground">Rule Simulation Sandbox</div>
          <div className="text-xs text-muted-foreground">Simulate values for all sensors to evaluate active rules</div>
        </div>
        <Badge variant="info">Sandbox Mode</Badge>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-4 items-end">
        <Input label="Temp (°C)" value={simSensors.temp} onChange={(v) => setSimSensors(s => ({ ...s, temp: v }))} placeholder="22.0" />
        <Input label="Humidity (%)" value={simSensors.humidity} onChange={(v) => setSimSensors(s => ({ ...s, humidity: v }))} placeholder="58.0" />
        <Input label="Pressure (hPa)" value={simSensors.pressure} onChange={(v) => setSimSensors(s => ({ ...s, pressure: v }))} placeholder="1013.0" />
        <Input label="Vibration (g)" value={simSensors.vibration} onChange={(v) => setSimSensors(s => ({ ...s, vibration: v }))} placeholder="0.2" />
        <Input label="Power Draw (kW)" value={simSensors.powerDraw} onChange={(v) => setSimSensors(s => ({ ...s, powerDraw: v }))} placeholder="450.0" />
      </div>

      <div className="flex justify-end mb-4">
        <Btn onClick={runSim} disabled={simulating}>
          {simulating ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
          Run Dynamic Simulation
        </Btn>
      </div>

      <div className="bg-background rounded-lg border border-border p-4 min-h-[160px] font-[JetBrains_Mono] text-xs space-y-1.5 max-h-80 overflow-y-auto">
        {simOutput.length === 0 && !simulating && <div className="text-muted-foreground/50">→ Run simulation to see output...</div>}
        {simOutput.map((line, i) => <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(
          "leading-relaxed",
          line.includes("✓") ? "text-emerald-600 font-bold" : line.includes("TRUE") ? "text-blue-600 font-semibold" : line.includes("FAILED") ? "text-amber-600" : line.includes("PASSED") ? "text-emerald-600 font-medium" : "text-secondary-foreground"
        )}>
          {line}
        </motion.div>)}
        {simulating && <div className="text-primary animate-pulse">▌</div>}
      </div>
    </Card>

    <div className="flex justify-between">
      <Btn variant="ghost" onClick={() => {
        setEditingRule(null);
        setScreen("rule-builder");
      }}><ChevronLeft size={15} /> Back</Btn>
      <Btn onClick={() => setScreen("dashboard-builder")}>Next: Dashboard Builder <ArrowRight size={15} /></Btn>
    </div>
  </div>;
}
function DashboardBuilderScreen({
  setScreen,
  dashboardWidgets,
  setDashboardWidgets
}) {
  const { activeProjectId, activeProductId, activeDeviceId, user } = useProject();
  const [currentDashboardId, setCurrentDashboardId] = useState(null);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const res = await ruleEngineApi.getAllDashboards();
        if (res && res.data && res.data.length > 0) {
          setCurrentDashboardId(res.data[0]._id);
        } else {
          const newDbRes = await ruleEngineApi.createDashboard({
            name: "Main Monitoring Dashboard",
            description: "Auto-generated project dashboard",
            projectId: activeProjectId || "proj-1",
            productId: activeProductId || "prod-1",
            deviceIds: [activeDeviceId || "dev-1"],
            createdBy: user?.userId || "user-1"
          });
          if (newDbRes && newDbRes.data) {
            setCurrentDashboardId(newDbRes.data._id);
          }
        }
      } catch (err) {
        console.warn("[DashboardBuilder] Dashboard init fallback to local:", err?.message);
      }
    };
    initDashboard();
  }, [activeProjectId, activeProductId]);

  const widgetLib = [
    { id: "gauge", label: "Gauge", icon: Gauge, desc: "Radial value display" },
    { id: "line", label: "Line Chart", icon: LineChartIcon, desc: "Time series data" },
    { id: "bar", label: "Bar Chart", icon: BarChart2, desc: "Comparative values" },
    { id: "kpi", label: "KPI Card", icon: TrendingUp, desc: "Single metric" },
    { id: "alerts", label: "Alert Feed", icon: AlertTriangle, desc: "Live alert stream" },
    { id: "device", label: "Device Status", icon: Cpu, desc: "Health overview" },
    { id: "table", label: "Data Table", icon: Table, desc: "Tabular data" }
  ];
  const [selectedId, setSelectedId] = useState(dashboardWidgets[0]?.id || null);
  const [autoGen, setAutoGen] = useState(false);
  const selectedWidget = dashboardWidgets.find((w) => w.id === selectedId) || null;

  const addWidget = async (type) => {
    const title = `My ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    let backendWidgetId = null;

    if (currentDashboardId) {
      try {
        const addRes = await ruleEngineApi.addWidget(currentDashboardId, {
          type: type.toUpperCase() === "KPI" ? "KPI_CARD" : type.toUpperCase() === "LINE" ? "LINE_CHART" : type.toUpperCase() === "BAR" ? "BAR_CHART" : type.toUpperCase(),
          name: title,
          deviceId: activeDeviceId || "dev-1",
          config: { parameter: "temp", unit: "°C", aggregation: "latest", timeRange: "1h", refreshInterval: 5 }
        });
        const wList = addRes?.data?.widgets;
        if (wList && wList.length > 0) {
          backendWidgetId = wList[wList.length - 1]._id;
        }
      } catch (err) {
        console.warn("[DashboardBuilder] Backend add widget fallback to local:", err?.message);
      }
    }

    const newWidget = {
      id: backendWidgetId || `${type}-${Date.now()}`,
      _id: backendWidgetId,
      type,
      title,
      dataSource: "temp",
      refreshRate: "5s",
      showLegend: true,
      alertThreshold: false
    };
    setDashboardWidgets((prev) => [...prev, newWidget]);
    setSelectedId(newWidget.id);
  };

  const handleAutoGen = () => {
    setAutoGen(true);
    setTimeout(() => {
      const allWidgets = widgetLib.map((w, index) => ({
        id: `${w.id}-${Date.now()}-${index}`,
        type: w.id,
        title: `Dynamic ${w.label}`,
        dataSource: "temp",
        refreshRate: "5s",
        showLegend: true,
        alertThreshold: false
      }));
      setDashboardWidgets(allWidgets);
      setSelectedId(allWidgets[0]?.id || null);
      setAutoGen(false);
    }, 1500);
  };
  const widgetColors = {
    gauge: "border-border bg-slate-50/40",
    line: "border-border bg-slate-50/40",
    bar: "border-border bg-slate-50/40",
    kpi: "border-border bg-slate-50/40",
    alerts: "border-border bg-slate-50/40",
    device: "border-border bg-slate-50/40",
    table: "border-border bg-slate-50/40"
  };
  return <div className="p-6 h-full">
    <div className="grid grid-cols-4 gap-5 h-full" style={{ minHeight: "calc(100vh - 200px)" }}>
      {
        /* Widget Library */
      }
      <div className="col-span-1">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Widget Library</SectionTitle>
        </div>
        <div className="space-y-2">
          {widgetLib.map((w) => <div key={w.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-all group cursor-pointer" onClick={() => addWidget(w.id)}>
            <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
              <w.icon size={14} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground font-[Outfit]">{w.label}</div>
              <div className="text-[10px] text-muted-foreground">{w.desc}</div>
            </div>
            <Plus size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>)}
        </div>
        <Btn variant="outline" size="sm" className="w-full mt-3" onClick={handleAutoGen}>
          {autoGen ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Auto-generate
        </Btn>
      </div>

      {
        /* Canvas */
      }
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle sub="Click widgets to configure">Live Preview Canvas</SectionTitle>
          <Badge variant="info">{dashboardWidgets.length} widgets</Badge>
        </div>
        <div className="border border-dashed border-border rounded-xl p-4 min-h-80 grid grid-cols-2 gap-3 content-start">
          {dashboardWidgets.map((w, i) => {
            const widgetTypeInfo = widgetLib.find((x) => x.id === w.type);
            const isSelected = selectedId === w.id;
            return <motion.div
              key={w.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedId(w.id)}
              className={cn(
                "rounded-lg border p-3 cursor-pointer transition-all hover:border-primary/40",
                widgetColors[w.type] || "border-border bg-card",
                isSelected ? "ring-1 ring-primary/40" : ""
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <widgetTypeInfo.icon size={12} className="text-primary" />
                  <span className="text-[11px] font-medium text-foreground font-[Outfit]">{w.title || widgetTypeInfo.label}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDashboardWidgets((prev) => prev.filter((x) => x.id !== w.id));
                    if (isSelected) {
                      setSelectedId(null);
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <XCircle size={12} />
                </button>
              </div>
              <div className="h-10 rounded bg-slate-50/50 flex items-center justify-center">
                <span className="text-[10px] text-secondary-foreground font-[JetBrains_Mono] capitalize">{w.dataSource} ({w.refreshRate})</span>
              </div>
            </motion.div>;
          })}
          {dashboardWidgets.length === 0 && <div className="col-span-2 flex flex-col items-center justify-center py-12 text-muted-foreground/40 gap-2">
            <Grid size={28} />
            <span className="text-xs">Click widgets to add them here</span>
          </div>}
        </div>
      </div>

      {
        /* Config Panel */
      }
      <div className="col-span-1">
        <SectionTitle sub="Widget settings">Configuration</SectionTitle>
        {selectedWidget ? <Card className="space-y-4">
          <div>
            <div className="text-sm font-semibold font-[Outfit] text-foreground mb-1">{widgetLib.find((w) => w.id === selectedWidget.type)?.label}</div>
            <div className="text-xs text-muted-foreground">{widgetLib.find((w) => w.id === selectedWidget.type)?.desc}</div>
          </div>
          <Input
            label="Widget Title"
            value={selectedWidget.title}
            onChange={(v) => setDashboardWidgets((prev) => prev.map((x) => x.id === selectedId ? { ...x, title: v } : x))}
            placeholder="e.g. Temperature (°C)"
          />
          <Select
            label="Data Source"
            value={selectedWidget.dataSource}
            onChange={(v) => setDashboardWidgets((prev) => prev.map((x) => x.id === selectedId ? { ...x, dataSource: v } : x))}
            options={[
              { label: "Temperature Sensor A1", value: "temp" },
              { label: "Humidity Sensor B3", value: "humidity" },
              { label: "Pressure C1", value: "pressure" },
              { label: "Vibration Sensor D2", value: "vibration" }
            ]}
          />
          <Select
            label="Refresh Rate"
            value={selectedWidget.refreshRate}
            onChange={(v) => setDashboardWidgets((prev) => prev.map((x) => x.id === selectedId ? { ...x, refreshRate: v } : x))}
            options={[
              { label: "1 second", value: "1s" },
              { label: "5 seconds", value: "5s" },
              { label: "30 seconds", value: "30s" }
            ]}
          />
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">Show legend</span>
            <Toggle
              enabled={selectedWidget.showLegend}
              onChange={() => setDashboardWidgets((prev) => prev.map((x) => x.id === selectedId ? { ...x, showLegend: !x.showLegend } : x))}
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">Alert threshold line</span>
            <Toggle
              enabled={selectedWidget.alertThreshold}
              onChange={() => setDashboardWidgets((prev) => prev.map((x) => x.id === selectedId ? { ...x, alertThreshold: !x.alertThreshold } : x))}
            />
          </div>
        </Card> : <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 gap-2">
          <Sliders size={24} />
          <span className="text-xs">Select a widget to configure</span>
        </div>}
      </div>
    </div>

    <div className="flex justify-between mt-5">
      <Btn variant="ghost" onClick={() => setScreen("rule-preview")}><ChevronLeft size={15} /> Back</Btn>
      <div className="flex gap-3">
        <Btn variant="outline">Save Dashboard</Btn>
        <Btn onClick={() => setScreen("live-monitoring")}>Start Monitoring <ArrowRight size={15} /></Btn>
      </div>
    </div>
  </div>;
}
function TableWidget({ widget, liveData }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("t");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setPage(1);
  };

  const filtered = liveData.filter((row) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const sourceVal = row[widget.dataSource] !== undefined ? row[widget.dataSource].toFixed(2) : "";
    return row.t.toLowerCase().includes(s) || sourceVal.includes(s);
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (sortField === "t") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      const numA = parseFloat(valA) || 0;
      const numB = parseFloat(valB) || 0;
      return sortAsc ? numA - numB : numB - numA;
    }
  });

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const sourceName = {
    temp: "Temperature",
    humidity: "Humidity",
    pressure: "Pressure",
    vibration: "Vibration",
    powerDraw: "Power Draw"
  }[widget.dataSource] || "Value";

  return (
    <Card className="min-h-[260px] p-0 flex flex-col justify-between overflow-hidden border border-border bg-card col-span-1">
      <div className="px-4 py-2 bg-[#EFF6FF] border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold text-[#2563EB]">{widget.title || `${sourceName} Table`}</span>
        <div className="relative">
          <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search..."
            className="bg-white border border-border rounded px-2 pl-5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
            style={{ width: "90px" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-[#2563EB]">
              <th
                className="px-3 py-1.5 font-semibold cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                onClick={() => handleSort("t")}
              >
                Time {sortField === "t" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                className="px-3 py-1.5 font-semibold text-right cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                onClick={() => handleSort(widget.dataSource)}
              >
                {sourceName} {sortField === widget.dataSource ? (sortAsc ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => {
              const val = row[widget.dataSource];
              return (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-3 py-1.5 text-secondary-foreground font-[JetBrains_Mono]">{row.t}</td>
                  <td className="px-3 py-1.5 text-right font-[JetBrains_Mono] font-semibold text-foreground">
                    {val !== undefined ? val.toFixed(2) : "0.00"}
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={2} className="px-3 py-6 text-center text-muted-foreground/60 italic">
                  No matching data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-1.5 border-t border-border bg-slate-50 flex items-center justify-between text-[10px] text-muted-foreground font-[Inter]">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-1.5 py-0.5 border border-border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-foreground transition-colors cursor-pointer"
          >
            Prev
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-1.5 py-0.5 border border-border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-foreground transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
}

function LiveWidget({ widget, liveData, alerts, devices }) {
  const latest = liveData[liveData.length - 1] || {};
  const val = latest[widget.dataSource] !== undefined ? latest[widget.dataSource] : 0;
  const sourceName = {
    temp: "Temperature",
    humidity: "Humidity",
    pressure: "Pressure",
    vibration: "Vibration",
    powerDraw: "Power Draw"
  }[widget.dataSource] || "Value";

  const unit = {
    temp: "°C",
    humidity: "%",
    pressure: " hPa",
    vibration: " g",
    powerDraw: " kW"
  }[widget.dataSource] || "";

  const min = { temp: 0, humidity: 0, pressure: 900, vibration: 0, powerDraw: 0 }[widget.dataSource] || 0;
  const max = { temp: 100, humidity: 100, pressure: 1100, vibration: 2, powerDraw: 1000 }[widget.dataSource] || 100;
  const percent = Math.min(100, Math.max(0, (val - min) / (max - min) * 100));

  const recentAlerts = alerts.slice(0, 5);

  switch (widget.type) {
    case "kpi":
      return <Card className="flex flex-col justify-between h-40 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
          <span>{widget.title || `${sourceName} KPI`}</span>
          <Badge variant="muted">{widget.dataSource}</Badge>
        </div>
        <div className="my-2">
          <span className="text-3xl font-bold font-[JetBrains_Mono] text-foreground">{val.toFixed(1)}</span>
          <span className="text-sm font-medium text-secondary-foreground ml-1">{unit}</span>
        </div>
        <div className="text-[10px] text-muted-foreground">Live updating...</div>
      </Card>;
    case "gauge":
      return <Card className="flex flex-col justify-between h-40 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
          <span>{widget.title || `${sourceName} Gauge`}</span>
          <Badge variant="muted">Gauge</Badge>
        </div>
        <div className="flex items-center justify-center py-1 relative">
          <svg width="100" height="60" viewBox="0 0 100 60">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e4e4e7" strokeWidth="8" strokeLinecap="round" />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#2563EB"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="125.6"
              strokeDashoffset={125.6 - 125.6 * percent / 100}
            />
          </svg>
          <div className="absolute bottom-1 text-center">
            <span className="text-lg font-bold font-[JetBrains_Mono] text-foreground">{val.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>
          </div>
        </div>
      </Card>;
    case "line":
      return <Card className="h-40 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold mb-1">
          <span>{widget.title || `${sourceName} Trend`}</span>
          <Badge variant="muted">Line Chart</Badge>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveData}>
              <defs>
                <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", fontSize: 10 }} />
              <Area type="monotone" dataKey={widget.dataSource} stroke="#2563EB" strokeWidth={1.5} fill={`url(#grad-${widget.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>;
    case "bar":
      return <Card className="h-40 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold mb-1">
          <span>{widget.title || `${sourceName} Bar`}</span>
          <Badge variant="muted">Bar Chart</Badge>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={liveData.slice(-6)}>
              <XAxis dataKey="t" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e4e4e7", fontSize: 10 }} />
              <Bar dataKey={widget.dataSource} fill="#2563EB" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>;
    case "alerts":
      return <Card className="h-40 p-0 flex flex-col justify-between overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-slate-50">
          <span className="text-xs font-semibold text-foreground">{widget.title || "Alerts Feed"}</span>
          <Badge variant="error">Live</Badge>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border text-[11px] px-2 py-1">
          {recentAlerts.map((a, i) => <div key={i} className="py-1.5 px-2 flex justify-between gap-2">
            <span className="text-secondary-foreground truncate font-[Inter]">{a.message}</span>
            <span className="text-muted-foreground shrink-0 font-[JetBrains_Mono] text-[9px]">{a.time}</span>
          </div>)}
          {recentAlerts.length === 0 && <div className="text-muted-foreground/50 text-center py-8">No alerts active</div>}
        </div>
      </Card>;
    case "device":
      return <Card className="h-40 p-0 flex flex-col justify-between overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-slate-50">
          <span className="text-xs font-semibold text-foreground">{widget.title || "Device Status"}</span>
          <Badge variant="success">Online</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
          {devices.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="font-[JetBrains_Mono] text-foreground font-semibold">{d.name}</span>
              <span className="text-secondary-foreground text-[10px]">{d.uptime}% uptime</span>
            </div>
          ))}
          {devices.length === 0 && <div className="text-muted-foreground/50 text-center py-6">No devices</div>}
        </div>
      </Card>;
    case "table":
      return <TableWidget widget={widget} liveData={liveData} />;
    default:
      return null;
  }
}

function LiveMonitoringScreen({
  setScreen,
  dashboardWidgets,
  liveData,
  alerts,
  devices
}) {
  return <div className="p-5 space-y-4">
    {/* Top bar */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2563EB] shadow-[0_0_6px_rgba(37,99,235,0.8)] animate-pulse" />
          <span className="text-sm font-semibold font-[Outfit] text-foreground">Live Monitoring</span>
        </div>
        <Badge variant="success">Active</Badge>
        <span className="text-xs text-muted-foreground font-[JetBrains_Mono]">Dynamic Dashboard · Connected</span>
      </div>
      <Btn variant="outline" size="sm" onClick={() => setScreen("dashboard-builder")}>
        <Sliders size={13} /> Edit Layout
      </Btn>
    </div>

    {/* Dynamic Widget Grid */}
    <div className="grid grid-cols-3 gap-4">
      {dashboardWidgets.map((widget) => (
        <LiveWidget
          key={widget.id}
          widget={widget}
          liveData={liveData}
          alerts={alerts}
          devices={devices}
        />
      ))}
    </div>
  </div>;
}

const getInitialState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error("Error loading localStorage for key", key, e);
    return fallback;
  }
};

const generateInitialTelemetry = () => {
  const data = [];
  const now = new Date();
  let temp = 45;
  let humidity = 55;
  let pressure = 1013;
  let vibration = 0.15;
  let powerDraw = 350;

  for (let i = 20; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 2000);
    const timeStr = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(t.getSeconds()).padStart(2, "0")}`;
    temp = Math.max(20, Math.min(100, temp + (Math.random() - 0.48) * 3));
    humidity = Math.max(30, Math.min(98, humidity + (Math.random() - 0.5) * 4));
    pressure = Math.max(950, Math.min(1050, pressure + (Math.random() - 0.5) * 3));
    vibration = Math.max(0.01, Math.min(2.0, vibration + (Math.random() - 0.5) * 0.1));
    powerDraw = Math.max(100, Math.min(800, powerDraw + (Math.random() - 0.5) * 20));
    data.push({
      t: timeStr,
      temp: parseFloat(temp.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      pressure: parseFloat(pressure.toFixed(1)),
      vibration: parseFloat(vibration.toFixed(2)),
      powerDraw: parseFloat(powerDraw.toFixed(0))
    });
  }
  return data;
};

const evaluateRuleCondition = (rule, telemetryPoint) => {
  if (!rule.conditions || rule.conditions.length === 0) return false;

  const getSensorValue = (sensorId, tp) => {
    if (sensorId === "temp_a1") return tp.temp;
    if (sensorId === "hum_b3") return tp.humidity;
    if (sensorId === "pres_c1") return tp.pressure;
    if (sensorId === "vib_d2") return tp.vibration;
    if (sensorId === "power_e1") return tp.powerDraw;
    return 0;
  };

  const results = rule.conditions.map((c) => {
    const val = getSensorValue(c.sensor, telemetryPoint);
    const target = parseFloat(c.value);
    if (isNaN(val) || isNaN(target)) return false;

    switch (c.operator) {
      case ">": return val > target;
      case "<": return val < target;
      case ">=": return val >= target;
      case "<=": return val <= target;
      case "=":
      case "==": return val === target;
      case "!=": return val !== target;
      default: return false;
    }
  });

  const combinator = rule.combinator || "AND";
  if (combinator === "OR") {
    return results.some((r) => r === true);
  } else {
    return results.every((r) => r === true);
  }
};

const getSensorDeviceName = (sensorId) => {
  const map = {
    temp_a1: "ESP32-A1",
    hum_b3: "RPi-B3",
    pres_c1: "MQTT-E1",
    vib_d2: "Arduino-D2",
    power_e1: "MQTT-E1"
  };
  return map[sensorId] || "ESP32-A1";
};

const formatAlertMessage = (rule, telemetryPoint) => {
  const getSensorLabel = (sensorId) => {
    const map = {
      temp_a1: "Temperature",
      hum_b3: "Humidity",
      pres_c1: "Pressure",
      vib_d2: "Vibration",
      power_e1: "Power"
    };
    return map[sensorId] || "Sensor";
  };

  const getSensorValue = (sensorId, tp) => {
    if (sensorId === "temp_a1") return tp.temp;
    if (sensorId === "hum_b3") return tp.humidity;
    if (sensorId === "pres_c1") return tp.pressure;
    if (sensorId === "vib_d2") return tp.vibration;
    if (sensorId === "power_e1") return tp.powerDraw;
    return 0;
  };

  const c = rule.conditions[0];
  if (!c) return `${rule.name} triggered`;

  const val = getSensorValue(c.sensor, telemetryPoint).toFixed(1);
  const label = getSensorLabel(c.sensor);
  return `${label} exceeded threshold: reached ${val}`;
};

const formatAlertDate = (date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hrs = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${month} ${day}, ${hrs}:${mins}`;
};

export default function App() {
  const { activeProjectId, activeProductId } = useProject();
  const [screen, setScreen] = useState("dashboard");

  const [projects, setProjects] = useState(() => getInitialState("iot_projects", PROJECTS));
  const [rules, setRules] = useState(() => getInitialState("iot_rules", RULES_DATA.map((r) => ({ ...r, enabled: r.status === "active" }))));
  const [files, setFiles] = useState(() => getInitialState("iot_files", FILES));
  const [alerts, setAlerts] = useState(() => getInitialState("iot_alerts", ALERTS_HISTORY));
  const [devices, setDevices] = useState(() => getInitialState("iot_devices", UPTIME_DATA));
  const [dashboardWidgets, setDashboardWidgets] = useState(() => getInitialState("dashboardWidgets", [
    { id: "gauge-1", type: "gauge", title: "Temperature Gauge", dataSource: "temp", refreshRate: "5s", showLegend: true, alertThreshold: false },
    { id: "line-1", type: "line", title: "Temperature Trend", dataSource: "temp", refreshRate: "5s", showLegend: true, alertThreshold: false },
    { id: "kpi-1", type: "kpi", title: "Humidity Level", dataSource: "humidity", refreshRate: "5s", showLegend: false, alertThreshold: false },
    { id: "alerts-1", type: "alerts", title: "Recent Alerts", dataSource: "temp", refreshRate: "5s", showLegend: false, alertThreshold: false }
  ]));

  const [telemetryHistory, setTelemetryHistory] = useState(() => generateInitialTelemetry());
  const [editingRule, setEditingRule] = useState(null);

  // Sync rules from backend API
  useEffect(() => {
    const fetchBackendRules = async () => {
      try {
        let res;
        if (activeProjectId) {
          res = await ruleEngineApi.getRulesByProject(activeProjectId);
        } else if (activeProductId) {
          res = await ruleEngineApi.getRulesByProduct(activeProductId);
        } else {
          res = await ruleEngineApi.getAllRules();
        }

        const ruleList = res?.data || res;
        if (Array.isArray(ruleList) && ruleList.length > 0) {
          const loaded = ruleList.map((r, i) => ({
            id: r._id || r.ruleId || i + 1,
            _id: r._id || r.ruleId,
            name: r.ruleName || r.name || `Rule ${i + 1}`,
            description: r.description || "",
            priority: (r.priority || "medium").toLowerCase(),
            sensor: r.conditions?.[0]?.parameter || "temp_a1",
            condition: r.conditions ? r.conditions.map(c => `${c.operator} ${c.value}`).join(` ${r.conditionLogic || 'AND'} `) : "",
            combinator: r.conditionLogic || "AND",
            action: r.actions ? r.actions.map(a => a.type).join(" + ") : "",
            status: r.status === "ACTIVE" ? "active" : "disabled",
            enabled: r.status === "ACTIVE",
            triggers: r.triggers || 0,
            lastRun: r.lastRun || "Never",
            conditions: r.conditions || [],
            actions: r.actions || []
          }));
          setRules(loaded);
        }
      } catch (err) {
        console.log("[RuleEngineApp] Backend rules sync:", err?.message || err);
      }
    };
    fetchBackendRules();
  }, [activeProjectId, activeProductId]);

  const rulesRef = useRef(rules);
  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);

  // Telemetry loop
  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date();
      const timeStr = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}:${String(time.getSeconds()).padStart(2, "0")}`;

      setTelemetryHistory((prev) => {
        const last = (prev && prev.length > 0)
          ? prev[prev.length - 1]
          : { temp: 45, humidity: 55, pressure: 1013, vibration: 0.15, powerDraw: 350 };
        const newPoint = {
          t: timeStr,
          temp: Math.max(20, Math.min(100, (last.temp ?? 45) + (Math.random() - 0.48) * 3)),
          humidity: Math.max(30, Math.min(98, (last.humidity ?? 55) + (Math.random() - 0.5) * 4)),
          pressure: Math.max(950, Math.min(1050, (last.pressure ?? 1013) + (Math.random() - 0.5) * 3)),
          vibration: Math.max(0.01, Math.min(2.0, (last.vibration ?? 0.15) + (Math.random() - 0.5) * 0.1)),
          powerDraw: Math.max(100, Math.min(800, (last.powerDraw ?? 350) + (Math.random() - 0.5) * 20))
        };

        // Evaluate rules
        const currentRules = rulesRef.current;
        let triggersCountUpdates = {};
        const triggeredAlerts = [];

        currentRules.forEach((rule) => {
          if (!rule.enabled) return;
          const isTriggered = evaluateRuleCondition(rule, newPoint);
          if (isTriggered) {
            triggersCountUpdates[rule.id] = (rule.triggers || 0) + 1;
            const alertMessage = formatAlertMessage(rule, newPoint);
            triggeredAlerts.push({
              id: Date.now() + Math.random(),
              rule: rule.name,
              device: getSensorDeviceName(rule.conditions[0]?.sensor || ""),
              severity: rule.priority || "medium",
              message: alertMessage,
              time: formatAlertDate(new Date()),
              resolved: false
            });
          }
        });

        if (triggeredAlerts.length > 0) {
          setAlerts((prevAlerts) => [...triggeredAlerts, ...prevAlerts].slice(0, 50));
          setRules((prevRules) =>
            prevRules.map((rule) => {
              if (triggersCountUpdates[rule.id] !== undefined) {
                return {
                  ...rule,
                  triggers: triggersCountUpdates[rule.id],
                  lastRun: "Just now"
                };
              }
              return rule;
            })
          );
        }

        return [...prev.slice(1), newPoint];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("iot_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("iot_rules", JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem("iot_files", JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem("iot_alerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem("iot_devices", JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem("dashboardWidgets", JSON.stringify(dashboardWidgets));
  }, [dashboardWidgets]);

  return <div className="flex flex-col h-full min-h-0 bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
    <SubNavbar screen={screen} setScreen={setScreen} />
    <main className="flex-1 overflow-y-auto">
      <motion.div
        key={screen}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {screen === "dashboard" && (
          <DashboardScreen
            setScreen={setScreen}
            projects={projects}
            files={files}
            setFiles={setFiles}
            alerts={alerts}
            rules={rules}
          />
        )}
        {screen === "create-project" && (
          <CreateProjectScreen
            setScreen={setScreen}
            setProjects={setProjects}
          />
        )}
        {screen === "rule-builder" && (
          <RuleBuilderScreen
            setScreen={setScreen}
            rules={rules}
            setRules={setRules}
            editingRule={editingRule}
            setEditingRule={setEditingRule}
          />
        )}
        {screen === "rule-preview" && (
          <RulePreviewScreen
            setScreen={setScreen}
            rules={rules}
            setRules={setRules}
            setEditingRule={setEditingRule}
          />
        )}
        {screen === "dashboard-builder" && (
          <DashboardBuilderScreen
            setScreen={setScreen}
            dashboardWidgets={dashboardWidgets}
            setDashboardWidgets={setDashboardWidgets}
          />
        )}
        {screen === "live-monitoring" && (
          <LiveMonitoringScreen
            setScreen={setScreen}
            dashboardWidgets={dashboardWidgets}
            liveData={telemetryHistory}
            alerts={alerts}
            devices={devices}
          />
        )}
      </motion.div>
    </main>
  </div>;
}
