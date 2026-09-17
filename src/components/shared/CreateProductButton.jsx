import { useState, useEffect, useCallback, useRef } from "react";
import { 
    Button, 
    Modal, 
    ModalOverlay, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalCloseButton 
} from "@chakra-ui/react";
import ProductDefinition from "../CreateProduct";
import ProductEditModal from "../Product/ProductEdit/ProductEditModal";
import { useProject } from "../../ProjectContext";
import { checkProductDefinition } from "../EmbeddedFileManagement/EmbeddedFileManagement";

/**
 * CreateProductButton - Reusable button that dynamically toggles between:
 * 1. "Create Product": Shown after project creation.
 * 2. "Define Product": Shown if user missed/cancelled create product without defining.
 * 3. "View Product": Shown once product components are defined.
 */
const CreateProductButton = () => {
    const { 
        activeProductId, 
        activeProductName, 
        activeProjectName,
        activeProjectId
    } = useProject();

    const [isModalOpen, setModalOpen] = useState(false);
    const [isProductDefined, setIsProductDefined] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMissed, setIsMissed] = useState(false);
    const [projectStatus, setProjectStatus] = useState(null);
    const isSubmittedRef = useRef(false);

    // Resolve current IDs from context or localStorage
    const currentProjectId = activeProjectId || localStorage.getItem("activeProjectId") || "";
    const currentProductId = activeProductId || localStorage.getItem("activeProductId") || currentProjectId || "";
    const currentProductName = activeProductName || activeProjectName || localStorage.getItem("activeProjectName") || "Product";

    const syncStatusFromStorage = useCallback(() => {
        const projId = activeProjectId || localStorage.getItem("activeProjectId") || "";
        if (projId) {
            const missed = localStorage.getItem(`innoide:product_create_missed_${projId}`) === "true";
            const status = localStorage.getItem(`innoide:project_status_${projId}`);
            setIsMissed(missed);
            setProjectStatus(status);
        } else {
            setIsMissed(false);
            setProjectStatus(null);
        }
    }, [activeProjectId]);

    const fetchStatus = useCallback(async () => {
        const prodId = activeProductId || localStorage.getItem("activeProductId") || activeProjectId || localStorage.getItem("activeProjectId");
        const projId = activeProjectId || localStorage.getItem("activeProjectId");

        syncStatusFromStorage();

        if (!prodId) {
            setIsProductDefined(false);
            return;
        }

        setIsLoading(true);
        try {
            await checkProductDefinition(prodId, (defined) => {
                setIsProductDefined(Boolean(defined));
            }, projId);
        } catch (error) {
            console.error("[CreateProductButton] Failed to check product definition:", error);
            setIsProductDefined(false);
        } finally {
            setIsLoading(false);
        }
    }, [activeProductId, activeProjectId, syncStatusFromStorage]);

    // Check status on mount, ID change, or project switch
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Listen to refresh events across the application
    useEffect(() => {
        const handleRefresh = () => {
            fetchStatus();
            syncStatusFromStorage();
        };

        window.addEventListener("storage", handleRefresh);
        window.addEventListener("product-definition-changed", handleRefresh);
        window.addEventListener("innoide:refresh-filesystem", handleRefresh);
        window.addEventListener("project:created", handleRefresh);

        return () => {
            window.removeEventListener("storage", handleRefresh);
            window.removeEventListener("product-definition-changed", handleRefresh);
            window.removeEventListener("innoide:refresh-filesystem", handleRefresh);
            window.removeEventListener("project:created", handleRefresh);
        };
    }, [fetchStatus, syncStatusFromStorage]);

    // Open modal
    const handleOpenModal = useCallback(() => {
        isSubmittedRef.current = false;
        setModalOpen(true);
    }, []);

    // Handle user closing/skipping create product without submitting
    const handleModalClose = useCallback(() => {
        if (!isSubmittedRef.current && currentProjectId) {
            // User missed or dismissed create product -> switch to "Define Product"
            localStorage.setItem(`innoide:product_create_missed_${currentProjectId}`, "true");
            localStorage.setItem(`innoide:project_status_${currentProjectId}`, "missed");
            setIsMissed(true);
            setProjectStatus("missed");
            window.dispatchEvent(new CustomEvent("product-definition-changed"));
        }
        setModalOpen(false);
    }, [currentProjectId]);

    // Handle successful product creation/definition
    const handleSuccess = useCallback(() => {
        isSubmittedRef.current = true;
        if (currentProjectId) {
            localStorage.setItem(`innoide:project_status_${currentProjectId}`, "completed");
            localStorage.removeItem(`innoide:product_create_missed_${currentProjectId}`);
            setIsMissed(false);
            setProjectStatus("completed");
        }
        const prodId = localStorage.getItem("activeProductId") || activeProductId;
        if (prodId) {
            checkProductDefinition(prodId, (defined) => {
                setIsProductDefined(Boolean(defined));
            }, currentProjectId);
        } else {
            setIsProductDefined(true);
        }
        setModalOpen(false);
        
        // Notify other components across the app
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("innoide:refresh-filesystem"));
        window.dispatchEvent(new CustomEvent("product-definition-changed"));
    }, [activeProductId, currentProjectId]);

    // 1. Loading State: If checking status with a known product ID
    if (isLoading && isProductDefined === null && currentProductId) {
        return (
            <Button
                size="sm"
                colorScheme="teal"
                borderRadius="full"
                height="32px"
                px={6}
                isLoading={true}
                loadingText="Checking..."
                variant="outline"
                isDisabled={true}
            />
        );
    }

    // 2. If product definition exists in the backend: Show "View Product" button
    if (isProductDefined) {
        return (
            <ProductEditModal
                productID={currentProductId || "default_product"}
                productName={currentProductName}
                setIsProductDefined={(defined) => {
                    setIsProductDefined(Boolean(defined));
                    window.dispatchEvent(new CustomEvent("product-definition-changed"));
                }}
            />
        );
    }

    // 3. If product is NOT defined:
    // Determine whether to show "Create Product" or "Define Product".
    // After creating project: show "Create Product".
    // If user missed/skipped create product: only "Define Product" should come.
    const isNewProject = (projectStatus === "new" || !projectStatus) && !isMissed;
    const buttonLabel = isNewProject ? "Create Product" : "Define Product";
    const modalTitle = `${buttonLabel}: ${currentProductName}`;

    return (
        <>
            <Button
                size="sm"
                bg="#2563eb"
                color="#ffffff"
                _hover={{ bg: "#1d4ed8", transform: "translateY(-1px)", boxShadow: "md" }}
                _active={{ transform: "translateY(0)" }}
                borderRadius="full"
                height="32px"
                px={5}
                onClick={handleOpenModal}
                isLoading={isLoading}
                leftIcon={<span style={{ fontWeight: "bold", fontSize: "14px" }}>+</span>}
            >
                {buttonLabel}
            </Button>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={handleModalClose} size="6xl" scrollBehavior="inside">
                    <ModalOverlay backdropFilter="blur(8px)" />
                    <ModalContent bg="#f8fafc" maxW="1150px" borderRadius="xl" overflow="hidden">
                        <ModalHeader bg="white" borderBottom="1px solid" borderColor="gray.200" py={3} px={6} fontSize="md" fontWeight="bold">
                            {buttonLabel}
                        </ModalHeader>
                        <ModalCloseButton top="10px" right="16px" />
                        <ModalBody p={0}>
                            <ProductDefinition
                                initialStep={2}
                                onClose={handleModalClose}
                                onSuccess={handleSuccess}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </>
    );
};

export default CreateProductButton;
