const copyInstallSqla = document.getElementById('copy-install-sqla');

if (copyInstallSqla) {
  copyInstallSqla.addEventListener('click', () => {
    navigator.clipboard.writeText('pip install sqla-lite').then(() => {
      copyInstallSqla.textContent = 'copiado';
      setTimeout(() => {
        copyInstallSqla.textContent = 'copiar';
      }, 2000);
    });
  });
}
