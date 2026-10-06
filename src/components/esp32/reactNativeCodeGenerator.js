import JSZip from "jszip";

// React Native Expo App.js & Zip Generator for ESP32 Companion

export const generateReactNativeAppCode = ({
  projectName = "ESP32 Companion",
  widgets = [],
  logicBlocks = [],
  targetSdk = "54.0.0",
  activePort = "COM9",
  companionServerInfo = null
} = {}) => {
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const widgetsJson = JSON.stringify(widgets);
  const logicBlocksJson = JSON.stringify(logicBlocks);

      return `import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';

const INITIAL_WIDGETS = ${widgetsJson};
const INITIAL_LOGIC_BLOCKS = ${logicBlocksJson};

export default function App() {
  const [activeTab, setActiveTab] = useState('controls');
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [rules, setRules] = useState(INITIAL_LOGIC_BLOCKS);
  
  const [widgetStates, setWidgetStates] = useState(() => {
    const initial = {};
    INITIAL_WIDGETS.forEach((w) => {
      if (w.type === 'switch') initial[w.id] = w.state ?? true;
      else if (w.type === 'slider') initial[w.id] = w.value ?? 90;
      else if (w.type === 'gauge') initial[w.id] = w.value ?? 24.3;
      else if (w.type === 'colorpicker') initial[w.id] = w.color ?? '#2563eb';
    });
    return initial;
  });

  const [logs, setLogs] = useState([
    '[' + new Date().toLocaleTimeString() + '] ESP32 Bridge online (Active - Expo SDK ${targetSdk})',
    '[' + new Date().toLocaleTimeString() + '] Loaded ' + INITIAL_WIDGETS.length + ' UI widgets & ' + INITIAL_LOGIC_BLOCKS.length + ' logic rules'
  ]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-15), '[' + time + '] ' + msg]);
  };

  const sendHardwareCommand = (payload, extra) => {
    const cleanPayload = String(payload || '').trim();
    const isOff = cleanPayload === 'LED:0' || cleanPayload === '0' || cleanPayload.toLowerCase().includes('off');
    const statusNum = isOff ? 0 : 1;
    const bodyStr = JSON.stringify({
      payload: cleanPayload || (isOff ? 'LED:0' : 'LED:1'),
      SwitchStatus: statusNum,
      value: !isOff,
      port: '${activePort}',
      ...(extra || {})
    });

    const hostIp = '${companionServerInfo?.ip || "192.168.0.2"}';
    const bridgeUrls = [
      'http://' + hostIp + ':5055/api/action',
      'http://' + hostIp + ':5055/setSwitchStatus',
      'http://' + hostIp + ':5056/api/action',
      'http://' + hostIp + ':5004/setSwitchStatus',
      'http://localhost:5055/api/action',
      'http://localhost:5055/setSwitchStatus',
      'http://localhost:5056/api/action',
      'http://localhost:5004/setSwitchStatus'
    ];

    bridgeUrls.forEach((url) => {
      try {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).then((res) => {
          if (res && res.ok) {
            addLog('📡 [HARDWARE] ' + (isOff ? 'LED Stopped (OFF)' : 'LED Blinking (ON)'));
          }
        }).catch(() => {});
      } catch (e) {}
    });
  };

  const evaluateAndTriggerRule = (ruleId, triggerEvent, triggerValue, triggerName) => {
    setRules((prevRules) =>
      prevRules.map((rule) => {
        if (rule.id !== ruleId && ruleId !== 'all') return rule;
        if (!rule.enabled) return rule;

        let passed = true;
        if (rule.condition && rule.condition.includes('>')) {
          const numMatch = rule.condition.match(/([0-9.]+)/);
          if (numMatch && typeof triggerValue === 'number') {
            passed = triggerValue > parseFloat(numMatch[1]);
          }
        }

        if (passed) {
          const payloadResolved = (rule.payload || '')
            .replace('{state}', triggerValue ? '1' : '0')
            .replace('{value}', String(triggerValue));

          addLog('⚡ [LOGIC] "' + rule.name + '" triggered -> TX: ' + payloadResolved + ' to ' + (rule.targetHardware || 'Hardware'));
          sendHardwareCommand(payloadResolved);
          
          return {
            ...rule,
            executionCount: (rule.executionCount || 0) + 1,
            lastTriggered: new Date().toLocaleTimeString()
          };
        }
        return rule;
      })
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setWidgetStates((prev) => {
        const next = { ...prev };
        INITIAL_WIDGETS.filter((w) => w.type === 'gauge').forEach((w) => {
          const current = next[w.id] ?? 24.3;
          const delta = (Math.random() - 0.5) * 0.6;
          const updated = parseFloat(Math.max(w.min || 0, Math.min(w.max || 50, current + delta)).toFixed(1));
          next[w.id] = updated;

          rules.forEach((rule) => {
            if (rule.triggerWidgetId === w.id || rule.triggerName === w.title) {
              evaluateAndTriggerRule(rule.id, 'sensor_update', updated, w.title);
            }
          });
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [rules]);

  const handleSwitchChange = (widgetId, val, widgetTitle) => {
    setWidgetStates((prev) => ({ ...prev, [widgetId]: val }));
    addLog('📱 [UI] ' + widgetTitle + ' -> ' + (val ? 'ON (Blinking)' : 'OFF (Stopped)'));
    sendHardwareCommand(val ? 'LED:1' : 'LED:0');
    
    rules.forEach((rule) => {
      if (rule.triggerWidgetId === widgetId || rule.triggerName === widgetTitle) {
        evaluateAndTriggerRule(rule.id, 'on_toggle', val, widgetTitle);
      }
    });
  };

  const handleSliderChange = (widgetId, delta, min, max, widgetTitle) => {
    const current = widgetStates[widgetId] ?? 90;
    const next = Math.max(min, Math.min(max, current + delta));
    setWidgetStates((prev) => ({ ...prev, [widgetId]: next }));
    addLog('📱 [UI] ' + widgetTitle + ' -> ' + next + '°');

    rules.forEach((rule) => {
      if (rule.triggerWidgetId === widgetId || rule.triggerName === widgetTitle) {
        evaluateAndTriggerRule(rule.id, 'on_change', next, widgetTitle);
      }
    });
  };

  const handleButtonClick = (widget) => {
    addLog('📱 [UI] Button Pressed: "' + widget.title + '"');
    rules.forEach((rule) => {
      if (rule.triggerWidgetId === widget.id || rule.triggerName === widget.title) {
        evaluateAndTriggerRule(rule.id, 'on_press', 1, widget.title);
      }
    });
    Alert.alert('Hardware Command Transmitted', 'Dispatched ' + (widget.action || 'TRIGGER') + ' to ' + (widget.boundTarget || 'GPIO'));
  };

  const toggleRuleEnabled = (ruleId) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const testTriggerRuleManually = (rule) => {
    evaluateAndTriggerRule(rule.id, 'manual_test', 1, rule.triggerName);
    Alert.alert('Logic Block Executed', 'Triggered: ' + rule.name + '\\nPayload: ' + rule.payload + '\\nTarget: ' + rule.targetHardware);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>InnoIDE Companion • SDK ${targetSdk}</Text>
          <Text style={styles.projectTitle}>${projectName}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.statusPill, { backgroundColor: deviceConnected ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }]}
          onPress={() => setDeviceConnected(!deviceConnected)}
        >
          <View style={[styles.statusDot, { backgroundColor: deviceConnected ? '#22c55e' : '#ef4444' }]} />
          <Text style={[styles.statusText, { color: deviceConnected ? '#4ade80' : '#f87171' }]}>
            {deviceConnected ? 'ESP32 Linked' : 'Disconnected'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3-Way Segmented Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'controls' && styles.tabButtonActive]}
          onPress={() => setActiveTab('controls')}
        >
          <Text style={[styles.tabText, activeTab === 'controls' && styles.tabTextActive]}>
            🎛️ Controls
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'logic' && styles.tabButtonActive]}
          onPress={() => setActiveTab('logic')}
        >
          <Text style={[styles.tabText, activeTab === 'logic' && styles.tabTextActive]}>
            ⚡ Logic & Rules ({rules.filter(r => r.enabled).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'hardware' && styles.tabButtonActive]}
          onPress={() => setActiveTab('hardware')}
        >
          <Text style={[styles.tabText, activeTab === 'hardware' && styles.tabTextActive]}>
            📡 Terminal
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {/* TAB 1: UI CONTROLS */}
        {activeTab === 'controls' && (
          <View style={styles.contentGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Interactive Hardware Controls</Text>
              <Text style={styles.sectionDesc}>Direct telemetry and real-time pin actuation</Text>
            </View>

            {INITIAL_WIDGETS.filter(w => w.visible !== false).length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Text style={{ fontSize: 24, marginBottom: 8 }}>📱</Text>
                <Text style={styles.cardTitle}>No Components Added</Text>
                <Text style={[styles.cardTarget, { textAlign: 'center', marginTop: 4 }]}>
                  Add UI components in InnoIDE App Designer to control hardware from this app.
                </Text>
              </View>
            ) : (
              INITIAL_WIDGETS.filter(w => w.visible !== false).map((w) => {
              if (w.type === 'switch') {
                const isOn = widgetStates[w.id] ?? true;
                return (
                  <View key={w.id} style={[styles.card, isOn && styles.cardActiveGlow]}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{w.title}</Text>
                        <Text style={styles.cardTarget}>Pin: {w.boundTarget || 'GPIO 2 (LED)'}</Text>
                        <View style={styles.tagRow}>
                          <View style={[styles.miniBadge, { backgroundColor: isOn ? '#1e3a8a' : '#334155' }]}>
                            <Text style={[styles.miniBadgeText, { color: isOn ? '#60a5fa' : '#94a3b8' }]}>
                              {isOn ? 'STATE: HIGH (ON)' : 'STATE: LOW (OFF)'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Switch
                        value={isOn}
                        onValueChange={(val) => handleSwitchChange(w.id, val, w.title)}
                        trackColor={{ false: '#334155', true: w.color || '#2563eb' }}
                        thumbColor={isOn ? '#ffffff' : '#94a3b8'}
                      />
                    </View>
                  </View>
                );
              }

              if (w.type === 'slider') {
                const val = widgetStates[w.id] ?? (w.value || 90);
                const min = w.min || 0;
                const max = w.max || 180;
                const pct = Math.round(((val - min) / (max - min)) * 100);
                return (
                  <View key={w.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={styles.cardTitle}>{w.title}</Text>
                        <Text style={styles.cardTarget}>PWM Target: {w.boundTarget || 'GPIO 4 (Servo)'}</Text>
                      </View>
                      <Text style={[styles.metricBig, { color: w.color || '#a855f7' }]}>
                        {val}{w.unit || '°'}
                      </Text>
                    </View>
                    <View style={styles.sliderControlRow}>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => handleSliderChange(w.id, -10, min, max, w.title)}>
                        <Text style={styles.stepBtnText}>-10°</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => handleSliderChange(w.id, -1, min, max, w.title)}>
                        <Text style={styles.stepBtnText}>-1°</Text>
                      </TouchableOpacity>
                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: pct + '%', backgroundColor: w.color || '#a855f7' }]} />
                      </View>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => handleSliderChange(w.id, 1, min, max, w.title)}>
                        <Text style={styles.stepBtnText}>+1°</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => handleSliderChange(w.id, 10, min, max, w.title)}>
                        <Text style={styles.stepBtnText}>+10°</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              if (w.type === 'gauge') {
                const val = widgetStates[w.id] ?? (w.value || 24.3);
                const isHigh = val > 30.0;
                return (
                  <View key={w.id} style={[styles.card, isHigh && styles.cardWarningGlow]}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={styles.cardTitle}>{w.title}</Text>
                        <Text style={styles.cardTarget}>Source: {w.boundTarget || 'ADC Telemetry'}</Text>
                      </View>
                      <View style={[styles.liveTag, isHigh && { backgroundColor: '#7f1d1d' }]}>
                        <Text style={[styles.liveTagText, isHigh && { color: '#fca5a5' }]}>
                          {isHigh ? '⚠️ THRESHOLD EXCEEDED' : '● LIVE ADC'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.gaugeValueBox}>
                      <Text style={[styles.gaugeBigValue, { color: isHigh ? '#ef4444' : '#38bdf8' }]}>
                        {val}{w.unit || '°C'}
                      </Text>
                      <Text style={styles.gaugeSubText}>
                        Range: {w.min || 0} - {w.max || 50}{w.unit || '°C'} (Guard Threshold: 30°C)
                      </Text>
                    </View>
                  </View>
                );
              }

              if (w.type === 'button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#ea580c' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>🚨 {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Target: {w.boundTarget || 'GPIO 5 (Buzzer)'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'top_button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#2563eb' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>▲ {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Forward Pulse → {w.boundTarget || 'GPIO 13'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'bottom_button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#0284c7' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>▼ {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Reverse Pulse → {w.boundTarget || 'GPIO 14'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'left_button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#7c3aed' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>◀ {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Steer Left → {w.boundTarget || 'GPIO 12'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'right_button') {
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.actionButton, { backgroundColor: w.color || '#9333ea' }]}
                    onPress={() => handleButtonClick(w)}
                  >
                    <Text style={styles.actionBtnText}>▶ {w.title}</Text>
                    <Text style={styles.actionBtnSub}>Steer Right → {w.boundTarget || 'GPIO 15'}</Text>
                  </TouchableOpacity>
                );
              }

              if (w.type === 'dpad') {
                return (
                  <View key={w.id} style={[styles.card, { alignItems: 'center' }]}>
                    <Text style={[styles.cardTitle, { marginBottom: 8 }]}>🕹️ {w.title}</Text>
                    <TouchableOpacity
                      style={[styles.stepBtn, { width: 60, height: 38, marginBottom: 4 }]}
                      onPress={() => handleButtonClick({ ...w, title: 'Top (Forward)', boundTarget: 'GPIO 13' })}
                    >
                      <Text style={styles.stepBtnText}>▲</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
                      <TouchableOpacity
                        style={[styles.stepBtn, { width: 60, height: 38 }]}
                        onPress={() => handleButtonClick({ ...w, title: 'Left', boundTarget: 'GPIO 12' })}
                      >
                        <Text style={styles.stepBtnText}>◀</Text>
                      </TouchableOpacity>
                      <View style={[styles.stepBtn, { width: 60, height: 38, backgroundColor: '#0f172a' }]}>
                        <Text style={styles.stepBtnText}>●</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.stepBtn, { width: 60, height: 38 }]}
                        onPress={() => handleButtonClick({ ...w, title: 'Right', boundTarget: 'GPIO 15' })}
                      >
                        <Text style={styles.stepBtnText}>▶</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[styles.stepBtn, { width: 60, height: 38, marginTop: 4 }]}
                      onPress={() => handleButtonClick({ ...w, title: 'Bottom (Reverse)', boundTarget: 'GPIO 14' })}
                    >
                      <Text style={styles.stepBtnText}>▼</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              if (w.type === 'device_card') {
                return (
                  <View key={w.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <View style={styles.rowAlign}>
                        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#1e3a8a', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 16 }}>📡</Text>
                        </View>
                        <View>
                          <Text style={styles.cardTitle}>{w.title || 'ESP32 Dev Board'}</Text>
                          <Text style={{ fontSize: 11, color: '#4ade80', fontWeight: '700', marginTop: 2 }}>● Online & Connected</Text>
                        </View>
                      </View>
                      <View style={{ backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ color: '#38bdf8', fontSize: 10, fontWeight: '800' }}>WIFI 100%</Text>
                      </View>
                    </View>
                  </View>
                );
              }

              if (w.type === 'label') {
                return (
                  <View key={w.id} style={[styles.card, { paddingVertical: 12 }]}>
                    <Text style={[styles.cardTitle, { color: w.color || '#f8fafc' }]}>{w.title}</Text>
                    {w.boundTarget && <Text style={styles.cardTarget}>{w.boundTarget}</Text>}
                  </View>
                );
              }

              if (w.type === 'textfield') {
                return (
                  <View key={w.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{w.title}</Text>
                    <View style={{ backgroundColor: '#090d16', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#1e293b' }}>
                      <Text style={{ color: '#94a3b8', fontSize: 12 }}>{w.placeholder || 'Text input field...'}</Text>
                    </View>
                  </View>
                );
              }

              if (w.type === 'progress') {
                return (
                  <View key={w.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardTitle}>{w.title}</Text>
                      <Text style={{ color: '#38bdf8', fontSize: 12, fontWeight: '800' }}>75%</Text>
                    </View>
                    <View style={[styles.progressContainer, { marginTop: 10 }]}>
                      <View style={[styles.progressBar, { width: '75%', backgroundColor: '#38bdf8' }]} />
                    </View>
                  </View>
                );
              }

              return null;
            })
          )}
          </View>
        )}

        {/* TAB 2: FUNCTIONAL LOGIC & RULES */}
        {activeTab === 'logic' && (
          <View style={styles.contentGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚡ Functional Logic Engine</Text>
              <Text style={styles.sectionDesc}>Autonomous trigger-action rules linked to hardware pins</Text>
            </View>

            {rules.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Text style={{ fontSize: 24, marginBottom: 8 }}>⚡</Text>
                <Text style={styles.cardTitle}>No Automation Rules</Text>
                <Text style={[styles.cardTarget, { textAlign: 'center', marginTop: 4 }]}>
                  Configure automation rules in InnoIDE App Designer.
                </Text>
              </View>
            ) : (
              rules.map((rule) => {
              return (
                <View key={rule.id} style={[styles.logicCard, !rule.enabled && { opacity: 0.6 }]}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.rowAlign}>
                        <Text style={styles.logicRuleName}>{rule.name}</Text>
                        <View style={[styles.ruleStatusPill, { backgroundColor: rule.enabled ? '#064e3b' : '#334155' }]}>
                          <Text style={[styles.ruleStatusText, { color: rule.enabled ? '#34d399' : '#94a3b8' }]}>
                            {rule.enabled ? 'ACTIVE' : 'PAUSED'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.logicTarget}>Target: {rule.targetHardware || 'Hardware Pin'}</Text>
                    </View>
                    <Switch
                      value={rule.enabled}
                      onValueChange={() => toggleRuleEnabled(rule.id)}
                      trackColor={{ false: '#334155', true: '#10b981' }}
                    />
                  </View>

                  <View style={styles.logicDetailBox}>
                    <View style={styles.logicRow}>
                      <Text style={styles.logicLabel}>🔄 Trigger:</Text>
                      <Text style={styles.logicVal}>{rule.triggerName} ({rule.event})</Text>
                    </View>
                    <View style={styles.logicRow}>
                      <Text style={styles.logicLabel}>⚖️ Condition:</Text>
                      <Text style={[styles.logicVal, { color: '#fbbf24' }]}>{rule.condition || 'Always'}</Text>
                    </View>
                    <View style={styles.logicRow}>
                      <Text style={styles.logicLabel}>🚀 Action:</Text>
                      <Text style={[styles.logicVal, { color: '#38bdf8' }]}>{rule.action}</Text>
                    </View>
                    <View style={styles.logicRow}>
                      <Text style={styles.logicLabel}>📦 Payload:</Text>
                      <Text style={styles.logicCode}>{rule.payload}</Text>
                    </View>
                  </View>

                  <View style={styles.logicFooter}>
                    <Text style={styles.logicExecutionText}>
                      Executions: {rule.executionCount || 0} {rule.lastTriggered ? ('• Last: ' + rule.lastTriggered) : ''}
                    </Text>
                    <TouchableOpacity
                      style={styles.testRunBtn}
                      onPress={() => testTriggerRuleManually(rule)}
                    >
                      <Text style={styles.testRunBtnText}>▶ Test Trigger</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          </View>
        )}

        {/* TAB 3: HARDWARE PIN MAP & TERMINAL */}
        {activeTab === 'hardware' && (
          <View style={styles.contentGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📡 Pin Mapping & Serial Logs</Text>
              <Text style={styles.sectionDesc}>Live telemetry and hardware communication</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ESP32 GPIO Assignments</Text>
              {INITIAL_WIDGETS.filter(w => w.boundTarget && w.type !== 'device_card').length > 0 ? (
                INITIAL_WIDGETS.filter(w => w.boundTarget && w.type !== 'device_card').map((w) => {
                  const pinMatch = (w.boundTarget || '').match(/GPIO\\s*\\d+/i);
                  return (
                    <View key={w.id} style={styles.pinTableRow}>
                      <Text style={styles.pinCode}>{pinMatch ? pinMatch[0].toUpperCase() : 'PIN'}</Text>
                      <Text style={styles.pinDesc}>{w.title} ({w.boundTarget})</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.pinTableRow}>
                  <Text style={styles.pinCode}>GPIO 2</Text>
                  <Text style={styles.pinDesc}>LED Output (Digital Out)</Text>
                </View>
              )}
            </View>

            <View style={styles.consoleContainer}>
              <View style={styles.rowBetween}>
                <Text style={styles.consoleTitle}>Serial & Event Stream</Text>
                <TouchableOpacity onPress={() => setLogs([])}>
                  <Text style={styles.clearLogsText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.consoleScroll} nestedScrollEnabled>
                {logs.map((log, idx) => (
                  <Text key={idx} style={styles.consoleLine}>{log}</Text>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  brandTitle: { fontSize: 11, fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 1 },
  projectTitle: { fontSize: 18, fontWeight: '800', color: '#f8fafc', marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4
  },
  tabButtonActive: {
    backgroundColor: '#1e293b',
    borderBottomWidth: 2,
    borderColor: '#38bdf8'
  },
  tabText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#f8fafc' },
  scrollBody: { padding: 16, paddingBottom: 50 },
  contentGroup: { gap: 14 },
  sectionHeader: { marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#f1f5f9' },
  sectionDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  cardActiveGlow: {
    borderColor: '#2563eb',
    backgroundColor: '#101a38'
  },
  cardWarningGlow: {
    borderColor: '#ef4444',
    backgroundColor: '#261214'
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowAlign: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#f8fafc' },
  cardTarget: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  tagRow: { flexDirection: 'row', marginTop: 8 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  miniBadgeText: { fontSize: 10, fontWeight: '800' },
  metricBig: { fontSize: 20, fontWeight: '900' },
  sliderControlRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 },
  stepBtn: { backgroundColor: '#1e293b', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8 },
  stepBtnText: { color: '#f8fafc', fontWeight: '800', fontSize: 11 },
  progressContainer: { flex: 1, height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  liveTag: { backgroundColor: '#082f49', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveTagText: { color: '#38bdf8', fontSize: 10, fontWeight: '800' },
  gaugeValueBox: { alignItems: 'center', paddingVertical: 12 },
  gaugeBigValue: { fontSize: 36, fontWeight: '900' },
  gaugeSubText: { fontSize: 11, color: '#64748b', marginTop: 4 },
  actionButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowOpacity: 0.2,
    elevation: 3
  },
  actionBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  actionBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 4, fontWeight: '600' },
  logicCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981'
  },
  logicRuleName: { fontSize: 15, fontWeight: '800', color: '#f8fafc' },
  logicTarget: { fontSize: 12, color: '#64748b', marginTop: 2 },
  ruleStatusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ruleStatusText: { fontSize: 9, fontWeight: '800' },
  logicDetailBox: {
    backgroundColor: '#090d16',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    gap: 6
  },
  logicRow: { flexDirection: 'row', alignItems: 'center' },
  logicLabel: { fontSize: 11, color: '#64748b', width: 85, fontWeight: '700' },
  logicVal: { fontSize: 11, color: '#e2e8f0', fontWeight: '600', flex: 1 },
  logicCode: { fontSize: 11, color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' },
  logicFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  logicExecutionText: { fontSize: 11, color: '#64748b' },
  testRunBtn: { backgroundColor: '#1e293b', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 8 },
  testRunBtnText: { color: '#38bdf8', fontSize: 11, fontWeight: '800' },
  pinTableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1e293b' },
  pinCode: { color: '#38bdf8', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' },
  pinDesc: { color: '#94a3b8', fontSize: 12 },
  consoleContainer: {
    backgroundColor: '#090d16',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  consoleTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  clearLogsText: { color: '#38bdf8', fontSize: 11, fontWeight: '700' },
  consoleScroll: { maxHeight: 180, marginTop: 10 },
  consoleLine: { color: '#38bdf8', fontFamily: 'monospace', fontSize: 11, marginVertical: 2 }
});
`;
};

export const exportExpoProjectZip = async (firstArg, secondArg) => {
  const options = (firstArg && typeof firstArg === "object" && !firstArg.file && !secondArg)
    ? firstArg
    : (secondArg || {});
  const ZipClass = (typeof firstArg === "function") ? firstArg : JSZip;
  const {
    projectName = "ESP32 Companion",
    widgets = [],
    logicBlocks = [],
    expoSdkVersion = "54.0.0",
    toast = null
  } = options;
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const zip = new ZipClass();

  // 1. App.js
  zip.file("App.js", generateReactNativeAppCode({ projectName, widgets, logicBlocks, targetSdk: expoSdkVersion }));

  // 2. app.json
  const appJsonContent = JSON.stringify(
    {
      expo: {
        name: projectName,
        slug: slug,
        version: "1.0.0",
        sdkVersion: expoSdkVersion,
        orientation: "portrait",
        userInterfaceStyle: "light",
        ios: {
          supportsTablet: true,
          bundleIdentifier: `com.innotrat.${slug}`
        },
        android: {
          package: `com.innotrat.${slug}`,
          adaptiveIcon: {
            backgroundColor: "#ffffff"
          }
        },
        extra: {
          eas: {
            projectId: "innotrat-generated"
          }
        }
      }
    },
    null,
    2
  );
  zip.file("app.json", appJsonContent);

  // 3. package.json
  const packageJsonContent = JSON.stringify(
    {
      name: slug,
      version: "1.0.0",
      main: "node_modules/expo/AppEntry.js",
      scripts: {
        start: "expo start",
        android: "expo start --android",
        ios: "expo start --ios",
        web: "expo start --web"
      },
      dependencies: {
        expo: `~${expoSdkVersion || "54.0.0"}`,
        "expo-status-bar": "~2.0.0",
        react: "18.3.1",
        "react-native": "0.76.6"
      },
      devDependencies: {
        "@babel/core": "^7.20.0",
        "babel-preset-expo": "~54.0.0"
      },
      private: true
    },
    null,
    2
  );
  zip.file("package.json", packageJsonContent);

  // 4. babel.config.js
  const babelContent = `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};`;
  zip.file("babel.config.js", babelContent);

  // 5. README.md
  const readmeContent = `# ${projectName} - React Native Companion App (Expo Go)

Generated automatically by **InnoIDE App Companion Studio**.

## 🚀 How to Run in Expo Go

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the Expo development server**:
   \`\`\`bash
   npx expo start
   \`\`\`

3. **Open on your mobile device**:
   - **Android**: Open the **Expo Go** app and tap **"Scan QR Code"**.
   - **iOS**: Open the standard **Camera** app, scan the terminal QR code, and tap the prompt to open in **Expo Go**.
`;
  zip.file("README.md", readmeContent);

  // 6. Schema JSON
  zip.file("companion-schema.json", JSON.stringify({ projectName, widgets, logicBlocks }, null, 2));

  try {
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-react-native-expo.zip`;
    a.click();
    URL.revokeObjectURL(url);
    if (toast) {
      toast({
        title: "Expo Go React Native App Exported!",
        description: `Downloaded ${slug}-react-native-expo.zip (includes App.js, package.json, app.json).`,
        status: "success",
        duration: 4000,
        isClosable: true
      });
    }
  } catch (err) {
    if (toast) {
      toast({ title: "Export Error", description: err.message, status: "error", duration: 3000 });
    }
  }
};
