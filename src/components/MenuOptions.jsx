import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Button,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaFile, FaEdit, FaEye, FaQuestionCircle } from "react-icons/fa";
import { Cog, Hammer, BugPlay, Zap, Trash, Radio, Terminal, Library } from "lucide-react";

const MenuOptions = ({ onOpen }) => {
  const { colorMode } = useColorMode();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* File Menu code */}
      <Menu>
        <MenuButton as={Button} variant="link" rightIcon={<ChevronDownIcon />}>
          File
        </MenuButton>
        <MenuList>
          <MenuItem icon={<FaFile />} onClick={onOpen}>
            New
          </MenuItem>
          <MenuItem icon={<FaFile />}>Open</MenuItem>
          <MenuItem icon={<FaFile />}>Save</MenuItem>
          <MenuItem icon={<FaFile />}>Save As</MenuItem>
          <MenuItem icon={<FaFile />}>Export</MenuItem>
          <MenuItem icon={<FaFile />}>Close Project</MenuItem>
          <MenuItem icon={<FaFile />}>Exit</MenuItem>
        </MenuList>
      </Menu>

      {/* Edit Menu code */}
      <Menu>
        <MenuButton as={Button} variant="link" rightIcon={<ChevronDownIcon />}>
          Edit
        </MenuButton>
        <MenuList>
          <MenuItem icon={<FaEdit />}>Undo</MenuItem>
          <MenuItem icon={<FaEdit />}>Redo</MenuItem>
          <MenuItem icon={<FaEdit />}>Cut</MenuItem>
          <MenuItem icon={<FaEdit />}>Copy</MenuItem>
          <MenuItem icon={<FaEdit />}>Paste</MenuItem>
          <MenuItem icon={<FaEdit />}>Select All</MenuItem>
          <MenuItem icon={<FaEdit />}>Replicate</MenuItem>
          <MenuItem icon={<FaEdit />}>Duplicate Line</MenuItem>
          <MenuItem icon={<FaEdit />}>Move Line Up</MenuItem>
          <MenuItem icon={<FaEdit />}>Move Line Down</MenuItem>
        </MenuList>
      </Menu>

      {/* View Menu code */}
      <Menu>
        <MenuButton as={Button} variant="link" rightIcon={<ChevronDownIcon />}>
          View
        </MenuButton>
        <MenuList>
          <MenuItem icon={<FaEye />}>Zoom In</MenuItem>
          <MenuItem icon={<FaEye />}>Zoom Out</MenuItem>
          <MenuItem icon={<FaEye />}>Full Screen</MenuItem>
          <MenuItem icon={<FaEye />}>Toggle Side Bar</MenuItem>
          <MenuItem icon={<FaEye />}>Toggle Serial Console</MenuItem>
          <MenuItem icon={<FaEye />}>Toggle Debug Panel</MenuItem>
          <MenuItem icon={<FaEye />}>Toggle Line Numbers</MenuItem>
        </MenuList>
      </Menu>

      {/* Tools Menu code */}
      <Menu>
        <MenuButton as={Button} variant="link" rightIcon={<ChevronDownIcon />}>
          Tools
        </MenuButton>
        <MenuList>
          <MenuItem icon={<Cog size={14} />} onClick={() => window.dispatchEvent(new CustomEvent('innoide:compile-start'))}>Compile</MenuItem>
          <MenuItem icon={<Hammer size={14} />} onClick={() => { window.dispatchEvent(new CustomEvent('innoide:build-start')); setTimeout(() => window.dispatchEvent(new CustomEvent('innoide:build-complete')), 800) }}>Build</MenuItem>
          <MenuItem icon={<BugPlay size={14} />} onClick={() => window.dispatchEvent(new CustomEvent('innoide:debugger-start'))}>Debugger</MenuItem>
          <MenuItem icon={<Zap size={14} />} onClick={() => { window.dispatchEvent(new CustomEvent('innoide:flash-start')); setTimeout(() => window.dispatchEvent(new CustomEvent('innoide:flash-complete')), 1000) }}>Flash</MenuItem>
          <MenuItem icon={<Trash size={14} />} onClick={() => { window.dispatchEvent(new CustomEvent('innoide:erase-start')); setTimeout(() => window.dispatchEvent(new CustomEvent('innoide:erase-complete')), 600) }}>Erase Chip</MenuItem>
          <MenuItem icon={<Radio size={14} />} onClick={() => window.dispatchEvent(new CustomEvent('innoide:serial-open'))}>Serial Monitor</MenuItem>
          <MenuItem icon={<Terminal size={14} />} onClick={() => window.dispatchEvent(new CustomEvent('innoide:terminal-open'))}>Terminal</MenuItem>
          <MenuItem icon={<Library size={14} />} onClick={() => window.dispatchEvent(new CustomEvent('innoide:libraries-open'))}>Library Manager</MenuItem>
        </MenuList>
      </Menu>

      {/* Help Menu code */}
      <Menu>
        <MenuButton as={Button} variant="link" rightIcon={<ChevronDownIcon />}>
          Help
        </MenuButton>
        <MenuList>
          <MenuItem icon={<FaQuestionCircle />}>Documentation</MenuItem>
          <MenuItem icon={<FaQuestionCircle />}>About</MenuItem>
        </MenuList>
      </Menu>

      {/* Terminal Menu code */}
      <Menu>
        <MenuButton as={Button} variant="link" rightIcon={<ChevronDownIcon />}>
          Terminal
        </MenuButton>
        <MenuList>
          <MenuItem icon={<FaEdit />} onClick={() => scrollToSection("terminal")}>
            Terminal
          </MenuItem>
          <MenuItem icon={<FaEdit />} onClick={() => scrollToSection("output-box")}>
            Output Box
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

export default MenuOptions;
