// Editor.jsx
import React, { useEffect, useState } from "react";
import EmbeddedFileManagement from "../components/EmbeddedFileManagement/EmbeddedFileManagement";
import { getUserInfo } from "../utilities";

const Editor = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const u = getUserInfo();
    if (u) setUserData(u);
  }, []);

  // show a simple placeholder while userData loads
  if (!userData) {
    return <div style={{ padding: 24 }}>Loading user... (please login)</div>;
  }

  return <EmbeddedFileManagement userData={userData} />;
};

export default Editor;
