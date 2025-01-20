
const urlParams = new URLSearchParams(window.location.search);
const key = urlParams.get('key');

window.onload = async () => {
  await init();
}

async function init() {
  try {
    const res = await fetch(`/rookie/api/test/player/prob/${key}`);
    const {project} = await res.json();
    console.log(key)
    
    Entry.loadProject(project);
  
  } catch (error) {
    console.log(error);
    alert(`오류: ${error}`);
  }
}