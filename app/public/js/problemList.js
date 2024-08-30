const clearSvg = `
		<svg xmlns="http://www.w3.org/2000/svg" height="0.8rem" width="0.8rem" viewBox="0 0 24 24" fill="#4f80ff">
			<path d="M12 2C6.47 3 3 6.47 3 12s4.47 9 9 9 9-4.47 9-9S17.53 3 12 2z" fill="#EFEFEF"/>
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
		</svg>
	`;


window.onload = async () => {
	await init();
  setSearchEvent();
  setNewProbEvent();
}

async function init() {
  await loadPage(1, '');
}

function setSearchEvent() {
	let delayedSearch;
	$('#inputSearch').on('input', () => {
		clearTimeout(delayedSearch);
		delayedSearch = setTimeout(async () => {
			const query = $('#inputSearch').val();
			await loadPage(1, query);
			
		}, 400);
	});
}

function setNewProbEvent() {
  $('#btnNewProb').on('click', () => {
    window.location.href = '/problems/new';
	});
}

const oneLineTag = (tag, options) => Object.assign(document.createElement(tag), options);
async function loadPage(page, query) {
	try {
		const res = await fetch(`/api/problems?page=${page}&query=${query}`);
		const { meta, problems } = await res.json();

    $('#probCount').text(meta.totalPost);
    if (problems.length > 0) {
      setProblemTable(problems);
      setPagination(meta, query);
    }
    else {
      $('#probTable').empty();
      $('#pagination').empty();
    }

    
	} catch (error) {
		console.log(error);
	}
}


function setProblemTable(problems) {
  $('#probTable').empty();

  for (let prob of problems) {
    const tr = document.createElement('tr');
    
    const tdIdx = document.createElement('td');
    const tdTitle = document.createElement('td');
    const tdLevel = document.createElement('td');
    const tdTags = document.createElement('td');
    tdTitle.style.cursor = 'pointer';
    tdTitle.style.textAlign = 'left';
    tdTitle.onclick = () => window.location.href=`/problems/ws/${prob.key}`;

    tdIdx.textContent = prob.key;
    tdTitle.innerHTML = prob.title + (prob.clear?clearSvg:'');
    tdLevel.textContent = prob.level;
    prob.tags.forEach((name) => {
      const btn = document.createElement('button');
      btn.classList.add('btn-tag');
      btn.onclick = () => {
        $('#inputSearch').val(name);
        loadPage(1, name);
      };
      btn.textContent = name;
      tdTags.appendChild(btn);
    });

    tr.appendChild(tdIdx);
    tr.appendChild(tdTitle);
    tr.appendChild(tdLevel);
    tr.appendChild(tdTags);

    $('#probTable').append(tr);
  }
}

function setPagination(meta, query) {
  $('#pagination').empty();

  function getPageItem(innerHtml, clickEvent) {
    const li = document.createElement('li'); li.classList.add('page-item');
    const a = document.createElement('a'); a.classList.add('page-link');
    li.append(a);
    a.innerHTML = innerHtml;
    a.onclick = clickEvent;
    return li;
  }

  let temp = meta.currentPage-meta.maxPage;
  const laquo = getPageItem(`<span aria-hidden="true">&laquo;</span>`, () => {
    loadPage(temp>0 ? temp:1, query);
  });
  
  temp = meta.currentPage+meta.maxPage;
  const raquo = getPageItem(`<span aria-hidden="true">&raquo;</span>`, () => {
    loadPage(temp<=meta.totalPage? temp:meta.totalPage, query);
  });

  $('#pagination').append(laquo);
  for (let page=meta.startPage; page<=meta.endPage; page++) {
    const p = getPageItem(page, () => {loadPage(page, query);});
    $('#pagination').append(p);
  }
  $('#pagination').append(raquo);
}
