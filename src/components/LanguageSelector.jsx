
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "blue.400";

const LanguageSelector = ({ language, onSelect }) => {
  const menuBg = useColorModeValue("gray.100", "#110c1b");
  const menuItemBg = useColorModeValue("gray.200", "gray.700");
  const activeTextColor = useColorModeValue("blue.600", "blue.300");
  const inactiveTextColor = useColorModeValue("black", "gray.300");

  return (
    <Box >
      <Menu isLazy>
        <MenuButton as={Button} fontSize="sm" px={2} py={2} height="auto">
          {language}
        </MenuButton>
        <MenuList bg={menuBg}>
          {languages.map(([lang, version]) => (
            <MenuItem
              key={lang}
              color={lang === language ? activeTextColor : inactiveTextColor}
              bg={lang === language ? menuItemBg : "transparent"}
              _hover={{
                color: activeTextColor,
                bg: menuItemBg,
              }}
              onClick={() => onSelect(lang)}
            >
              {lang}
              &nbsp;
              <Text as="span" color={inactiveTextColor} fontSize="sm">
                ({version})
              </Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
