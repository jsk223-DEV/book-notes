function goBack() {
	if (window.history.length > 1) {
		window.history.back();
	} else {
		window.location.href = '/';
	}
}

function loadCovers(save) {
	const limit = 8;
	const covers = save.dataset.covers.split(',');
	const offset = parseInt(save.dataset.offset);
	const loadButton = document.querySelector('#bd_load_covers');
	let coverCon = document.querySelector('#bd_covers');
	//console.log(covers);
	coverCon.removeChild(loadButton);
	if (covers.length == 1 && covers[0] == '') {
		let newHtml = /*html*/ `
			<input
				type="radio"
				id="cover_no_cover"
				value=""
				name="cover"
				style="display: none" 
                class="bd-cover-radio"
                checked/>
            <label for="cover_no_cover}">
				<img
					class="cover-option"
					src="images/noBookCover.jpg" />
			</label>`;
		coverCon.innerHTML += newHtml;
		//loadButton.style.display = 'none';
		return;
	}
	let first = true;
	for (let i = offset; i < offset + limit; i++) {
		if (covers[i] == -1) {
			continue;
		}
		let checked = false;
		if (
			(save.dataset.selected && save.dataset.selected == covers[i]) ||
			(!save.dataset.selected && first)
		) {
			checked = true;
		}
		let newHtml = /*html*/ `
			<input
            type="radio"
            id="cover_${covers[i]}"
            value="${covers[i]}"
            name="cover"
            style="display: none" 
            class="bd-cover-radio"
            ${checked ? 'checked' : ''}/>
            <label for="cover_${covers[i]}">
                <img
                class="cover-option"
                src="https://covers.openlibrary.org/b/id/${covers[i]}-M.jpg" />
			</label>`;
		coverCon.innerHTML += newHtml;
		if (i == covers.length - 1) {
			// loadButton.style.display = 'none';
			return;
		}
		first = false;
	}
	coverCon.appendChild(loadButton);
	save.dataset.offset = offset + limit;
}
function updateRating(ele) {
	let index = ele.value;
	ele.setAttribute('checked', true);
	let radios = document.querySelectorAll('.bd-rating-radio');
	for (let i = 0; i < radios.length; i++) {
		if (radios[i].classList.contains('active-rating')) {
			radios[i].classList.remove('active-rating');
		}
		if (i < index) {
			radios[i].classList.add('active-rating');
		}
	}
}

function submitSearch(parent) {
	const type = parent.querySelector('#type_select');
	const search = parent.querySelector('#search_input');
	window.location.href = `/search?type=${type.value}&search=${search.value}`;
}

function toggleTheme() {
	let currentTheme = sessionStorage.getItem('theme') || 'dark-theme';
	let newTheme = 'light-theme';
	if (currentTheme == 'light-theme') {
		newTheme = 'dark-theme';
	}
	sessionStorage.setItem('theme', newTheme);
	document.body.classList.remove(currentTheme);
	document.body.classList.add(newTheme);
}

document.body.classList.add(sessionStorage.getItem('theme') || 'dark-theme');
