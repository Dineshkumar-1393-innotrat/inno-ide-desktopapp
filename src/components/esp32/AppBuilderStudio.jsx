import React, { memo } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Grid,
  GridItem,
  useColorModeValue
} from "@chakra-ui/react";
import AppBuilderToolbar from "./AppBuilderToolbar.jsx";
import AppBuilderPalette from "./AppBuilderPalette.jsx";
import AppDesignerCanvas from "./AppDesignerCanvas.jsx";
import VisualBlocksView from "./VisualBlocksView.jsx";
import AppPreviewSimulator from "./AppPreviewSimulator.jsx";
import AppBuilderInspector from "./AppBuilderInspector.jsx";
import DeviceSwitchLocationQrModal from "./DeviceSwitchLocationQrModal.jsx";
import PublishCompanionModal from "./PublishCompanionModal.jsx";
import RuleBuilderModal from "../RuleBuilderModal";
import AppBuilderModals from "./AppBuilderModals.jsx";

/**
 * AppBuilderStudio Component
 * Encapsulates the entire IoT Mobile Companion App Builder environment:
 * - Toolbar with history undo/redo, app profile persistence, and publish trigger.
 * - 3-column studio grid: Left Component Palette, Center Dynamic Canvas (Designer/Blocks/Preview), Right Inspector.
 * - Live status bar.
 * - Associated studio modals: QR Location, Publish Companion, Automation Rule Builder, and Profile CRUD modals.
 */
function AppBuilderStudio({
  // Project & Theme
  projectName,
  bgCard,
  borderColor,
  bgPurpleCard,
  bgCyanCard,

  // Device & Connection
  selectedDevice,
  activePort,
  setWizardStep,

  // View & Inspector
  appBuilderView,
  setAppBuilderView,
  inspectorTab,
  setInspectorTab,

  // Widgets & History
  widgets,
  visibleWidgets,
  selectedWidgetId,
  setSelectedWidgetId,
  activeWidget,
  history,
  historyIndex,
  handleUndo,
  handleRedo,

  // Widget Actions & DnD
  draggedPaletteItem,
  setDraggedPaletteItem,
  draggedWidgetId,
  setDraggedWidgetId,
  dropInsertIndex,
  setDropInsertIndex,
  isDraggingActive,
  isDraggingOverPhone,
  setIsDraggingOverPhone,
  handlePhoneDrop,
  handleWidgetDragOver,
  handleAddComponent,
  handleUpdateWidget,
  handleDeleteWidget,
  handleMoveWidget,
  handleDuplicateWidget,
  handleToggleVisibility,

  // Hardware & Signals
  handleTestHardwareSignal,
  liveLedToggle,
  setLiveLedToggle,
  handleToggleHardwareLed,
  ledHardwareError,
  serialTrafficLogs,
  setSerialTrafficLogs,

  // Automation Rules
  logicBlocks,
  setLogicBlocks,
  isRuleModalOpen,
  onRuleModalClose,
  editingRule,
  setEditingRule,
  ruleModalTab,
  setRuleModalTab,
  testRuleResult,
  setTestRuleResult,
  isTestingRule,
  setIsTestingRule,
  handleOpenAddRule,
  handleOpenEditRule,
  handleSaveRuleModal,
  handleDeleteLogicBlock,
  handleToggleLogicBlock,
  handleExecuteRule,

  // Device Location
  deviceDetectedLocation,
  isDetectingLocation,
  fetchCurrentDeviceLocation,
  handleCalibrateLocation,
  handleClearGeologs,

  // Dynamic Form & CRUD Records
  newQuestionInputs,
  setNewQuestionInputs,
  newAnswerInputs,
  setNewAnswerInputs,
  handleAddQuestionToForm,
  handleDeleteQuestionFromForm,
  handleSubmitFormAnswer,
  handleClearFormResponses,
  isCrudModalOpen,
  onCrudModalClose,
  editingCrudRecord,
  crudRecordForm,
  setCrudRecordForm,
  handleOpenAddCrudRecord,
  handleOpenEditCrudRecord,
  handleSaveCrudRecord,
  handleDeleteCrudRecord,

  // App Profile Persistence & Aux Modals
  savedApps,
  handleLoadApp,
  handleSaveApp,
  handleDeleteApp,
  handleRenameApp,
  handleCreateNewApp,
  handleClearAllWidgets,
  isNewAppModalOpen,
  onNewAppModalOpen,
  onNewAppModalClose,
  newAppNameInput,
  setNewAppNameInput,
  isRenameAppModalOpen,
  onRenameAppModalOpen,
  onRenameAppModalClose,
  renameAppNameInput,
  setRenameAppNameInput,
  isClearCanvasModalOpen,
  onClearCanvasModalOpen,
  onClearCanvasModalClose,

  // Companion Server, Tunnels & Publish
  isPublishOpen,
  onPublishClose,
  handleOpenPublishModal,
  companionServerInfo,
  localCompanionUrl,
  companionNetworkMode,
  remoteTunnelState,
  handleToggleCloudRemote,
  isCloudActive,
  resolvedHostIp,
  resolvedHostPort,
  expoSdkVersion,
  handleExportExpoZip,
  handleOpenExpoSnack,
  handleCopyAppJsCode,
  handleExportHtmlWebApp,

  // QR Payloads & Schemas
  qrPayloadMode,
  setQrPayloadMode,
  cleanUiList,
  cleanLogicsList,
  activeQrPayload,
  webAppQrPayload,
  bundleQrPayload,
  effectiveDeviceId,
  effectiveDeviceName,
  effectiveDeviceType,

  // Location QR Modal
  isLocationQrModalOpen,
  onLocationQrModalClose,
  locationQrModalData
}) {
  const canvasBg = useColorModeValue("#f8fafc", "#0b0f17");
  const mainStudioBg = useColorModeValue("gray.50", "gray.900");

  return (
    <Box w="100%" h="100%" bg={mainStudioBg} display="flex" flexDirection="column">
      {/* Top App Builder Header Bar */}
      <AppBuilderToolbar
        bgCard={bgCard}
        borderColor={borderColor}
        projectName={projectName}
        setNewAppNameInput={setNewAppNameInput}
        onNewAppModalOpen={onNewAppModalOpen}
        setRenameAppNameInput={setRenameAppNameInput}
        onRenameAppModalOpen={onRenameAppModalOpen}
        handleSaveApp={handleSaveApp}
        onClearCanvasModalOpen={onClearCanvasModalOpen}
        savedApps={savedApps}
        handleLoadApp={handleLoadApp}
        handleDeleteApp={handleDeleteApp}
        selectedDevice={selectedDevice}
        activePort={activePort}
        setWizardStep={setWizardStep}
        appBuilderView={appBuilderView}
        setAppBuilderView={setAppBuilderView}
        logicBlocks={logicBlocks}
        historyIndex={historyIndex}
        history={history}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleOpenPublishModal={handleOpenPublishModal}
      />

      {/* 3-Column Studio Layout: Palette | Main Canvas | Properties Inspector */}
      <Grid templateColumns={{ base: "1fr", lg: "260px 1fr 340px" }} flex="1" overflow="hidden">
        {/* 1. Left Sidebar: Component Palette */}
        <AppBuilderPalette
          bgCard={bgCard}
          borderColor={borderColor}
          appBuilderView={appBuilderView}
          setAppBuilderView={setAppBuilderView}
          widgets={widgets}
          logicBlocks={logicBlocks}
          handleOpenAddRule={handleOpenAddRule}
          setDraggedPaletteItem={setDraggedPaletteItem}
          setDropInsertIndex={setDropInsertIndex}
          setIsDraggingOverPhone={setIsDraggingOverPhone}
          handleAddComponent={handleAddComponent}
        />

        {/* 2. Center Canvas: Switchable Designer / Blocks / Preview */}
        <GridItem
          bg={canvasBg}
          p={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="start"
          overflowY="auto"
          position="relative"
        >
          {/* VIEW 1: DESIGNER MODE */}
          {appBuilderView === "designer" && (
            <AppDesignerCanvas
              projectName={projectName}
              widgets={widgets}
              visibleWidgets={visibleWidgets}
              selectedWidgetId={selectedWidgetId}
              setSelectedWidgetId={setSelectedWidgetId}
              draggedWidgetId={draggedWidgetId}
              setDraggedWidgetId={setDraggedWidgetId}
              dropInsertIndex={dropInsertIndex}
              setDropInsertIndex={setDropInsertIndex}
              isDraggingActive={isDraggingActive}
              isDraggingOverPhone={isDraggingOverPhone}
              setIsDraggingOverPhone={setIsDraggingOverPhone}
              handlePhoneDrop={handlePhoneDrop}
              handleWidgetDragOver={handleWidgetDragOver}
              handleUpdateWidget={handleUpdateWidget}
              handleTestHardwareSignal={handleTestHardwareSignal}
              handleOpenAddCrudRecord={handleOpenAddCrudRecord}
              handleOpenEditCrudRecord={handleOpenEditCrudRecord}
              handleDeleteCrudRecord={handleDeleteCrudRecord}
              deviceDetectedLocation={deviceDetectedLocation}
              handleCalibrateLocation={handleCalibrateLocation}
              isDetectingLocation={isDetectingLocation}
              fetchCurrentDeviceLocation={fetchCurrentDeviceLocation}
              handleClearGeologs={handleClearGeologs}
              newQuestionInputs={newQuestionInputs}
              setNewQuestionInputs={setNewQuestionInputs}
              handleAddQuestionToForm={handleAddQuestionToForm}
              handleDeleteQuestionFromForm={handleDeleteQuestionFromForm}
              handleClearFormResponses={handleClearFormResponses}
              handleMoveWidget={handleMoveWidget}
              handleDuplicateWidget={handleDuplicateWidget}
              handleDeleteWidget={handleDeleteWidget}
            />
          )}

          {/* VIEW 2: VISUAL BLOCKS LOGIC EDITOR */}
          {appBuilderView === "blocks" && (
            <VisualBlocksView
              logicBlocks={logicBlocks}
              setLogicBlocks={setLogicBlocks}
              widgets={widgets}
              handleOpenAddRule={handleOpenAddRule}
              handleExecuteRule={handleExecuteRule}
              handleOpenEditRule={handleOpenEditRule}
              handleToggleLogicBlock={handleToggleLogicBlock}
              handleDeleteLogicBlock={handleDeleteLogicBlock}
            />
          )}

          {/* VIEW 3: LIVE PREVIEW SIMULATOR */}
          {appBuilderView === "preview" && (
            <AppPreviewSimulator
              visibleWidgets={visibleWidgets}
              projectName={projectName}
              activePort={activePort}
              serialTrafficLogs={serialTrafficLogs}
              setSerialTrafficLogs={setSerialTrafficLogs}
              handleUpdateWidget={handleUpdateWidget}
              handleTestHardwareSignal={handleTestHardwareSignal}
              handleOpenAddCrudRecord={handleOpenAddCrudRecord}
              handleOpenEditCrudRecord={handleOpenEditCrudRecord}
              handleDeleteCrudRecord={handleDeleteCrudRecord}
              deviceDetectedLocation={deviceDetectedLocation}
              newAnswerInputs={newAnswerInputs}
              setNewAnswerInputs={setNewAnswerInputs}
              handleSubmitFormAnswer={handleSubmitFormAnswer}
            />
          )}
        </GridItem>

        {/* 3. Right Inspector & Properties Panel */}
        <AppBuilderInspector
          bgCard={bgCard}
          borderColor={borderColor}
          bgPurpleCard={bgPurpleCard}
          inspectorTab={inspectorTab}
          setInspectorTab={setInspectorTab}
          widgets={widgets}
          selectedWidgetId={selectedWidgetId}
          setSelectedWidgetId={setSelectedWidgetId}
          activeWidget={activeWidget}
          projectName={projectName}
          handleAddComponent={handleAddComponent}
          onClearCanvasModalOpen={onClearCanvasModalOpen}
          draggedWidgetId={draggedWidgetId}
          setDraggedWidgetId={setDraggedWidgetId}
          dropInsertIndex={dropInsertIndex}
          setDropInsertIndex={setDropInsertIndex}
          handlePhoneDrop={handlePhoneDrop}
          handleWidgetDragOver={handleWidgetDragOver}
          isDraggingActive={isDraggingActive}
          setIsDraggingOverPhone={setIsDraggingOverPhone}
          handleToggleVisibility={handleToggleVisibility}
          handleMoveWidget={handleMoveWidget}
          handleDeleteWidget={handleDeleteWidget}
          handleUpdateWidget={handleUpdateWidget}
          handleTestHardwareSignal={handleTestHardwareSignal}
          handleOpenAddCrudRecord={handleOpenAddCrudRecord}
          handleOpenEditCrudRecord={handleOpenEditCrudRecord}
          handleDeleteCrudRecord={handleDeleteCrudRecord}
          deviceDetectedLocation={deviceDetectedLocation}
          handleCalibrateLocation={handleCalibrateLocation}
          isDetectingLocation={isDetectingLocation}
          fetchCurrentDeviceLocation={fetchCurrentDeviceLocation}
          handleClearGeologs={handleClearGeologs}
          newQuestionInputs={newQuestionInputs}
          setNewQuestionInputs={setNewQuestionInputs}
          handleAddQuestionToForm={handleAddQuestionToForm}
          handleDeleteQuestionFromForm={handleDeleteQuestionFromForm}
          handleClearFormResponses={handleClearFormResponses}
        />
      </Grid>

      {/* Bottom Status Bar */}
      <Flex
        h="28px"
        px={4}
        bg="#1e3a8a"
        color="white"
        fontSize="11px"
        align="center"
        justify="space-between"
      >
        <HStack spacing={3}>
          <HStack spacing={1.5}>
            <Box w="6px" h="6px" bg="green.400" borderRadius="full" />
            <Text fontWeight="semibold">
              {selectedDevice?.friendlyName || selectedDevice?.name || `ESP32 (${activePort}) Connected`}
            </Text>
          </HStack>
          <Text opacity={0.6}>•</Text>
          <Text>App Builder</Text>
          <Text opacity={0.6}>•</Text>
          <Text>{widgets.length} components</Text>
          <Text opacity={0.6}>•</Text>
          <Text>{logicBlocks.length} automation rules</Text>
        </HStack>
        <Text opacity={0.8} textTransform="capitalize">
          Mode: {appBuilderView === "blocks" ? "Rules" : appBuilderView}
        </Text>
      </Flex>

      {/* Device Switch Location QR Code Modal */}
      <DeviceSwitchLocationQrModal
        isOpen={isLocationQrModalOpen}
        onClose={onLocationQrModalClose}
        bgCard={bgCard}
        borderColor={borderColor}
        bgCyanCard={bgCyanCard}
        locationQrModalData={locationQrModalData}
        deviceDetectedLocation={deviceDetectedLocation}
        liveLedToggle={liveLedToggle}
        companionNetworkMode={companionNetworkMode}
        remoteTunnelState={remoteTunnelState}
        localCompanionUrl={localCompanionUrl}
        companionServerInfo={companionServerInfo}
      />

      {/* Publish Companion App Modal */}
      <PublishCompanionModal
        isOpen={isPublishOpen}
        onClose={onPublishClose}
        projectName={projectName}
        borderColor={borderColor}
        bgCard={bgCard}
        qrPayloadMode={qrPayloadMode}
        setQrPayloadMode={setQrPayloadMode}
        companionNetworkMode={companionNetworkMode}
        widgets={widgets}
        logicBlocks={logicBlocks}
        cleanUiList={cleanUiList}
        cleanLogicsList={cleanLogicsList}
        remoteTunnelState={remoteTunnelState}
        handleToggleCloudRemote={handleToggleCloudRemote}
        activeQrPayload={activeQrPayload}
        webAppQrPayload={webAppQrPayload}
        liveLedToggle={liveLedToggle}
        setLiveLedToggle={setLiveLedToggle}
        handleToggleHardwareLed={handleToggleHardwareLed}
        activePort={activePort}
        ledHardwareError={ledHardwareError}
        handleExportExpoZip={handleExportExpoZip}
        expoSdkVersion={expoSdkVersion}
        handleOpenExpoSnack={handleOpenExpoSnack}
        handleCopyAppJsCode={handleCopyAppJsCode}
        handleExportHtmlWebApp={handleExportHtmlWebApp}
        isCloudActive={isCloudActive}
        resolvedHostIp={resolvedHostIp}
        resolvedHostPort={resolvedHostPort}
        effectiveDeviceId={effectiveDeviceId}
        effectiveDeviceName={effectiveDeviceName}
        effectiveDeviceType={effectiveDeviceType}
      />

      {/* Rule Builder & Hardware Automation Modal */}
      <RuleBuilderModal
        isOpen={isRuleModalOpen}
        onClose={onRuleModalClose}
        editingRule={editingRule}
        setEditingRule={setEditingRule}
        ruleModalTab={ruleModalTab}
        setRuleModalTab={setRuleModalTab}
        widgets={widgets}
        testRuleResult={testRuleResult}
        setTestRuleResult={setTestRuleResult}
        isTestingRule={isTestingRule}
        setIsTestingRule={setIsTestingRule}
        serialTrafficLogs={serialTrafficLogs}
        handleExecuteRule={handleExecuteRule}
        handleSaveRuleModal={handleSaveRuleModal}
        borderColor={borderColor}
        localCompanionUrl={localCompanionUrl}
        selectedDevice={selectedDevice}
        cleanUiList={cleanUiList}
        cleanLogicsList={cleanLogicsList}
        companionServerInfo={companionServerInfo}
        effectiveDeviceId={effectiveDeviceId}
        effectiveDeviceName={effectiveDeviceName}
        effectiveDeviceType={effectiveDeviceType}
        bundleQrPayload={bundleQrPayload}
      />

      {/* App Builder Auxiliary Modals (New App, Rename, Clear Canvas, CRUD Record) */}
      <AppBuilderModals
        isNewAppModalOpen={isNewAppModalOpen}
        onNewAppModalClose={onNewAppModalClose}
        newAppNameInput={newAppNameInput}
        setNewAppNameInput={setNewAppNameInput}
        handleCreateNewApp={handleCreateNewApp}
        isRenameAppModalOpen={isRenameAppModalOpen}
        onRenameAppModalClose={onRenameAppModalClose}
        renameAppNameInput={renameAppNameInput}
        setRenameAppNameInput={setRenameAppNameInput}
        projectName={projectName}
        handleRenameApp={handleRenameApp}
        isClearCanvasModalOpen={isClearCanvasModalOpen}
        onClearCanvasModalClose={onClearCanvasModalClose}
        widgets={widgets}
        handleClearAllWidgets={handleClearAllWidgets}
        isCrudModalOpen={isCrudModalOpen}
        onCrudModalClose={onCrudModalClose}
        editingCrudRecord={editingCrudRecord}
        crudRecordForm={crudRecordForm}
        setCrudRecordForm={setCrudRecordForm}
        handleSaveCrudRecord={handleSaveCrudRecord}
      />
    </Box>
  );
}

export default memo(AppBuilderStudio);
