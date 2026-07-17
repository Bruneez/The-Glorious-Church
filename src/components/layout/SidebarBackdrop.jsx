export default function SidebarBackdrop({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <button
      type="button"
      className="fixed top-[9rem] right-0 bottom-0 left-0 bg-black/50 z-[45] lg:hidden cursor-default"
      onClick={onClose}
      aria-label="Close navigation"
      tabIndex={-1}
    />
  );
}
