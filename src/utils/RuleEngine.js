/**
 * Simple Rule Engine
 * 
 * Evaluates data against a set of rules.
 * 
 * Rule Structure:
 * {
 *   id: string,
 *   name: string,
 *   conditions: {
 *     all: [ // AND logic
 *       { fact: string, operator: string, value: any }
 *     ],
 *     any: [ // OR logic (optional implementation)
 *       { fact: string, operator: string, value: any }
 *     ]
 *   },
 *   event: {
 *     type: string,
 *     message: string,
 *     severity: 'info' | 'warning' | 'critical'
 *   }
 * }
 */

// ============================================
// DEVICE TRIP STATES
// ============================================
export const DeviceStates = {
    TRIP_IDLE: 'TRIP_IDLE',
    TRIP_PENDING: 'TRIP_PENDING',
    TRIP_ACTIVE: 'TRIP_ACTIVE',
    TRIP_PAUSED: 'TRIP_PAUSED'
};

// ============================================
// DEVICE LIFECYCLE STATES (Presales/Factory to Customer)
// ============================================
/**
 * Device lifecycle states for CVIP provisioning flow:
 * FACTORY → CONNECTING → TOKEN_RECEIVED → CERT_CREATION → 
 * RECONNECTING → PROVISIONED → AUTHORIZED → CUSTOMER
 */
export const DeviceLifecycleStates = {
    FACTORY: 'FACTORY',                    // Initial state after manufacturing
    CONNECTING: 'CONNECTING',              // Connecting to CVIP with common certs
    TOKEN_RECEIVED: 'TOKEN_RECEIVED',      // Access token received from CVIP
    CERT_CREATION: 'CERT_CREATION',        // Creating device-specific certificates
    RECONNECTING: 'RECONNECTING',          // Reconnecting with device certificates
    PROVISIONED: 'PROVISIONED',            // Device joined CVIP, registered
    AUTHORIZED: 'AUTHORIZED',              // CVIP authorized the device
    CUSTOMER: 'CUSTOMER'                   // Device activated for customer use
};

// ============================================
// DEVICE INTERNAL VARIABLES
// ============================================
export const DeviceVariables = [
    // Trip-related variables
    {
        name: 'tripStartTime',
        description: 'Timestamp when trip started',
        type: 'timestamp',
        defaultValue: null,
        category: 'trip'
    },
    {
        name: 'tripStartOdo',
        description: 'Odometer reading at trip start (km)',
        type: 'number',
        defaultValue: 0,
        category: 'trip'
    },
    {
        name: 'currentTripDistance',
        description: 'Current trip distance (km)',
        type: 'number',
        defaultValue: 0,
        category: 'trip'
    },
    {
        name: 'lastIgnitionOffTime',
        description: 'Last time ignition was turned off',
        type: 'timestamp',
        defaultValue: null,
        category: 'ignition'
    },
    {
        name: 'elapsedIgnitionOffTime',
        description: 'Time elapsed since ignition off (seconds)',
        type: 'number',
        defaultValue: 0,
        category: 'ignition'
    },
    // Lifecycle tracking variables
    {
        name: 'deviceLifecycleState',
        description: 'Current lifecycle state of the device',
        type: 'state',
        defaultValue: 'FACTORY',
        category: 'lifecycle'
    },
    {
        name: 'stateEntryTime',
        description: 'Timestamp when current lifecycle state was entered',
        type: 'timestamp',
        defaultValue: null,
        category: 'lifecycle'
    },
    {
        name: 'stateHistory',
        description: 'Array of previous lifecycle states with timestamps',
        type: 'array',
        defaultValue: [],
        category: 'lifecycle'
    }
];

// ============================================
// CONFIGURABLE PARAMETERS
// ============================================
export const ConfigurableParameters = [
    {
        name: 'MIN_TRIP_DISTANCE',
        description: 'Minimum distance to confirm a trip (km)',
        type: 'number',
        defaultValue: 2,
        min: 0.1,
        max: 50,
        unit: 'km'
    },
    {
        name: 'MIN_IGN_OFF_TIME',
        description: 'Minimum ignition off time to end a trip (seconds)',
        type: 'number',
        defaultValue: 120,
        min: 10,
        max: 3600,
        unit: 'seconds'
    },
    {
        name: 'MAX_IGN_OFF_TIME',
        description: 'Maximum ignition off time before trip ends (seconds)',
        type: 'number',
        defaultValue: 120,
        min: 10,
        max: 3600,
        unit: 'seconds'
    }
];

// ============================================
// TRIP STATE TRANSITION DEFINITIONS
// ============================================
export const StateTransitions = {
    [DeviceStates.TRIP_IDLE]: {
        description: 'No active trip',
        transitions: [
            {
                to: DeviceStates.TRIP_PENDING,
                condition: 'Ignition OFF → ON',
                description: 'When ignition turns on'
            }
        ]
    },
    [DeviceStates.TRIP_PENDING]: {
        description: 'Waiting to confirm trip',
        transitions: [
            {
                to: DeviceStates.TRIP_ACTIVE,
                condition: 'currentTripDistance >= MIN_TRIP_DISTANCE',
                description: 'Distance threshold met'
            },
            {
                to: DeviceStates.TRIP_IDLE,
                condition: 'Ignition ON → OFF && elapsedIgnitionOffTime >= MIN_IGN_OFF_TIME',
                description: 'Short trip ended'
            }
        ]
    },
    [DeviceStates.TRIP_ACTIVE]: {
        description: 'Active trip in progress',
        transitions: [
            {
                to: DeviceStates.TRIP_IDLE,
                condition: 'Ignition ON → OFF && elapsedIgnitionOffTime >= MAX_IGN_OFF_TIME',
                description: 'Trip ended'
            }
        ]
    }
};

// ============================================
// LIFECYCLE STATE TRANSITIONS
// ============================================
/**
 * Device lifecycle state transitions for CVIP provisioning.
 * Each state defines valid transitions and their conditions.
 */
export const LifecycleStateTransitions = {
    [DeviceLifecycleStates.FACTORY]: {
        description: 'Initial factory state',
        transitions: [
            {
                to: DeviceLifecycleStates.CONNECTING,
                condition: 'dongleInserted && commonCertificatesLoaded',
                description: 'Dongle inserted, ready to connect to CVIP'
            }
        ]
    },
    [DeviceLifecycleStates.CONNECTING]: {
        description: 'Connecting to CVIP with common certificates',
        transitions: [
            {
                to: DeviceLifecycleStates.TOKEN_RECEIVED,
                condition: 'cvipConnected && cvipBundleVerified',
                description: 'CVIP authentication successful'
            }
        ]
    },
    [DeviceLifecycleStates.TOKEN_RECEIVED]: {
        description: 'Access token received from CVIP',
        transitions: [
            {
                to: DeviceLifecycleStates.CERT_CREATION,
                condition: 'accessTokenReceived && accessTokenValid',
                description: 'Valid access token available'
            }
        ]
    },
    [DeviceLifecycleStates.CERT_CREATION]: {
        description: 'Creating device-specific certificates',
        transitions: [
            {
                to: DeviceLifecycleStates.RECONNECTING,
                condition: 'deviceCertificateReceived && deviceCertificateValid',
                description: 'Device certificates created'
            }
        ]
    },
    [DeviceLifecycleStates.RECONNECTING]: {
        description: 'Reconnecting to CVIP with device certificates',
        transitions: [
            {
                to: DeviceLifecycleStates.PROVISIONED,
                condition: 'cvipReconnected && secureConnectionEstablished',
                description: 'Secure connection established'
            }
        ]
    },
    [DeviceLifecycleStates.PROVISIONED]: {
        description: 'Device provisioned in CVIP',
        transitions: [
            {
                to: DeviceLifecycleStates.AUTHORIZED,
                condition: 'authorizationCommandReceived',
                description: 'CVIP sends authorization command'
            }
        ]
    },
    [DeviceLifecycleStates.AUTHORIZED]: {
        description: 'Device authorized by CVIP',
        transitions: [
            {
                to: DeviceLifecycleStates.CUSTOMER,
                condition: 'dongleResponseReceived && dongleResponseStatus == "SUCCESS"',
                description: 'Dongle confirms authorization'
            }
        ]
    },
    [DeviceLifecycleStates.CUSTOMER]: {
        description: 'Device activated for customer use',
        transitions: []
    }
};

// ============================================
// ALL AVAILABLE FACTS FOR RULE BUILDER
// ============================================
export const AvailableFacts = [
    // Sensor Data
    { name: 'speed', label: 'Speed (km/h)', type: 'number', category: 'sensor' },
    { name: 'rpm', label: 'RPM', type: 'number', category: 'sensor' },
    { name: 'engineTemp', label: 'Engine Temp (°C)', type: 'number', category: 'sensor' },
    { name: 'fuelLevel', label: 'Fuel Level (%)', type: 'number', category: 'sensor' },
    { name: 'roadCondition', label: 'Road Condition', type: 'string', category: 'sensor' },

    // Device State
    { name: 'deviceState', label: 'Device State', type: 'state', category: 'state' },
    { name: 'ignition', label: 'Ignition (ON/OFF)', type: 'boolean', category: 'state' },

    // Internal Variables
    { name: 'tripStartTime', label: 'Trip Start Time', type: 'timestamp', category: 'variable' },
    { name: 'tripStartOdo', label: 'Trip Start Odo (km)', type: 'number', category: 'variable' },
    { name: 'currentTripDistance', label: 'Current Trip Distance (km)', type: 'number', category: 'variable' },
    { name: 'lastIgnitionOffTime', label: 'Last Ignition Off Time', type: 'timestamp', category: 'variable' },
    { name: 'elapsedIgnitionOffTime', label: 'Elapsed Ign Off Time (s)', type: 'number', category: 'variable' },

    // Trip Statistics
    { name: 'runTime', label: 'Run Time (s)', type: 'number', category: 'trip' },
    { name: 'distance', label: 'Distance (km)', type: 'number', category: 'trip' },
    { name: 'offTime', label: 'Off Time (s)', type: 'number', category: 'trip' },

    // Parameters (for reference in conditions)
    { name: 'MIN_TRIP_DISTANCE', label: 'Min Trip Distance (km)', type: 'parameter', category: 'parameter' },
    { name: 'MIN_IGN_OFF_TIME', label: 'Min Ign Off Time (s)', type: 'parameter', category: 'parameter' },
    { name: 'MAX_IGN_OFF_TIME', label: 'Max Ign Off Time (s)', type: 'parameter', category: 'parameter' },

    // ============================================
    // LIFECYCLE FACTS (CVIP Integration)
    // ============================================

    // CVIP Connection & Authentication
    { name: 'dongleInserted', label: 'Dongle Inserted', type: 'boolean', category: 'lifecycle' },
    { name: 'commonCertificatesLoaded', label: 'Common Certs Loaded', type: 'boolean', category: 'lifecycle' },
    { name: 'cvipConnected', label: 'CVIP Connected', type: 'boolean', category: 'lifecycle' },
    { name: 'authenticationMethod', label: 'Auth Method', type: 'string', category: 'lifecycle' },
    { name: 'cvipBundleVerified', label: 'CVIP Bundle Verified', type: 'boolean', category: 'lifecycle' },

    // Access Token Management
    { name: 'accessTokenReceived', label: 'Access Token Received', type: 'boolean', category: 'lifecycle' },
    { name: 'accessTokenValid', label: 'Access Token Valid', type: 'boolean', category: 'lifecycle' },
    { name: 'accessTokenExpiry', label: 'Access Token Expiry', type: 'timestamp', category: 'lifecycle' },

    // Device Certificate Management
    { name: 'deviceCertificateRequested', label: 'Device Cert Requested', type: 'boolean', category: 'lifecycle' },
    { name: 'deviceCertificateReceived', label: 'Device Cert Received', type: 'boolean', category: 'lifecycle' },
    { name: 'deviceCertificateValid', label: 'Device Cert Valid', type: 'boolean', category: 'lifecycle' },
    { name: 'deviceCertificateExpiryDays', label: 'Cert Expiry (days)', type: 'number', category: 'lifecycle' },

    // CVIP Reconnection
    { name: 'cvipReconnected', label: 'CVIP Reconnected', type: 'boolean', category: 'lifecycle' },
    { name: 'secureConnectionEstablished', label: 'Secure Connection', type: 'boolean', category: 'lifecycle' },

    // Device Registration
    { name: 'cvipRegistered', label: 'CVIP Registered', type: 'boolean', category: 'lifecycle' },
    { name: 'deviceId', label: 'Device ID', type: 'string', category: 'lifecycle' },

    // Authorization
    { name: 'authorizationCommandReceived', label: 'Auth Command Received', type: 'boolean', category: 'lifecycle' },
    { name: 'authorizationAckSent', label: 'Auth Ack Sent', type: 'boolean', category: 'lifecycle' },

    // Customer Activation
    { name: 'dongleResponseReceived', label: 'Dongle Response Received', type: 'boolean', category: 'lifecycle' },
    { name: 'dongleResponseStatus', label: 'Dongle Response Status', type: 'string', category: 'lifecycle' },
    { name: 'customerActivationTime', label: 'Customer Activation Time', type: 'timestamp', category: 'lifecycle' },

    // Event Subscriptions
    { name: 'subscribedToCSRAccessTokenResponse', label: 'Subscribed to CSR Token', type: 'boolean', category: 'lifecycle' },
    { name: 'imeiPublished', label: 'IMEI Published', type: 'boolean', category: 'lifecycle' },
    { name: 'imeiValue', label: 'IMEI', type: 'string', category: 'lifecycle' },

    // Lifecycle State
    { name: 'deviceLifecycleState', label: 'Lifecycle State', type: 'state', category: 'lifecycle' },
    { name: 'stateEntryTime', label: 'State Entry Time', type: 'timestamp', category: 'lifecycle' },
    { name: 'elapsedStateTime', label: 'Elapsed State Time (s)', type: 'number', category: 'lifecycle' }
];

export class RuleEngine {
    constructor(rules = []) {
        this.rules = rules;
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    removeRule(ruleId) {
        this.rules = this.rules.filter(r => r.id !== ruleId);
    }

    updateRules(newRules) {
        this.rules = newRules;
    }

    evaluate(data) {
        const triggeredEvents = [];

        for (const rule of this.rules) {
            if (this.checkConditions(rule.conditions, data)) {
                triggeredEvents.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    ...rule.event,
                    timestamp: new Date().toISOString(),
                    dataSnapshot: { ...data }
                });
            }
        }

        return triggeredEvents;
    }

    checkConditions(conditions, data) {
        if (!conditions) return true; // No conditions = always true? Or always false. Let's say true.

        // Check 'all' (AND) conditions
        if (conditions.all && Array.isArray(conditions.all)) {
            for (const condition of conditions.all) {
                if (!this.evaluateCondition(condition, data)) {
                    return false;
                }
            }
        }

        // Check 'any' (OR) conditions - if present, at least one must be true
        if (conditions.any && Array.isArray(conditions.any) && conditions.any.length > 0) {
            let anyTrue = false;
            for (const condition of conditions.any) {
                if (this.evaluateCondition(condition, data)) {
                    anyTrue = true;
                    break;
                }
            }
            if (!anyTrue) return false;
        }

        return true;
    }

    evaluateCondition(condition, data) {
        const { fact, operator, value } = condition;
        const factValue = data[fact];

        // Handle nested facts (e.g. "engine.temperature")
        // For simplicity, assuming flat data structure for now, but could be extended.

        switch (operator) {
            case 'equal':
            case '==':
            case '===':
                return factValue == value;
            case 'notEqual':
            case '!=':
            case '!==':
                return factValue != value;
            case 'greaterThan':
            case '>':
                return Number(factValue) > Number(value);
            case 'greaterThanInclusive':
            case '>=':
                return Number(factValue) >= Number(value);
            case 'lessThan':
            case '<':
                return Number(factValue) < Number(value);
            case 'lessThanInclusive':
            case '<=':
                return Number(factValue) <= Number(value);
            case 'contains':
                return String(factValue).includes(String(value));
            default:
                console.warn(`Unknown operator: ${operator}`);
                return false;
        }
    }
}

export const defaultRules = [
    {
        id: 'rule-harsh-driving',
        name: 'Harsh Driving',
        conditions: {
            all: [
                { fact: 'speed', operator: '>', value: 30 },
                { fact: 'roadCondition', operator: '==', value: 'bad' }
            ]
        },
        event: {
            type: 'harsh_driving',
            message: 'Harsh driving detected: Speeding on bad road',
            severity: 'critical'
        }
    },
    {
        id: 'rule-speeding',
        name: 'Speeding',
        conditions: {
            all: [
                { fact: 'speed', operator: '>', value: 80 }
            ]
        },
        event: {
            type: 'speeding',
            message: 'Vehicle is speeding (> 80)',
            severity: 'warning'
        }
    },
    {
        id: 'rule-overheating',
        name: 'Engine Overheating',
        conditions: {
            all: [
                { fact: 'engineTemp', operator: '>', value: 100 }
            ]
        },
        event: {
            type: 'vehicle_health',
            message: 'Engine is overheating! (> 100°C)',
            severity: 'critical'
        }
    },
    {
        id: 'rule-low-fuel',
        name: 'Low Fuel',
        conditions: {
            all: [
                { fact: 'fuelLevel', operator: '<', value: 15 }
            ]
        },
        event: {
            type: 'vehicle_health',
            message: 'Fuel level is low (< 15%)',
            severity: 'warning'
        }
    },
    {
        id: 'rule-icy-road',
        name: 'High Speed on Icy Road',
        conditions: {
            all: [
                { fact: 'speed', operator: '>', value: 40 },
                { fact: 'roadCondition', operator: '==', value: 'icy' }
            ]
        },
        event: {
            type: 'safety_hazard',
            message: 'Dangerous speed on icy road!',
            severity: 'critical'
        }
    },
    {
        id: 'rule-high-rpm',
        name: 'High RPM',
        conditions: {
            all: [
                { fact: 'rpm', operator: '>', value: 6000 }
            ]
        },
        event: {
            type: 'vehicle_health',
            message: 'High RPM detected (> 6000)',
            severity: 'critical'
        }
    },
    {
        id: 'rule-trip-start',
        name: 'Vehicle Trip Start',
        conditions: {
            all: [
                { fact: 'runTime', operator: '>=', value: 300 }, // 5 minutes
                { fact: 'distance', operator: '>=', value: 2 },  // 2 km
                { fact: 'ignition', operator: '==', value: true }
            ]
        },
        event: {
            type: 'trip_status',
            message: 'Trip Started (5 mins & 2km)',
            severity: 'info'
        }
    },
    {
        id: 'rule-trip-stop',
        name: 'Vehicle Trip Stop',
        conditions: {
            all: [
                { fact: 'offTime', operator: '>=', value: 120 }, // 2 minutes
                { fact: 'ignition', operator: '==', value: false }
            ]
        },
        event: {
            type: 'trip_status',
            message: 'Trip Stopped (Engine off > 2 mins)',
            severity: 'info'
        }
    },

    // ============================================
    // LIFECYCLE STATE TRANSITION RULES
    // ============================================
    {
        id: 'lifecycle-connecting',
        name: 'Lifecycle: Factory → Connecting',
        conditions: {
            all: [
                { fact: 'deviceLifecycleState', operator: '==', value: 'FACTORY' },
                { fact: 'dongleInserted', operator: '==', value: true },
                { fact: 'commonCertificatesLoaded', operator: '==', value: true }
            ]
        },
        event: {
            type: 'lifecycle_transition',
            targetState: 'CONNECTING',
            message: 'Dongle inserted, connecting to CVIP',
            severity: 'info'
        }
    },
    {
        id: 'lifecycle-token-received',
        name: 'Lifecycle: Connecting → Token Received',
        conditions: {
            all: [
                { fact: 'deviceLifecycleState', operator: '==', value: 'CONNECTING' },
                { fact: 'cvipConnected', operator: '==', value: true },
                { fact: 'cvipBundleVerified', operator: '==', value: true }
            ]
        },
        event: {
            type: 'lifecycle_transition',
            targetState: 'TOKEN_RECEIVED',
            message: 'CVIP authentication successful',
            severity: 'info'
        }
    },
    {
        id: 'lifecycle-cert-creation',
        name: 'Lifecycle: Token Received → Cert Creation',
        conditions: {
            all: [
                { fact: 'deviceLifecycleState', operator: '==', value: 'TOKEN_RECEIVED' },
                { fact: 'accessTokenReceived', operator: '==', value: true },
                { fact: 'accessTokenValid', operator: '==', value: true }
            ]
        },
        event: {
            type: 'lifecycle_transition',
            targetState: 'CERT_CREATION',
            message: 'Creating device certificates',
            severity: 'info'
        }
    },
    {
        id: 'lifecycle-reconnecting',
        name: 'Lifecycle: Cert Creation → Reconnecting',
        conditions: {
            all: [
                { fact: 'deviceLifecycleState', operator: '==', value: 'CERT_CREATION' },
                { fact: 'deviceCertificateReceived', operator: '==', value: true },
                { fact: 'deviceCertificateValid', operator: '==', value: true }
            ]
        },
        event: {
            type: 'lifecycle_transition',
            targetState: 'RECONNECTING',
            message: 'Device certificates created, reconnecting',
            severity: 'info'
        }
    },
    {
        id: 'lifecycle-provisioned',
        name: 'Lifecycle: Reconnecting → Provisioned',
        conditions: {
            all: [
                { fact: 'deviceLifecycleState', operator: '==', value: 'RECONNECTING' },
                { fact: 'cvipReconnected', operator: '==', value: true },
                { fact: 'secureConnectionEstablished', operator: '==', value: true },
                { fact: 'cvipRegistered', operator: '==', value: true }
            ]
        },
        event: {
            type: 'lifecycle_transition',
            targetState: 'PROVISIONED',
            message: 'Device provisioned in CVIP',
            severity: 'info'
        }
    },
    {
        id: 'lifecycle-authorized',
        name: 'Lifecycle: Provisioned → Authorized',
        conditions: {
            all: [
                { fact: 'deviceLifecycleState', operator: '==', value: 'PROVISIONED' },
                { fact: 'authorizationCommandReceived', operator: '==', value: true }
            ]
        },
        event: {
            type: 'lifecycle_transition',
            targetState: 'AUTHORIZED',
            message: 'Device authorized by CVIP',
            severity: 'info'
        }
    },
    {
        id: 'lifecycle-customer',
        name: 'Lifecycle: Authorized → Customer',
        conditions: {
            all: [
                { fact: 'deviceLifecycleState', operator: '==', value: 'AUTHORIZED' },
                { fact: 'dongleResponseReceived', operator: '==', value: true },
                { fact: 'dongleResponseStatus', operator: '==', value: 'SUCCESS' }
            ]
        },
        event: {
            type: 'lifecycle_transition',
            targetState: 'CUSTOMER',
            message: 'Device activated for customer',
            severity: 'info'
        }
    },

    // ============================================
    // LIFECYCLE MONITORING RULES
    // ============================================
    {
        id: 'lifecycle-cert-expiry-warning',
        name: 'Certificate Expiry Warning',
        conditions: {
            all: [
                { fact: 'deviceCertificateExpiryDays', operator: '<', value: 30 },
                { fact: 'deviceCertificateExpiryDays', operator: '>', value: 0 }
            ]
        },
        event: {
            type: 'certificate_warning',
            message: 'Device certificate expires in less than 30 days',
            severity: 'warning'
        }
    },
    {
        id: 'lifecycle-event-subscription',
        name: 'Event Subscription Active',
        conditions: {
            all: [
                { fact: 'deviceLifecycleState', operator: '==', value: 'CUSTOMER' },
                { fact: 'subscribedToCSRAccessTokenResponse', operator: '==', value: true },
                { fact: 'imeiPublished', operator: '==', value: true }
            ]
        },
        event: {
            type: 'event_subscription_active',
            message: 'Device subscribed to CSR Access Token Response',
            severity: 'info'
        }
    }
];
