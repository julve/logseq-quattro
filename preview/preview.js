const toggle = document.querySelector('#theme-toggle');
toggle.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  toggle.textContent = dark ? 'Switch to light' : 'Switch to dark';
});
