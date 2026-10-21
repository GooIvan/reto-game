// Modal "Acerca del proyecto" del menú de inicio.
// Escape ya lo cierra de forma nativa (<dialog>).
export function setupInfoModal() {
  const modal = document.getElementById('info-modal');
  const openButton = document.getElementById('info-button');
  const closeButton = document.getElementById('info-close');

  openButton.addEventListener('click', () => modal.showModal());
  closeButton.addEventListener('click', () => modal.close());

  // Cerrar al hacer clic en el fondo oscuro (el padding está en .info-content,
  // así que un clic con target === modal solo puede venir del backdrop)
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.close();
  });
}
