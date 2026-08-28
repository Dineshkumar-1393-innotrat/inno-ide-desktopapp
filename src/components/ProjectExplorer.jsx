// import React, { useState } from 'react';
// import { ChevronRight, Folder, PlusSquare, Copy, Trash2 } from 'lucide-react';
// import './ProjectExplorer.css';

// const initialProjects = [
//   { id: 1, name: 'test 111' },
//   { id: 2, name: 'test 222' },
//   { id: 3, name: 'test 333' },
//   { id: 4, name: 'test 444' },
//   { id: 5, name: 'test 555' },
//   { id: 6, name: 'test 666' },
//   { id: 7, name: 'test9901' },
// ];

// const ProjectItem = ({ project, selected, onSelect }) => {
//   return (
//     <li
//       className={`project-item ${selected ? 'selected' : ''}`}
//       onClick={() => onSelect(project.id)}
//     >
//       <ChevronRight size={16} className="chevron" />
//       <Folder size={16} className="folder-icon" />
//       <span className="project-name">{project.name}</span>
//       <div className="project-actions">
//         <button title="Add new file"><PlusSquare size={14} /></button>
//         <button title="Duplicate project"><Copy size={14} /></button>
//         <button title="Delete project"><Trash2 size={14} /></button>
//       </div>
//     </li>
//   );
// };

// const ProjectExplorer = () => {
//   const [selectedProject, setSelectedProject] = useState(7);

//   return (
//     <div className="project-explorer">
//       <button className="create-project-btn">
//         <PlusSquare size={16} />
//         Create New Project
//       </button>
//       <ul className="project-list">
//         {initialProjects.map((p) => (
//           <ProjectItem
//             key={p.id}
//             project={p}
//             selected={p.id === selectedProject}
//             onSelect={setSelectedProject}
//           />
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ProjectExplorer;


import React, { useState } from "react";
import { ChevronRight, Folder, PlusSquare, Copy, Trash2 } from "lucide-react";
import "./ProjectExplorer.css";

const initialProjects = [
  { id: 1, name: "test 111" },
  { id: 2, name: "test 222" },
  { id: 3, name: "test 333" },
  { id: 4, name: "test 444" },
  { id: 5, name: "test 555" },
  { id: 6, name: "test 666" },
  { id: 7, name: "test9901" },
];

const ProjectItem = ({ project, selected, onSelect }) => (
  <li
    className={`project-item ${selected ? "selected" : ""}`}
    onClick={() => onSelect(project.id)}
  >
    <ChevronRight size={16} className="chevron" />
    <Folder size={16} className="folder-icon" />
    <span className="project-name">{project.name}</span>

    <div className="project-actions">
      <button title="Add File"><PlusSquare size={14} /></button>
      <button title="Duplicate"><Copy size={14} /></button>
      <button title="Delete"><Trash2 size={14} /></button>
    </div>
  </li>
);

const ProjectExplorer = ({ response }) => {
  const [selectedProject, setSelectedProject] = useState(7);

  return (
    <div className="project-explorer">
      <button className="create-project-btn">
        <PlusSquare size={16} />
        Create New Project
      </button>

      {response && (
        <p className="logged-user">
          Logged in as: <strong>{response.name}</strong>
        </p>
      )}

      <ul className="project-list">
        {initialProjects.map((p) => (
          <ProjectItem
            key={p.id}
            project={p}
            selected={p.id === selectedProject}
            onSelect={setSelectedProject}
          />
        ))}
      </ul>
    </div>
  );
};

export default ProjectExplorer;
