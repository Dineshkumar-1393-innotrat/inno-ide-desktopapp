import React from "react";
import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { FaBug, FaCogs, FaTrashAlt } from "react-icons/fa";
import { MdFlashOn } from "react-icons/md";

const IconBar = ({
  onBuildClick,
  onDebugClick,
  onFlashClick,
  onEraseClick,
  direction = "column",
  placement = "overlay",
  buttonSize = "md",
  gap = 2,
}) => {
  const containerProps =
    placement === "overlay"
      ? {
        position: "absolute",
        top: "50%",
        right: 0,
        transform: "translateY(-50%)",
      }
      : {};

  return (
    <Flex direction={direction} gap={gap} align="center" {...containerProps}>
      <Tooltip label="Build" hasArrow>
        <IconButton
          icon={<FaCogs />}
          aria-label="Build"
          size={buttonSize}
          colorScheme="blue"
          variant="outline"
          onClick={onBuildClick}
        />
      </Tooltip>
      <Tooltip label="Debug" hasArrow>
        <IconButton
          icon={<FaBug />}
          aria-label="Debug"
          size={buttonSize}
          colorScheme="green"
          variant="outline"
          onClick={onDebugClick}
        />
      </Tooltip>
      <Tooltip label="Flash" hasArrow>
        <IconButton
          icon={<MdFlashOn />}
          aria-label="Flash"
          size={buttonSize}
          colorScheme="yellow"
          variant="outline"
          onClick={onFlashClick}
        />
      </Tooltip>
      <Tooltip label="Erase Device Data" hasArrow>
        <IconButton
          icon={<FaTrashAlt />}
          aria-label="Erase Device Data"
          size={buttonSize}
          colorScheme="red"
          variant="outline"
          onClick={onEraseClick}
        />
      </Tooltip>
    </Flex>
  );
};

export default IconBar;
