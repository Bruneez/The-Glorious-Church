export default function SidebarBackdrop({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <button
      type="button"
      className="fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] right-0 bottom-0 left-0 bg-black/50 z-[45] xl:hidden cursor-default"
      onClick={onClose}
      aria-label="Close navigation menu"
      tabIndex={-1}
    />
  );
}
