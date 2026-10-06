import React from "react";
import { QRCodeSVG } from "qrcode.react";

// Safe QR Code wrapper (catches "Data too long" RangeError from qrcode.react)
export default class SafeQRCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    // Reset error state when value changes so user can retry after switching mode
    if (prevProps.value !== this.props.value) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: this.props.size || 185,
            height: this.props.size || 185,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            borderRadius: 12,
            padding: 12,
            textAlign: "center",
            color: "#e53e3e",
            fontSize: 11,
            fontFamily: "sans-serif"
          }}
        >
          <span style={{ fontSize: 28 }}>⚠️</span>
          <strong style={{ marginTop: 6, display: "block" }}>Payload Too Large</strong>
          <span style={{ marginTop: 4, color: "#718096" }}>
            Switch to <em>Web App URL</em> mode for a scannable QR code
          </span>
        </div>
      );
    }
    return <QRCodeSVG {...this.props} />;
  }
}
