import { useState, useEffect, useCallback } from "react";
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
 * CreateProductButton - A reusable component that handles both product creation and viewing.
 * It dynamically toggles between "Create Product", "Define Product", and "View Product" based on 
 * whether a product is associated with the active project and if its definition exists in the backend.
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



    // Synchronize local state with backend when activeProductId or activeProjectId changes
    useEffect(() => {
        const fetchStatus = async () => {
            if (!activeProductId) {
                console.log(`[CreateProductButton] No activeProductId for project ${activeProjectId}`);
                setIsProductDefined(false);
                return;
            }

            // Only reset to null if we are actually about to fetch for a new ID
            // or if we haven't checked yet.
            setIsLoading(true);
            
            try {
                console.log(`[CreateProductButton] Checking definition for product: ${activeProductId} in project: ${activeProjectId}`);
                await checkProductDefinition(activeProductId, (defined) => {
                    console.log(`[CreateProductButton] Definition status for ${activeProductId}: ${defined}`);
                    setIsProductDefined(defined);
                }, activeProjectId);
            } catch (error) {
                console.error("Failed to check product definition:", error);
                setIsProductDefined(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [activeProductId, activeProjectId]);

    // Handle successful product creation/definition
    const handleSuccess = useCallback(() => {
        // Refresh definition status immediately
        if (activeProductId) {
            checkProductDefinition(activeProductId, setIsProductDefined);
        }
        setModalOpen(false);
        
        // Notify other components (legacy support for storage listeners)
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("innoide:refresh-filesystem"));
    }, [activeProductId]);

    // If there is no active project or no active product, we shouldn't show any product-related buttons.
    if (!activeProjectId || !activeProductId || !activeProjectName || activeProjectName === "Untitled Project") {
        return null;
    }

    // 1. Loading State: Show a consistent loading pill while checking definition
    if (activeProductId && isProductDefined === null) {
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

    // 2. If we have a product ID AND it is defined in the backend, show the View Product Modal
    if (activeProductId && isProductDefined) {
        return (
            <ProductEditModal
                productID={activeProductId}
                productName={activeProductName || activeProjectName || "Product"}
                setIsProductDefined={setIsProductDefined}
            />
        );
    }

    // 2. If we have no product OR it's not defined, show the Create/Define button
    return (
        <>
            <Button
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                height="32px"
                px={6}
                onClick={() => setModalOpen(true)}
                isLoading={isLoading}
                leftIcon={<span>+</span>}
                _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                _active={{ transform: "translateY(0)" }}
            >
                {activeProductId ? "Define Product" : "Create Product"}
            </Button>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} size="full" scrollBehavior="inside">
                    <ModalOverlay backdropFilter="blur(8px)" />
                    <ModalContent bg="gray.100">
                        <ModalHeader bg="white" borderBottom="1px solid" borderColor="gray.200">
                            {activeProductId ? "Define Product" : "Create New Product"}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody p={0}>
                            <ProductDefinition
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
