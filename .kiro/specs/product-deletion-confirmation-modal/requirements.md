# Requirements Document: Product Deletion Confirmation Modal

## Overview

This feature implements a custom confirmation modal to replace the browser's native `confirm()` dialog for product deletion in the vendor dashboard. The modal provides a better user experience with branded styling, clear messaging, and prevents accidental deletions.

## Functional Requirements

### 1. Modal Component Creation

**1.1** The system SHALL provide a reusable `ConfirmationModal` component that can be used across the application for confirmation dialogs.

**1.2** The `ConfirmationModal` component SHALL accept the following props:
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback invoked when modal should close
- `onConfirm` (function): Callback invoked when user confirms action
- `title` (string): Modal heading text
- `message` (string): Main confirmation message
- `confirmText` (optional string): Custom text for confirm button
- `cancelText` (optional string): Custom text for cancel button
- `isDangerous` (optional boolean): Styles confirm button as destructive
- `isLoading` (optional boolean): Shows loading state

**1.3** The `ConfirmationModal` component SHALL render using React Portal (`ReactDOM.createPortal`) to ensure proper z-index layering.

**1.4** The modal SHALL be rendered as a direct child of `document.body` when open.

### 2. Modal Visual Design

**2.1** The modal SHALL display a semi-transparent backdrop overlay that covers the entire viewport.

**2.2** The backdrop SHALL have a dark overlay (e.g., `bg-black/50` or `bg-slate-900/75`).

**2.3** The modal container SHALL be centered on the screen both horizontally and vertically.

**2.4** The modal container SHALL have:
- White background (`bg-white`)
- Rounded corners (`rounded-2xl` or `rounded-xl`)
- Box shadow for depth
- Maximum width appropriate for mobile and desktop (e.g., `max-w-md`)
- Padding around content

**2.5** The modal SHALL display a warning icon at the top:
- Amber/yellow color for general warnings
- Red color when `isDangerous` is true

**2.6** The modal SHALL display the title in a prominent heading style (e.g., `text-lg` or `text-xl`, `font-semibold`).

**2.7** The modal SHALL display the confirmation message below the title in readable body text.

**2.8** The modal SHALL display action buttons at the bottom:
- Cancel button: Left-aligned, secondary styling (gray/slate)
- Confirm button: Right-aligned or next to cancel
- When `isDangerous` is true: Confirm button styled in red (`bg-red-500`)
- When `isDangerous` is false: Confirm button styled in emerald (`bg-emerald-500`)

**2.9** The confirm button SHALL display a loading spinner when `isLoading` is true.

**2.10** Both buttons SHALL be disabled when `isLoading` is true.

### 3. Modal Interaction Behavior

**3.1** When the modal is open, the system SHALL prevent scrolling of the page body by setting `document.body.style.overflow = "hidden"`.

**3.2** When the modal closes, the system SHALL restore body scrolling by removing the overflow style.

**3.3** Clicking the Cancel button SHALL invoke the `onClose` callback and close the modal.

**3.4** Clicking the Confirm button SHALL invoke the `onConfirm` callback.

**3.5** Clicking the backdrop (outside the modal container) SHALL invoke the `onClose` callback and close the modal, UNLESS `isLoading` is true.

**3.6** Pressing the Escape key SHALL invoke the `onClose` callback and close the modal, UNLESS `isLoading` is true.

**3.7** Clicking inside the modal container SHALL NOT close the modal (event propagation stopped).

**3.8** When `isLoading` is true, the system SHALL ignore backdrop clicks and Escape key presses.

### 4. Delete Product Button Component

**4.1** The system SHALL provide a client component `DeleteProductButton` that manages the delete confirmation flow.

**4.2** The `DeleteProductButton` component SHALL accept the following props:
- `productId` (string): The UUID of the product to delete
- `productName` (string): The display name of the product

**4.3** The `DeleteProductButton` SHALL render a delete icon button matching the existing product card button styling.

**4.4** When the delete button is clicked, the system SHALL open the `ConfirmationModal` with:
- Title: "Delete Product"
- Message: 'Are you sure you want to delete "[productName]"? This action cannot be undone.'
- Confirm text: "Delete"
- Cancel text: "Cancel"
- `isDangerous`: true

**4.5** When the user confirms deletion, the system SHALL:
- Set loading state to true
- Call the `deleteProduct` server action with the `productId`
- Wait for the server action to complete
- Close the modal on success
- Display error message on failure

**4.6** When the user cancels deletion, the system SHALL close the modal without calling the server action.

### 5. Products Page Integration

**5.1** The products page (`app/dashboard/products/page.tsx`) SHALL replace the inline delete form and browser `confirm()` dialog with the `DeleteProductButton` component.

**5.2** Each product card SHALL render a `DeleteProductButton` with the product's ID and name.

**5.3** The visual design and layout of the product card SHALL remain unchanged except for the delete button implementation.

**5.4** After successful product deletion, the page SHALL automatically revalidate and re-render to remove the deleted product from the list.

### 6. Error Handling

**6.1** If the `deleteProduct` server action fails, the system SHALL:
- Display an error message to the user (toast notification or alert)
- Log the error to the console for debugging
- Set loading state to false
- Keep the modal open to allow retry

**6.2** If the `productId` is invalid (null, undefined, or empty), the system SHALL:
- Prevent the server action call
- Display an error message
- Close the modal

**6.3** If the component unmounts while a deletion is in progress, the system SHALL:
- Not attempt to update state after unmount
- Allow the server action to complete in the background
- Clean up all event listeners

### 7. Accessibility Requirements

**7.1** The modal container SHALL have `role="dialog"` attribute.

**7.2** The modal container SHALL have `aria-labelledby` pointing to the title element.

**7.3** The modal container SHALL have `aria-describedby` pointing to the message element.

**7.4** The modal SHALL have `aria-modal="true"` attribute.

**7.5** When the modal opens, focus SHALL be trapped within the modal (keyboard navigation stays inside).

**7.6** The Escape key SHALL close the modal when not in loading state.

**7.7** All interactive elements (buttons) SHALL be keyboard accessible.

**7.8** Button states (disabled, loading) SHALL be communicated to screen readers via `aria-disabled` or `aria-busy`.

### 8. Reusability Requirements

**8.1** The `ConfirmationModal` component SHALL be placed in a shared location (`app/ui/confirmation-modal.tsx`) for use across the application.

**8.2** The modal component SHALL NOT contain product-specific logic or dependencies.

**8.3** The modal component SHALL be usable for other confirmation scenarios (e.g., discount deletion, order cancellation, status changes).

**8.4** The component API SHALL be flexible enough to support both dangerous (destructive) and non-dangerous actions.

## Non-Functional Requirements

### 9. Performance Requirements

**9.1** Opening the modal SHALL complete within 100ms to feel instantaneous.

**9.2** The modal animation (fade-in) SHALL be smooth and not cause layout jank.

**9.3** The component SHALL NOT cause unnecessary re-renders of sibling product cards.

**9.4** Event listeners SHALL be properly cleaned up to prevent memory leaks.

### 10. Browser Compatibility

**10.1** The modal SHALL work in all modern browsers (Chrome, Firefox, Safari, Edge) within the last 2 major versions.

**10.2** The modal SHALL work on mobile devices (iOS Safari, Chrome Mobile).

**10.3** The React Portal API SHALL be used for DOM rendering (requires React 16+).

### 11. Security Requirements

**11.1** Product names displayed in the modal SHALL be safely rendered to prevent XSS attacks.

**11.2** The `deleteProduct` server action SHALL validate user authorization before performing deletion.

**11.3** Product ID validation SHALL occur on the server side (client-side validation is UX only).

**11.4** The modal SHALL NOT expose sensitive error details to the user interface.

### 12. Maintainability Requirements

**12.1** The code SHALL be written in TypeScript with full type safety.

**12.2** Component props SHALL have explicit TypeScript interfaces.

**12.3** The code SHALL follow existing project conventions and styling patterns.

**12.4** The component SHALL use Tailwind CSS classes consistent with the existing design system.

### 13. Testing Requirements

**13.1** The `ConfirmationModal` component SHALL have unit tests covering:
- Rendering when open/closed
- Callback invocation (onClose, onConfirm)
- Backdrop and Escape key handling
- Loading state behavior
- Button styling based on `isDangerous` prop

**13.2** The `DeleteProductButton` component SHALL have unit tests covering:
- Modal open on button click
- Correct product name in modal message
- Server action call on confirm
- Error handling

**13.3** Integration tests SHALL verify the complete delete flow from button click to product removal.

## Out of Scope

The following items are explicitly out of scope for this feature:

**14.1** Undo functionality after deletion (products are permanently deleted)

**14.2** Batch deletion of multiple products

**14.3** Soft delete or archive functionality

**14.4** Custom animations beyond basic fade-in/fade-out

**14.5** Focus management beyond basic focus trap

**14.6** Toast notification component (error messages use existing notification system or simple alerts)

**14.7** Confirmation for other entity types (discounts, orders, etc.) - though the modal component supports it, implementation for other types is not included in this feature

## Success Criteria

**15.1** Users no longer see browser `confirm()` dialogs when deleting products.

**15.2** Users see a branded, styled confirmation modal with the product name.

**15.3** Users can cancel deletion by clicking Cancel, clicking backdrop, or pressing Escape.

**15.4** Users see loading state while deletion is in progress.

**15.5** Users cannot accidentally close the modal during deletion.

**15.6** The modal is visually consistent with the existing emerald theme and design system.

**15.7** The modal component can be reused for other confirmation scenarios with minimal changes.

**15.8** No console errors or warnings in normal usage.

**15.9** Accessibility tools (screen readers) can properly interact with the modal.

**15.10** The feature works correctly on both desktop and mobile browsers.
