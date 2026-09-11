import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';

const INITIAL_WIDGETS = [
  {
    "id": "w-led",
    "type": "switch",
    "title": "LED Control",
    "boundTarget": "LED (GPIO 2)",
    "state": true,
    "color": "#2563eb",
    "visible": true
  }
];

export default function App() {
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [ledState, setLedState] = useState(false);
  const [logs, setLogs] = useState([
    '[' + new Date().toLocaleTimeString() + '] ESP32 Bridge online (Target: COM9)',
    '[' + new Date().toLocaleTimeString() + '] Tap toggle switch to control physical LED'
  ]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-15), '[' + time + '] ' + msg]);
  };

  const sendHardwareCommand = (turnOn) => {
    const isOff = !turnOn;
    const bodyStr = JSON.stringify({
      payload: isOff ? 'LED:0' : 'LED:1',
      SwitchStatus: isOff ? 0 : 1,
      value: turnOn,
      port: 'COM9'
    });

    const bridgeUrls = [
      'http://192.168.0.2:5055/api/action',
      'http://192.168.0.2:5055/setSwitchStatus',
      'http://192.168.0.2:5056/api/action',
      'http://192.168.0.2:5004/setSwitchStatus',
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

  const handleSwitchChange = (val) => {
    setLedState(val);
    addLog('📱 [UI] LED Toggle -> ' + (val ? 'ON (Blinking)' : 'OFF (Stopped)'));
    sendHardwareCommand(val);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>InnoIDE Companion</Text>
          <Text style={styles.projectTitle}>projec-08-09</Text>
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

      <ScrollView contentContainerStyle={styles.scrollBody}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interactive Hardware Controls</Text>
          <Text style={styles.sectionDesc}>Toggle switch controls ESP32-S3 physical LED (COM9)</Text>
        </View>

        <View style={[styles.card, ledState && styles.cardActiveGlow]}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>LED Light Control</Text>
              <Text style={styles.cardTarget}>Hardware Target: GPIO 2 (LED on COM9)</Text>
              <View style={styles.tagRow}>
                <View style={[styles.miniBadge, { backgroundColor: ledState ? '#1e3a8a' : '#334155' }]}>
                  <Text style={[styles.miniBadgeText, { color: ledState ? '#60a5fa' : '#94a3b8' }]}>
                    {ledState ? 'STATE: BLINKING (ON)' : 'STATE: STOPPED (OFF)'}
                  </Text>
                </View>
              </View>
            </View>
            <Switch
              value={ledState}
              onValueChange={handleSwitchChange}
              trackColor={{ false: '#334155', true: '#2563eb' }}
              thumbColor={ledState ? '#ffffff' : '#94a3b8'}
            />
          </View>
        </View>

        {/* Console / Terminal */}
        <View style={styles.consoleContainer}>
          <View style={styles.rowBetween}>
            <Text style={styles.consoleTitle}>Serial & Hardware Log Stream</Text>
            <TouchableOpacity onPress={() => setLogs([])}>
              <Text style={styles.clearLogsText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.consoleScroll}>
            {logs.map((log, idx) => (
              <Text key={idx} style={styles.consoleLine}>{log}</Text>
            ))}
          </ScrollView>
        </View>
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  brandTitle: { fontSize: 10, fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 1 },
  projectTitle: { fontSize: 18, fontWeight: '800', color: '#f8fafc', marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  scrollBody: { padding: 18, gap: 14 },
  sectionHeader: { marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#f8fafc' },
  sectionDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  cardActiveGlow: { borderColor: '#2563eb', backgroundColor: '#101a38' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  cardTarget: { fontSize: 12, color: '#64748b', marginTop: 3 },
  tagRow: { flexDirection: 'row', marginTop: 8 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  miniBadgeText: { fontSize: 10, fontWeight: '800' },
  consoleContainer: {
    backgroundColor: '#090d16',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 10
  },
  consoleTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  clearLogsText: { color: '#38bdf8', fontSize: 11, fontWeight: '700' },
  consoleScroll: { maxHeight: 180, marginTop: 10 },
  consoleLine: { color: '#38bdf8', fontFamily: 'monospace', fontSize: 11, marginVertical: 2 }
});
