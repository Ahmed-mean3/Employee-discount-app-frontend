import { Modal, TextContainer } from "@shopify/polaris";
import { useState, useCallback } from "react";

function DeleteViewModal({ open, onClose, _handleDelete }) {
  const handleDelete = useCallback(() => {
    // Your delete logic here
    console.log("View deleted");
    onClose(); // Close modal after action
    _handleDelete();
  }, [onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Employee" // Customize title here
      primaryAction={{
        content: "Yes", // Customize the primary action button text here
        destructive: true,
        onAction: handleDelete,
      }}
      secondaryActions={[
        {
          content: "No", // Customize the cancel button text here
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <TextContainer>
          <p>
            Are you sure you want to delete this employee? This action cannot be
            undone.
          </p>
        </TextContainer>
      </Modal.Section>
    </Modal>
  );
}

export default DeleteViewModal;
